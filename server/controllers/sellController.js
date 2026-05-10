const supabase = require('../config/supabase');

// POST /api/sell/start
exports.startSell = async (req, res) => {
  try {
    const { dataGb } = req.body;
    if (!dataGb || ![1, 2, 5, 10].includes(dataGb)) {
      return res.status(400).json({ error: 'Invalid data package. Choose 1, 2, 5, or 10 GB.' });
    }

    // Get dynamic settings
    let ratePerGb = 200;
    let hoursPerGb = 24;
    const { data: settings } = await supabase.from('app_settings').select('*').eq('id', 1).single();
    if (settings) {
      ratePerGb = parseFloat(settings.rate_per_gb) || 200;
      hoursPerGb = parseInt(settings.sell_hours_per_gb) || 24;
    }

    const amount = dataGb * ratePerGb;
    const totalHours = dataGb * hoursPerGb;
    const completesAt = new Date(Date.now() + totalHours * 3600000).toISOString();

    const { data: order, error } = await supabase
      .from('sell_orders')
      .insert({
        user_id: req.userId,
        data_gb: dataGb,
        amount,
        status: 'processing',
        completes_at: completesAt,
      })
      .select()
      .single();

    if (error) {
      console.error('Sell insert error:', error);
      return res.status(500).json({ error: 'Failed to create sell order.' });
    }

    // Create pending transaction
    await supabase.from('transactions').insert({
      user_id: req.userId,
      type: 'sale',
      amount,
      description: `Data sale: ${dataGb}GB package`,
      status: 'pending',
    });

    res.status(201).json({
      message: `${dataGb}GB sell order created. Completes in ${totalHours} hours.`,
      order,
    });
  } catch (err) {
    console.error('Sell start error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/sell/active
exports.getActive = async (req, res) => {
  try {
    const { data: orders } = await supabase
      .from('sell_orders')
      .select('*')
      .eq('user_id', req.userId)
      .eq('status', 'processing')
      .order('created_at', { ascending: false });

    res.json(orders || []);
  } catch (err) {
    console.error('Active orders error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/sell/history
exports.getHistory = async (req, res) => {
  try {
    const { data: orders } = await supabase
      .from('sell_orders')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    res.json(orders || []);
  } catch (err) {
    console.error('Sell history error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};
