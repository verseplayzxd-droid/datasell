import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/axios';

export default function AdminSellOrders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/sell-orders', { params: { status: statusFilter, page, limit: 15 } });
      setOrders(res.data.orders);
      setTotal(res.data.total);
    } catch(e) {} finally { setLoading(false); }
  };

  const forceComplete = async (id) => {
    if (!confirm('Force complete this order and credit money to user?')) return;
    try {
      await adminApi.put(`/sell-orders/${id}/force-complete`);
      toast.success('Order force-completed');
      fetchOrders();
    } catch(e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-headline-lg text-on-surface font-bold">Sell Orders</h1>
      <div className="flex gap-2">
        {['all','processing','sold','cancelled'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`px-4 py-2 rounded-full text-label-md font-semibold transition-colors ${statusFilter === s ? 'bg-admin-red text-white' : 'bg-surface-variant text-on-surface-variant hover:bg-white/10'}`}>
            {s.charAt(0).toUpperCase()+s.slice(1)}
          </button>
        ))}
      </div>
      <div className="admin-glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10">
                {['ID','User','Data','Amount','Status','Created','Completes At','Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-label-md text-on-surface-variant font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-body-sm text-outline font-mono">#{o.id}</td>
                  <td className="py-3 px-4 text-body-sm text-on-surface font-semibold">{o.user_name}</td>
                  <td className="py-3 px-4 text-body-sm text-on-surface">{o.data_gb}GB</td>
                  <td className="py-3 px-4 text-body-sm text-primary font-bold">₹{o.amount}</td>
                  <td className="py-3 px-4"><span className={o.status==='sold'?'badge-completed':o.status==='processing'?'badge-processing':'badge-failed'}>{o.status}</span></td>
                  <td className="py-3 px-4 text-body-sm text-on-surface-variant">{new Date(o.created_at).toLocaleString()}</td>
                  <td className="py-3 px-4 text-body-sm text-on-surface-variant">{new Date(o.completes_at).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    {o.status === 'processing' && (
                      <button onClick={() => forceComplete(o.id)} className="px-3 py-1 rounded-full bg-admin-gold/20 text-admin-gold text-label-md font-semibold hover:bg-admin-gold/30 transition-colors">Force Complete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-white/5 p-4 flex justify-between items-center">
          <span className="text-body-sm text-on-surface-variant">Total: {total}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page-1))} disabled={page===1} className="px-3 py-1 rounded bg-surface-container text-on-surface-variant text-sm disabled:opacity-50">Prev</button>
            <span className="px-3 py-1 text-on-surface text-sm font-semibold">Page {page}</span>
            <button onClick={() => setPage(page+1)} disabled={orders.length < 15} className="px-3 py-1 rounded bg-surface-container text-on-surface-variant text-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
