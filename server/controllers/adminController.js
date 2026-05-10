const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// Helper: log admin action
async function logAction(adminId, actionType, targetUserId, amount, note) {
  await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action_type: actionType,
    target_user_id: targetUserId || null,
    amount: amount || null,
    note: note || null,
  });
}

// POST /api/admin/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

    const { data: admins } = await supabase.from('admins').select('*').eq('email', email).limit(1);
    if (!admins || admins.length === 0) return res.status(401).json({ error: 'Invalid admin credentials.' });

    const admin = admins[0];
    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) return res.status(401).json({ error: 'Invalid admin credentials.' });

    await supabase.from('admins').update({ last_login: new Date().toISOString() }).eq('id', admin.id);

    const token = jwt.sign({ adminId: admin.id, role: 'admin' }, process.env.ADMIN_JWT_SECRET, { expiresIn: '24h' });
    res.json({ message: 'Admin login successful', token, admin: { id: admin.id, name: admin.name, email: admin.email } });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { data: allUsers } = await supabase.from('users').select('total_earned');
    const totalDistributed = (allUsers || []).reduce((s, u) => s + parseFloat(u.total_earned), 0);

    const { count: activeOrders } = await supabase.from('sell_orders').select('*', { count: 'exact', head: true }).eq('status', 'processing');
    const { count: pendingWithdrawals } = await supabase.from('withdrawals').select('*', { count: 'exact', head: true }).eq('status', 'pending');

    const today = new Date(); today.setHours(0,0,0,0);
    const { count: todayUsers } = await supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString());

    const { data: paidW } = await supabase.from('withdrawals').select('amount').eq('status', 'paid');
    const totalWithdrawn = (paidW || []).reduce((s, w) => s + parseFloat(w.amount), 0);

    // Recent activity
    const { data: recentTx } = await supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(10);
    const recentActivity = [];
    for (const tx of (recentTx || [])) {
      const { data: u } = await supabase.from('users').select('name').eq('id', tx.user_id).single();
      recentActivity.push({ ...tx, user_name: u?.name || 'Unknown' });
    }

    res.json({ totalUsers, totalDistributed, activeOrders, pendingWithdrawals, todayUsers, totalWithdrawn, recentActivity });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase.from('users').select('id, name, phone, email, balance, total_earned, is_banned, created_at', { count: 'exact' });

    if (search) query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    if (status === 'active') query = query.eq('is_banned', false);
    if (status === 'banned') query = query.eq('is_banned', true);

    query = query.order('created_at', { ascending: false }).range(offset, offset + parseInt(limit) - 1);
    const { data: users, count } = await query;

    res.json({ users: users || [], total: count || 0, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/admin/users/:id
exports.getUserDetail = async (req, res) => {
  try {
    const { data: user } = await supabase.from('users').select('id, name, phone, email, referral_code, referred_by, balance, total_earned, is_banned, created_at').eq('id', req.params.id).single();
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const { data: transactions } = await supabase.from('transactions').select('*').eq('user_id', req.params.id).order('created_at', { ascending: false }).limit(50);
    const { data: sellOrders } = await supabase.from('sell_orders').select('*').eq('user_id', req.params.id).order('created_at', { ascending: false }).limit(20);
    const { data: withdrawals } = await supabase.from('withdrawals').select('*').eq('user_id', req.params.id).order('requested_at', { ascending: false }).limit(20);

    res.json({ user, transactions: transactions || [], sellOrders: sellOrders || [], withdrawals: withdrawals || [] });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// POST /api/admin/users/:id/add-money
exports.addMoney = async (req, res) => {
  try {
    const { amount, note } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount.' });

    const { data: user } = await supabase.from('users').select('id, name, balance, total_earned').eq('id', req.params.id).single();
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const newBalance = parseFloat(user.balance) + parseFloat(amount);
    const newTotalEarned = parseFloat(user.total_earned) + parseFloat(amount);
    await supabase.from('users').update({ balance: newBalance, total_earned: newTotalEarned }).eq('id', req.params.id);

    await supabase.from('transactions').insert({
      user_id: req.params.id, type: 'admin_add', amount, description: note || 'Manual addition by admin', status: 'completed', added_by: req.adminId,
    });

    await logAction(req.adminId, 'add_money', req.params.id, amount, note);
    res.json({ message: 'Money added successfully.', newBalance });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// POST /api/admin/users/:id/deduct-money
exports.deductMoney = async (req, res) => {
  try {
    const { amount, note } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount.' });

    const { data: user } = await supabase.from('users').select('id, balance').eq('id', req.params.id).single();
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const newBalance = Math.max(0, parseFloat(user.balance) - parseFloat(amount));
    await supabase.from('users').update({ balance: newBalance }).eq('id', req.params.id);

    await supabase.from('transactions').insert({
      user_id: req.params.id, type: 'admin_deduct', amount, description: note || 'Manual deduction by admin', status: 'completed', added_by: req.adminId,
    });

    await logAction(req.adminId, 'deduct_money', req.params.id, amount, note);
    res.json({ message: 'Money deducted.', newBalance });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// POST /api/admin/users/:id/ban
exports.banUser = async (req, res) => {
  try {
    const { data: user } = await supabase.from('users').select('is_banned').eq('id', req.params.id).single();
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const newBanned = !user.is_banned;
    await supabase.from('users').update({ is_banned: newBanned }).eq('id', req.params.id);
    await logAction(req.adminId, newBanned ? 'ban_user' : 'unban_user', req.params.id, null, null);

    res.json({ message: `User ${newBanned ? 'banned' : 'unbanned'}.`, status: newBanned ? 'banned' : 'active' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    await logAction(req.adminId, 'delete_user', req.params.id, null, 'User deleted');
    await supabase.from('users').delete().eq('id', req.params.id);
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/admin/withdrawals
exports.getWithdrawals = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase.from('withdrawals').select('*', { count: 'exact' });
    if (status && status !== 'all') query = query.eq('status', status);
    query = query.order('requested_at', { ascending: false }).range(offset, offset + parseInt(limit) - 1);
    const { data: withdrawals, count } = await query;

    // Attach user names
    const result = [];
    for (const w of (withdrawals || [])) {
      const { data: u } = await supabase.from('users').select('name, email').eq('id', w.user_id).single();
      result.push({ ...w, user_name: u?.name || 'Unknown', user_email: u?.email || '' });
    }

    res.json({ withdrawals: result, total: count || 0, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// PUT /api/admin/withdrawals/:id/status
exports.updateWithdrawalStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['pending', 'processing', 'paid', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const updates = { status, processed_by: req.adminId };
    if (status === 'paid') updates.paid_at = new Date().toISOString();
    if (status === 'rejected' && rejectionReason) updates.rejection_reason = rejectionReason;

    // If rejecting, refund
    if (status === 'rejected') {
      const { data: w } = await supabase.from('withdrawals').select('user_id, amount').eq('id', req.params.id).single();
      if (w) {
        const { data: u } = await supabase.from('users').select('balance').eq('id', w.user_id).single();
        if (u) await supabase.from('users').update({ balance: parseFloat(u.balance) + parseFloat(w.amount) }).eq('id', w.user_id);
      }
    }

    await supabase.from('withdrawals').update(updates).eq('id', req.params.id);
    await logAction(req.adminId, `withdrawal_${status}`, null, null, `Withdrawal #${req.params.id} → ${status}`);
    res.json({ message: `Withdrawal marked as ${status}.` });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// POST /api/admin/withdrawals/bulk-update
exports.bulkUpdateWithdrawals = async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'No IDs provided.' });

    const updates = { status, processed_by: req.adminId };
    if (status === 'paid') updates.paid_at = new Date().toISOString();

    await supabase.from('withdrawals').update(updates).in('id', ids);
    await logAction(req.adminId, 'bulk_withdrawal_update', null, null, `Bulk: ${ids.length} → ${status}`);
    res.json({ message: `${ids.length} withdrawals updated to ${status}.` });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/admin/sell-orders
exports.getSellOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase.from('sell_orders').select('*', { count: 'exact' });
    if (status && status !== 'all') query = query.eq('status', status);
    query = query.order('created_at', { ascending: false }).range(offset, offset + parseInt(limit) - 1);
    const { data: orders, count } = await query;

    const result = [];
    for (const o of (orders || [])) {
      const { data: u } = await supabase.from('users').select('name, email').eq('id', o.user_id).single();
      result.push({ ...o, user_name: u?.name || 'Unknown', user_email: u?.email || '' });
    }

    res.json({ orders: result, total: count || 0, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// PUT /api/admin/sell-orders/:id/force-complete
exports.forceComplete = async (req, res) => {
  try {
    const { data: order } = await supabase.from('sell_orders').select('*').eq('id', req.params.id).eq('status', 'processing').single();
    if (!order) return res.status(404).json({ error: 'Order not found or already completed.' });

    await supabase.from('sell_orders').update({ status: 'sold' }).eq('id', order.id);

    const { data: user } = await supabase.from('users').select('balance, total_earned').eq('id', order.user_id).single();
    await supabase.from('users').update({
      balance: parseFloat(user.balance) + parseFloat(order.amount),
      total_earned: parseFloat(user.total_earned) + parseFloat(order.amount),
    }).eq('id', order.user_id);

    // Update pending transaction to completed
    await supabase.from('transactions').update({ status: 'completed' }).eq('user_id', order.user_id).eq('type', 'sale').eq('amount', order.amount).eq('status', 'pending').limit(1);

    await logAction(req.adminId, 'force_complete_order', order.user_id, order.amount, `Force completed order #${order.id}`);
    res.json({ message: 'Order force-completed and money credited.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/admin/transactions
exports.getTransactions = async (req, res) => {
  try {
    const { type, status, userId, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase.from('transactions').select('*', { count: 'exact' });
    if (type && type !== 'all') query = query.eq('type', type);
    if (status && status !== 'all') query = query.eq('status', status);
    if (userId) query = query.eq('user_id', userId);
    query = query.order('created_at', { ascending: false }).range(offset, offset + parseInt(limit) - 1);
    const { data: transactions, count } = await query;

    const result = [];
    for (const t of (transactions || [])) {
      const { data: u } = await supabase.from('users').select('name').eq('id', t.user_id).single();
      result.push({ ...t, user_name: u?.name || 'Unknown' });
    }

    res.json({ transactions: result, total: count || 0, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// POST /api/admin/announcements
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) return res.status(400).json({ error: 'Title and message required.' });
    const { data, error } = await supabase.from('announcements').insert({ title, message }).select().single();
    if (error) return res.status(500).json({ error: 'Failed to create announcement.' });
    await logAction(req.adminId, 'create_announcement', null, null, title);
    res.status(201).json({ message: 'Announcement created.', id: data.id });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/admin/announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// PUT /api/admin/announcements/:id
exports.toggleAnnouncement = async (req, res) => {
  try {
    const { is_active } = req.body;
    await supabase.from('announcements').update({ is_active: !!is_active }).eq('id', req.params.id);
    res.json({ message: 'Announcement updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/admin/settings
exports.getSettings = async (req, res) => {
  try {
    const { data } = await supabase.from('app_settings').select('*').eq('id', 1).single();
    res.json(data || {});
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// PUT /api/admin/settings
exports.updateSettings = async (req, res) => {
  try {
    const updates = {};
    const allowed = ['min_withdrawal', 'rate_per_gb', 'sell_hours_per_gb', 'maintenance_mode', 'app_name'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    await supabase.from('app_settings').update(updates).eq('id', 1);
    await logAction(req.adminId, 'update_settings', null, null, JSON.stringify(updates));
    res.json({ message: 'Settings updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};
