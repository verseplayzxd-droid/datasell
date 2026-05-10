const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { generateReferralCode } = require('../utils/helpers');

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, phone, email, password, referralCode } = req.body;
    console.log('[AUTH] Register attempt:', { name, phone, email });

    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Name, phone, and password are required.' });
    }

    // Check existing user by phone
    const { data: existingPhone, error: phoneErr } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();

    if (phoneErr) {
      console.error('[AUTH] Phone check error:', phoneErr);
      return res.status(500).json({ error: 'Server error checking phone.' });
    }
    if (existingPhone) {
      return res.status(409).json({ error: 'Phone number already registered.' });
    }

    // Check existing user by email (if provided)
    if (email) {
      const { data: existingEmail, error: emailErr } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (emailErr) {
        console.error('[AUTH] Email check error:', emailErr);
        return res.status(500).json({ error: 'Server error checking email.' });
      }
      if (existingEmail) {
        return res.status(409).json({ error: 'Email already registered.' });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRefCode = generateReferralCode(name);

    console.log('[AUTH] Inserting new user...');
    const { data: newUser, error: insertErr } = await supabase
      .from('users')
      .insert({
        name,
        phone,
        email: email || null,
        password_hash: passwordHash,
        referral_code: userRefCode,
        referred_by: referralCode || null,
      })
      .select()
      .single();

    if (insertErr) {
      console.error('[AUTH] Register insert error:', insertErr);
      if (insertErr.code === '23505') {
        return res.status(409).json({ error: 'Phone or email already registered.' });
      }
      return res.status(500).json({ error: 'Registration failed: ' + (insertErr.message || 'Unknown error') });
    }

    console.log('[AUTH] User created:', newUser.id);

    // Handle referral bonus
    if (referralCode) {
      try {
        const { data: referrer } = await supabase
          .from('users')
          .select('id, balance, total_earned')
          .eq('referral_code', referralCode)
          .maybeSingle();

        if (referrer) {
          await supabase
            .from('users')
            .update({
              balance: parseFloat(referrer.balance) + 50,
              total_earned: parseFloat(referrer.total_earned) + 50,
            })
            .eq('id', referrer.id);

          await supabase.from('referrals').insert({
            referrer_id: referrer.id,
            referred_id: newUser.id,
            bonus_amount: 50,
            status: 'paid',
          });

          await supabase.from('transactions').insert({
            user_id: referrer.id,
            type: 'referral',
            amount: 50,
            description: `Referral bonus for inviting ${name}`,
            status: 'completed',
          });

          console.log('[AUTH] Referral bonus credited to:', referrer.id);
        }
      } catch (refErr) {
        console.error('[AUTH] Referral processing error (non-fatal):', refErr);
      }
    }

    const token = jwt.sign(
      { userId: newUser.id, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('[AUTH] Register success for:', newUser.id);
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        referralCode: newUser.referral_code,
        balance: newUser.balance,
        totalEarned: newUser.total_earned,
      },
    });
  } catch (err) {
    console.error('[AUTH] Register fatal error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('[AUTH] Login attempt:', email);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email/phone and password are required.' });
    }

    // Search by email first
    let { data: user, error: findErr } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    // If not found by email, try phone
    if (!user) {
      const { data: phoneUser, error: phoneErr } = await supabase
        .from('users')
        .select('*')
        .eq('phone', email)
        .maybeSingle();

      if (phoneErr) {
        console.error('[AUTH] Phone lookup error:', phoneErr);
      }
      user = phoneUser;
    }

    if (findErr) {
      console.error('[AUTH] User lookup error:', findErr);
      return res.status(500).json({ error: 'Server error during login.' });
    }

    if (!user) {
      console.log('[AUTH] No user found for:', email);
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    if (user.is_banned) {
      return res.status(403).json({ error: 'Account has been banned. Contact support.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      console.log('[AUTH] Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { userId: user.id, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('[AUTH] Login success for:', user.id);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        referralCode: user.referral_code,
        balance: user.balance,
        totalEarned: user.total_earned,
      },
    });
  } catch (err) {
    console.error('[AUTH] Login fatal error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

// POST /api/auth/verify-otp (mock)
exports.verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;
  if (otp === '123456') {
    return res.json({ message: 'OTP verified successfully', verified: true });
  }
  return res.status(400).json({ error: 'Invalid OTP', verified: false });
};
