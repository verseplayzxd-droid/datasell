import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/axios';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchWithdrawals(); }, [page, statusFilter]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/withdrawals', { params: { status: statusFilter, page, limit: 15 } });
      setWithdrawals(res.data.withdrawals);
      setTotal(res.data.total);
    } catch(e) {} finally { setLoading(false); }
  };

  const updateStatus = async (id, status, rejectionReason) => {
    try {
      await adminApi.put(`/withdrawals/${id}/status`, { status, rejectionReason });
      toast.success(`Withdrawal marked as ${status}`);
      fetchWithdrawals();
    } catch(e) { toast.error('Failed'); }
  };

  const bulkUpdate = async (status) => {
    if (selected.length === 0) return toast.error('Select withdrawals first');
    try {
      await adminApi.post('/withdrawals/bulk-update', { ids: selected, status });
      toast.success(`${selected.length} withdrawals updated`);
      setSelected([]);
      fetchWithdrawals();
    } catch(e) { toast.error('Failed'); }
  };

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const exportCSV = () => {
    const csv = 'ID,User,Amount,Method,Status,Date\n' + withdrawals.map(w =>
      `${w.id},${w.user_name},${w.amount},${w.method},${w.status},${new Date(w.requested_at).toLocaleDateString()}`
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'withdrawals.csv'; a.click();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-headline-lg text-on-surface font-bold">Withdrawals</h1>
        <div className="flex gap-2">
          <button onClick={() => bulkUpdate('paid')} className="px-4 py-2 rounded-full bg-secondary-fixed-dim/20 text-secondary-fixed-dim text-label-md font-semibold hover:bg-secondary-fixed-dim/30">Mark Selected Paid</button>
          <button onClick={exportCSV} className="px-4 py-2 rounded-full bg-surface-variant text-on-surface-variant text-label-md font-semibold hover:bg-white/10">Export CSV</button>
        </div>
      </div>

      <div className="flex gap-2">
        {['all','pending','processing','paid','rejected'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`px-4 py-2 rounded-full text-label-md font-semibold transition-colors ${statusFilter === s ? 'bg-admin-red text-white' : 'bg-surface-variant text-on-surface-variant hover:bg-white/10'}`}>
            {s.charAt(0).toUpperCase()+s.slice(1)}
          </button>
        ))}
      </div>

      <div className="admin-glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 px-4"><input type="checkbox" onChange={e => setSelected(e.target.checked ? withdrawals.map(w=>w.id) : [])} className="rounded bg-surface-container" /></th>
                <th className="py-3 px-4 text-label-md text-on-surface-variant font-semibold">ID</th>
                <th className="py-3 px-4 text-label-md text-on-surface-variant font-semibold">User</th>
                <th className="py-3 px-4 text-label-md text-on-surface-variant font-semibold">Amount</th>
                <th className="py-3 px-4 text-label-md text-on-surface-variant font-semibold">Method</th>
                <th className="py-3 px-4 text-label-md text-on-surface-variant font-semibold">Status</th>
                <th className="py-3 px-4 text-label-md text-on-surface-variant font-semibold">Date</th>
                <th className="py-3 px-4 text-label-md text-on-surface-variant font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {withdrawals.map(w => (
                <tr key={w.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4"><input type="checkbox" checked={selected.includes(w.id)} onChange={() => toggleSelect(w.id)} className="rounded bg-surface-container" /></td>
                  <td className="py-3 px-4 text-body-sm text-outline font-mono">#{w.id}</td>
                  <td className="py-3 px-4 text-body-sm text-on-surface font-semibold">{w.user_name}</td>
                  <td className="py-3 px-4 text-body-sm text-primary font-bold">₹{w.amount}</td>
                  <td className="py-3 px-4 text-body-sm text-on-surface-variant uppercase">{w.method}</td>
                  <td className="py-3 px-4"><span className={w.status==='paid'?'badge-paid':w.status==='pending'?'badge-pending':w.status==='rejected'?'badge-failed':'badge-processing'}>{w.status}</span></td>
                  <td className="py-3 px-4 text-body-sm text-on-surface-variant">{new Date(w.requested_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button onClick={() => updateStatus(w.id, 'paid')} className="p-1 hover:bg-white/10 rounded" title="Mark Paid"><span className="material-symbols-outlined text-[18px] text-secondary-fixed-dim">check_circle</span></button>
                      <button onClick={() => updateStatus(w.id, 'processing')} className="p-1 hover:bg-white/10 rounded" title="Processing"><span className="material-symbols-outlined text-[18px] text-tertiary-fixed-dim">autorenew</span></button>
                      <button onClick={() => { const r = prompt('Rejection reason:'); if(r) updateStatus(w.id, 'rejected', r); }} className="p-1 hover:bg-white/10 rounded" title="Reject"><span className="material-symbols-outlined text-[18px] text-admin-red">cancel</span></button>
                    </div>
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
            <button onClick={() => setPage(page+1)} disabled={withdrawals.length < 15} className="px-3 py-1 rounded bg-surface-container text-on-surface-variant text-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
