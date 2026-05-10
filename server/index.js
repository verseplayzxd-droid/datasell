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
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

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
    const { data } = await supabase
      .from('announcements')
      .select('id, title, message, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    res.json(data || []);
  } catch (err) {
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

// Seed admin user on startup
async function seedAdmin() {
  try {
    const { data: existing } = await supabase
      .from('admins')
      .select('id')
      .eq('email', process.env.ADMIN_EMAIL)
      .limit(1);

    if (!existing || existing.length === 0) {
      const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      await supabase.from('admins').insert({
        email: process.env.ADMIN_EMAIL,
        password_hash: hash,
        name: 'Aryan Admin',
      });
      console.log('✅ Admin user seeded successfully.');
    } else {
      console.log('✅ Admin user already exists.');
    }

    // Seed default settings if not exists
    const { data: settings } = await supabase.from('app_settings').select('id').eq('id', 1).limit(1);
    if (!settings || settings.length === 0) {
      await supabase.from('app_settings').insert({
        id: 1,
        min_withdrawal: 200,
        rate_per_gb: 200,
        sell_hours_per_gb: 24,
        maintenance_mode: false,
        app_name: 'DataSell',
      });
      console.log('✅ Default settings seeded.');
    }
  } catch (err) {
    console.error('⚠️  Seed error:', err.message);
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 DataSell API running on http://localhost:${PORT}`);
  await seedAdmin();
  startSellOrderCron();
});
