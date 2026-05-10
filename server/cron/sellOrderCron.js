const cron = require('node-cron');
const supabase = require('../config/supabase');

function startSellOrderCron() {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('[CRON] Checking for completed sell orders...');
    try {
      const now = new Date().toISOString();

      const { data: orders, error } = await supabase
        .from('sell_orders')
        .select('*')
        .eq('status', 'processing')
        .lte('completes_at', now);

      if (error) {
        console.error('[CRON] Query error:', error);
        return;
      }

      if (!orders || orders.length === 0) {
        console.log('[CRON] No orders to complete.');
        return;
      }

      for (const order of orders) {
        // Update order status to sold
        await supabase
          .from('sell_orders')
          .update({ status: 'sold' })
          .eq('id', order.id);

        // Add money to user balance
        const { data: user } = await supabase
          .from('users')
          .select('balance, total_earned')
          .eq('id', order.user_id)
          .single();

        if (user) {
          await supabase
            .from('users')
            .update({
              balance: parseFloat(user.balance) + parseFloat(order.amount),
              total_earned: parseFloat(user.total_earned) + parseFloat(order.amount),
            })
            .eq('id', order.user_id);
        }

        // Update pending transaction to completed
        await supabase
          .from('transactions')
          .update({ status: 'completed' })
          .eq('user_id', order.user_id)
          .eq('type', 'sale')
          .eq('amount', order.amount)
          .eq('status', 'pending')
          .limit(1);

        console.log(`[CRON] Order #${order.id} completed. ₹${order.amount} credited to user ${order.user_id}`);
      }

      console.log(`[CRON] Completed ${orders.length} orders.`);
    } catch (err) {
      console.error('[CRON] Error processing sell orders:', err);
    }
  });

  console.log('[CRON] Sell order completion job scheduled (runs every 5 minutes).');
}

module.exports = startSellOrderCron;
