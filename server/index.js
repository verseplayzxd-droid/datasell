const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabase = require('./config/supabase');
const authMiddleware = require('./middleware/auth');
const startSellOrderCron = require('./cron/sellOrderCron');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const sellRoutes = require('./routes/sell');
const walletRoutes = require('./routes/wallet');
const referralRoutes = require('./routes/referral');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected user routes
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/sell', authMiddleware, sellRoutes);
app.use('/api/wallet', authMiddleware, walletRoutes);
app.use('/api/withdraw', authMiddleware, walletRoutes);
app.use('/api/referral', authMiddleware, referralRoutes);

// Admin routes (login is public inside router, rest are protected)
app.use('/api/admin', adminRoutes);

// Get active announcements (public for user dashboard)
app.get('/api/announcements/active', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('id, title, message, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[ANNOUNCEMENTS] Error:', error);
      return res.json([]);
    }
    res.json(data || []);
  } catch (err) {
    console.error('[ANNOUNCEMENTS] Fatal error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'DataSell API is running', version: '1.0.0' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR]', err.stack || err);
  res.status(500).json({ error: 'Internal server error.' });
});

// Seed admin user on startup
async function seedAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    console.log('[SEED] Checking admin user...');
    console.log('[SEED] Admin email:', adminEmail);
    console.log('[SEED] Admin password:', adminPassword ? `"${adminPassword.substring(0,3)}..." (${adminPassword.length} chars)` : '❌ NOT SET');

    if (!adminEmail || !adminPassword) {
      console.error('[SEED] ❌ ADMIN_EMAIL or ADMIN_PASSWORD env var is missing!');
      return;
    }

    const hash = await bcrypt.hash(adminPassword, 10);
    
    // Verify the hash works before storing
    const testMatch = await bcrypt.compare(adminPassword, hash);
    console.log('[SEED] Hash self-test:', testMatch ? '✅ PASS' : '❌ FAIL');

    const { data: existing, error: checkErr } = await supabase
      .from('admins')
      .select('id')
      .eq('email', adminEmail)
      .maybeSingle();

    if (checkErr) {
      console.error('[SEED] Admin check error:', checkErr);
      return;
    }

    if (!existing) {
      const { error: insertErr } = await supabase.from('admins').insert({
        email: adminEmail,
        password_hash: hash,
        name: 'Aryan Admin',
      });
      if (insertErr) {
        console.error('[SEED] Admin insert error:', insertErr);
      } else {
        console.log('✅ Admin user seeded successfully.');
      }
    } else {
      const { error: updateErr } = await supabase
        .from('admins')
        .update({ password_hash: hash })
        .eq('id', existing.id);
      if (updateErr) {
        console.error('[SEED] Admin password update error:', updateErr);
      } else {
        console.log('✅ Admin password hash updated.');
      }
    }

    // Read back and verify the stored hash actually works
    const { data: verify } = await supabase
      .from('admins')
      .select('password_hash')
      .eq('email', adminEmail)
      .maybeSingle();
    
    if (verify) {
      const finalCheck = await bcrypt.compare(adminPassword, verify.password_hash);
      console.log('[SEED] Final DB verify:', finalCheck ? '✅ Login will work' : '❌ Hash mismatch in DB!');
    }

    // Seed default settings if not exists
    const { data: settings, error: settingsErr } = await supabase
      .from('app_settings')
      .select('id')
      .eq('id', 1)
      .maybeSingle();

    if (settingsErr) {
      console.error('[SEED] Settings check error:', settingsErr);
      return;
    }

    if (!settings) {
      const { error: settingsInsertErr } = await supabase.from('app_settings').insert({
        id: 1,
        min_withdrawal: 200,
        rate_per_gb: 200,
        sell_hours_per_gb: 24,
        maintenance_mode: false,
        app_name: 'DataSell',
      });
      if (settingsInsertErr) {
        console.error('[SEED] Settings insert error:', settingsInsertErr);
      } else {
        console.log('✅ Default settings seeded.');
      }
    }
  } catch (err) {
    console.error('⚠️  Seed error:', err.message);
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 DataSell API running on http://localhost:${PORT}`);
  console.log(`📡 CORS origin: ${process.env.CLIENT_URL || '*'}`);
  console.log(`🔗 Supabase URL: ${process.env.SUPABASE_URL ? '✅ Set' : '❌ MISSING!'}`);
  console.log(`🔑 JWT Secret: ${process.env.JWT_SECRET ? '✅ Set' : '❌ MISSING!'}`);
  await seedAdmin();
  startSellOrderCron();
});
