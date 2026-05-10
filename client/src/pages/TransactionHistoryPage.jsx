import { useState, useEffect } from 'react';
import api from '../api/axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import Skeleton from '../components/ui/Skeleton';

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: 'all', status: 'all', dateRange: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => { fetchTransactions(); }, [page]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit });
      const [sellRes, walletRes] = await Promise.all([
        api.get('/sell/history'),
        api.get('/withdraw/history'),
      ]);
      // Combine and sort
      const all = [
        ...sellRes.data.map(s => ({ ...s, txType: 'sale', txAmount: s.amount, txStatus: s.status === 'sold' ? 'completed' : s.status, txDesc: `Data Sale (${s.data_gb}GB)`, txDate: s.created_at })),
        ...walletRes.data.map(w => ({ ...w, txType: 'withdrawal', txAmount: w.amount, txStatus: w.status, txDesc: `Withdrawal via ${w.method?.toUpperCase()}`, txDate: w.requested_at })),
      ].sort((a, b) => new Date(b.txDate) - new Date(a.txDate));

      let filtered = all;
      if (filters.type !== 'all') filtered = filtered.filter(t => t.txType === filters.type);
      if (filters.status !== 'all') filtered = filtered.filter(t => t.txStatus === filters.status);

      setTotal(filtered.length);
      setTransactions(filtered.slice((page - 1) * limit, page * limit));
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  const applyFilters = () => { setPage(1); fetchTransactions(); };

  const exportCSV = () => {
    const csv = 'Date,Type,Description,Amount,Status\n' + transactions.map(t =>
      `${new Date(t.txDate).toLocaleDateString()},${t.txType},${t.txDesc},${t.txAmount},${t.txStatus}`
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'datasell_transactions.csv'; a.click();
  };

  const totalPages = Math.ceil(total / limit);
  const badgeClass = (s) => s === 'completed' || s === 'sold' || s === 'paid' ? 'badge-completed' : s === 'processing' ? 'badge-processing' : s === 'pending' ? 'badge-pending' : 'badge-failed';

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold mb-1">Transaction History</h1>
          <p className="text-body-md text-on-surface-variant">Review your data sales, referrals, and withdrawals.</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 bg-surface-container border border-outline-variant/50 text-on-surface px-4 py-2 rounded-full hover:bg-surface-container-high transition-colors active:scale-95">
          <span className="material-symbols-outlined text-label-md">download</span>
          <span className="text-label-md font-semibold">Download CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card rounded-xl p-4 flex flex-col lg:flex-row gap-4 items-end">
        <div className="w-full lg:w-auto flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-label-md text-on-surface-variant font-semibold">Date Range</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">calendar_today</span>
              <input className="glass-input w-full rounded-lg pl-10 pr-3 py-2 text-body-sm" placeholder="Last 30 Days" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-md text-on-surface-variant font-semibold">Transaction Type</label>
            <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})} className="glass-input w-full rounded-lg px-3 py-2 text-body-sm appearance-none cursor-pointer">
              <option value="all" className="bg-surface-container">All Types</option>
              <option value="sale" className="bg-surface-container">Data Sale</option>
              <option value="withdrawal" className="bg-surface-container">Withdrawal</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-md text-on-surface-variant font-semibold">Status</label>
            <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="glass-input w-full rounded-lg px-3 py-2 text-body-sm appearance-none cursor-pointer">
              <option value="all" className="bg-surface-container">All Statuses</option>
              <option value="completed" className="bg-surface-container">Completed</option>
              <option value="pending" className="bg-surface-container">Pending</option>
              <option value="processing" className="bg-surface-container">Processing</option>
            </select>
          </div>
        </div>
        <button onClick={applyFilters} className="w-full lg:w-auto bg-primary/10 text-primary border border-primary/30 px-6 py-2 rounded-lg text-label-md font-semibold hover:bg-primary/20 transition-colors">Apply Filters</button>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden flex flex-col flex-grow">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5 bg-surface-container-low/50">
                <th className="text-label-md text-on-surface-variant py-4 px-6 font-semibold">Date</th>
                <th className="text-label-md text-on-surface-variant py-4 px-6 font-semibold">Type</th>
                <th className="text-label-md text-on-surface-variant py-4 px-6 font-semibold">Description</th>
                <th className="text-label-md text-on-surface-variant py-4 px-6 text-right font-semibold">Amount</th>
                <th className="text-label-md text-on-surface-variant py-4 px-6 text-center font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="p-4"><Skeleton className="h-8" count={5} /></td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">No transactions found</td></tr>
              ) : transactions.map((t, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 text-body-sm text-on-surface">{new Date(t.txDate).toLocaleDateString()}</td>
                  <td className="py-4 px-6">
                    <div className={`flex items-center gap-2 ${t.txType === 'sale' ? 'text-secondary-fixed-dim' : 'text-tertiary-fixed-dim'}`}>
                      <span className="material-symbols-outlined text-[16px]">{t.txType === 'sale' ? 'bolt' : 'account_balance_wallet'}</span>
                      <span className="text-body-sm font-semibold">{t.txType === 'sale' ? 'Data Sale' : 'Withdrawal'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-body-sm text-on-surface-variant truncate max-w-[200px]">{t.txDesc}</td>
                  <td className={`py-4 px-6 text-body-lg text-right font-semibold ${t.txType === 'sale' ? 'text-primary' : 'text-on-surface'}`}>
                    {t.txType === 'sale' ? '+' : '-'}₹{t.txAmount}
                  </td>
                  <td className="py-4 px-6 text-center"><span className={badgeClass(t.txStatus)}>{t.txStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="border-t border-white/5 bg-surface-container-low/30 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-body-sm text-on-surface-variant">
            Showing <span className="text-on-surface font-semibold">{(page-1)*limit+1}</span> to <span className="text-on-surface font-semibold">{Math.min(page*limit, total)}</span> of <span className="text-on-surface font-semibold">{total}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page-1))} disabled={page===1} className="w-8 h-8 flex items-center justify-center rounded bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-on-surface disabled:opacity-50 transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i+1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 flex items-center justify-center rounded text-label-md font-semibold ${p===page ? 'bg-primary text-on-primary' : 'bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-on-surface'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(Math.min(totalPages, page+1))} disabled={page>=totalPages} className="w-8 h-8 flex items-center justify-center rounded bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-on-surface disabled:opacity-50 transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
