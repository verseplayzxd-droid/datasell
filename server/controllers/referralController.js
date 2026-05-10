const supabase = require('../config/supabase');

// GET /api/referral/code
exports.getCode = async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('referral_code')
      .eq('id', req.userId)
      .single();

    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ referralCode: user.referral_code });
  } catch (err) {
    console.error('Referral code error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/referral/list
exports.getList = async (req, res) => {
  try {
    const { data: referrals } = await supabase
      .from('referrals')
      .select('id, bonus_amount, status, created_at, referred_id')
      .eq('referrer_id', req.userId)
      .order('created_at', { ascending: false });

    // Get referred user names
    const result = [];
    for (const ref of (referrals || [])) {
      const { data: user } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', ref.referred_id)
        .single();

      result.push({ ...ref, name: user?.name, email: user?.email });
    }

    res.json(result);
  } catch (err) {
    console.error('Referral list error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/referral/stats
exports.getStats = async (req, res) => {
  try {
    const { data: referrals } = await supabase
      .from('referrals')
      .select('bonus_amount, status')
      .eq('referrer_id', req.userId);

    const all = referrals || [];
    const friendsInvited = all.length;
    const totalEarnings = all.filter(r => r.status === 'paid').reduce((s, r) => s + parseFloat(r.bonus_amount), 0);
    const pendingVerification = all.filter(r => r.status === 'pending').length;

    res.json({ friendsInvited, totalEarnings, pendingVerification });
  } catch (err) {
    console.error('Referral stats error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};
