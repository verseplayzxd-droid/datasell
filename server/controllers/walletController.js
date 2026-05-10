const supabase = require('../config/supabase');

// GET /api/wallet/balance
exports.getBalance = async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('balance, total_earned')
      .eq('id', req.userId)
      .single();

    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ balance: user.balance, totalEarned: user.total_earned });
  } catch (err) {
    console.error('Balance error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// POST /api/withdraw/request
exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, method, upiId, bankDetails } = req.body;

    // Get min withdrawal from settings
    let minWithdrawal = 200;
    const { data: settings } = await supabase.from('app_settings').select('min_withdrawal').eq('id', 1).single();
    if (settings) minWithdrawal = parseFloat(settings.min_withdrawal) || 200;

    if (!amount || amount < minWithdrawal) {
      return res.status(400).json({ error: `Minimum withdrawal is ₹${minWithdrawal}.` });
    }
    if (!method || !['upi', 'bank'].includes(method)) {
      return res.status(400).json({ error: 'Invalid withdrawal method.' });
    }
    if (method === 'upi' && !upiId) {
      return res.status(400).json({ error: 'UPI ID is required.' });
    }
    if (method === 'bank' && (!bankDetails || !bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.ifscCode)) {
      return res.status(400).json({ error: 'Complete bank details are required.' });
    }

    // Check balance
    const { data: user } = await supabase.from('users').select('balance').eq('id', req.userId).single();
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (parseFloat(user.balance) < amount) {
      return res.status(400).json({ error: 'Insufficient balance.' });
    }

    // Deduct balance
    await supabase
      .from('users')
      .update({ balance: parseFloat(user.balance) - amount })
      .eq('id', req.userId);

    // Create withdrawal
    const { data: withdrawal, error } = await supabase
      .from('withdrawals')
      .insert({
        user_id: req.userId,
        amount,
        upi_id: upiId || null,
        bank_details: bankDetails || null,
        method,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Withdrawal insert error:', error);
      return res.status(500).json({ error: 'Failed to create withdrawal.' });
    }

    // Create transaction
    await supabase.from('transactions').insert({
      user_id: req.userId,
      type: 'withdrawal',
      amount,
      description: `Withdrawal via ${method.toUpperCase()} - ₹${amount}`,
      status: 'pending',
    });

    res.status(201).json({
      message: 'Withdrawal request submitted.',
      withdrawalId: withdrawal.id,
      amount,
      method,
    });
  } catch (err) {
    console.error('Withdraw error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/withdraw/history
exports.getWithdrawalHistory = async (req, res) => {
  try {
    const { data: withdrawals } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', req.userId)
      .order('requested_at', { ascending: false });

    res.json(withdrawals || []);
  } catch (err) {
    console.error('Withdraw history error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};
