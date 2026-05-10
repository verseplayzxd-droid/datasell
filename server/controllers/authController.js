const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { generateReferralCode } = require('../utils/helpers');

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, phone, email, password, referralCode } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Name, phone, and password are required.' });
    }

    // Check existing user
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .or(`phone.eq.${phone}${email ? `,email.eq.${email}` : ''}`)
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'Phone number or email already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRefCode = generateReferralCode(name);

    const { data: newUser, error } = await supabase
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

    if (error) {
      console.error('Register insert error:', error);
      return res.status(500).json({ error: 'Registration failed. ' + (error.message || '') });
    }

    // Handle referral bonus
    if (referralCode) {
      const { data: referrer } = await supabase
        .from('users')
        .select('id, balance, total_earned')
        .eq('referral_code', referralCode)
        .single();

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
      }
    }

    const token = jwt.sign({ userId: newUser.id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });

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
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email/phone and password are required.' });
    }

    // Search by email or phone
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${email},phone.eq.${email}`)
      .limit(1);

    if (!users || users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = users[0];
    if (user.is_banned) {
      return res.status(403).json({ error: 'Account has been banned. Contact support.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign({ userId: user.id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });

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
    console.error('Login error:', err);
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
