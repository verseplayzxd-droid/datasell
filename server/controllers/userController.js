const supabase = require('../config/supabase');

// GET /api/user/profile
exports.getProfile = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, phone, email, referral_code, referred_by, balance, total_earned, is_banned, created_at')
      .eq('id', req.userId)
      .single();

    if (error || !user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/user/stats
exports.getStats = async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('balance, total_earned')
      .eq('id', req.userId)
      .single();

    if (!user) return res.status(404).json({ error: 'User not found.' });

    // This month earnings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthTx } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', req.userId)
      .in('type', ['sale', 'referral', 'admin_add'])
      .eq('status', 'completed')
      .gte('created_at', startOfMonth.toISOString());

    const thisMonth = (monthTx || []).reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // Data sold (GB)
    const { data: soldOrders } = await supabase
      .from('sell_orders')
      .select('data_gb')
      .eq('user_id', req.userId)
      .eq('status', 'sold');

    const dataSold = (soldOrders || []).reduce((sum, o) => sum + o.data_gb, 0);

    // Pending payout
    const { data: pendingOrders } = await supabase
      .from('sell_orders')
      .select('amount')
      .eq('user_id', req.userId)
      .eq('status', 'processing');

    const pendingPayout = (pendingOrders || []).reduce((sum, o) => sum + parseFloat(o.amount), 0);

    res.json({
      totalEarned: user.total_earned,
      balance: user.balance,
      thisMonth,
      dataSold,
      pendingPayout,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// PUT /api/user/update
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (email) updates.email = email;

    await supabase.from('users').update(updates).eq('id', req.userId);
    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};
