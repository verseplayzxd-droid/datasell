import { useState, useEffect } from 'react';
import { adminApi } from '../../api/axios';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({ type: 'all', status: 'all' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTransactions(); }, [page, filters]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/transactions', { params: { ...filters, page, limit: 20 } });
      setTransactions(res.data.transactions);
      setTotal(res.data.total);
    } catch(e) {} finally { setLoading(false); }
  };

  const exportCSV = () => {
    const csv = 'ID,User,Type,Amount,Description,Status,Date\n' + transactions.map(t =>
      `${t.id},${t.user_name},${t.type},${t.amount},"${t.description}",${t.status},${new Date(t.created_at).toLocaleDateString()}`
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'all_transactions.csv'; a.click();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-headline-lg text-on-surface font-bold">All Transactions</h1>
        <button onClick={exportCSV} className="px-4 py-2 rounded-full bg-surface-variant text-on-surface-variant text-label-md font-semibold hover:bg-white/10">Export CSV</button>
      </div>
      <div className="flex flex-wrap gap-4">
        <select value={filters.type} onChange={e => { setFilters({...filters, type: e.target.value}); setPage(1); }} className="glass-input rounded-lg px-3 py-2 text-body-sm">
          <option value="all">All Types</option>
          <option value="sale">Sale</option>
          <option value="referral">Referral</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="admin_add">Admin Add</option>
          <option value="admin_deduct">Admin Deduct</option>
        </select>
        <select value={filters.status} onChange={e => { setFilters({...filters, status: e.target.value}); setPage(1); }} className="glass-input rounded-lg px-3 py-2 text-body-sm">
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      <div className="admin-glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10">
                {['ID','User','Type','Amount','Description','Status','Date'].map(h => (
                  <th key={h} className="py-3 px-4 text-label-md text-on-surface-variant font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-body-sm text-outline font-mono">#{t.id}</td>
                  <td className="py-3 px-4 text-body-sm text-on-surface font-semibold">{t.user_name}</td>
                  <td className="py-3 px-4 text-body-sm text-on-surface-variant capitalize">{t.type}</td>
                  <td className="py-3 px-4 text-body-sm text-primary font-bold">₹{t.amount}</td>
                  <td className="py-3 px-4 text-body-sm text-on-surface-variant truncate max-w-[200px]">{t.description}</td>
                  <td className="py-3 px-4"><span className={t.status==='completed'?'badge-completed':t.status==='pending'?'badge-pending':'badge-failed'}>{t.status}</span></td>
                  <td className="py-3 px-4 text-body-sm text-on-surface-variant">{new Date(t.created_at).toLocaleDateString()}</td>
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
            <button onClick={() => setPage(page+1)} disabled={transactions.length < 20} className="px-3 py-1 rounded bg-surface-container text-on-surface-variant text-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
