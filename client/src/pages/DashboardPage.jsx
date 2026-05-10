import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import AdZone from '../components/ui/AdZone';
import Skeleton from '../components/ui/Skeleton';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, activeRes, histRes, annRes] = await Promise.all([
        api.get('/user/stats'),
        api.get('/sell/active'),
        api.get('/sell/history'),
        api.get('/announcements/active').catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data);
      setActiveOrder(activeRes.data[0] || null);
      setTransactions(histRes.data.slice(0, 5));
      setAnnouncements(annRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = (order) => {
    if (!order) return 0;
    const total = new Date(order.completes_at) - new Date(order.created_at);
    const elapsed = Date.now() - new Date(order.created_at);
    return Math.min(Math.round((elapsed / total) * 100), 100);
  };

  const getTimeRemaining = (order) => {
    if (!order) return '—';
    const remaining = new Date(order.completes_at) - Date.now();
    if (remaining <= 0) return 'Completing...';
    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  const progress = getProgress(activeOrder);
  const dashOffset = 251.2 - (251.2 * progress / 100);

  return (
    <DashboardLayout>
      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="bg-tertiary-container/20 border border-tertiary-container/30 rounded-xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-tertiary-container">campaign</span>
          <div>
            <h3 className="text-body-md text-on-surface font-semibold">{announcements[0].title}</h3>
            <p className="text-body-sm text-on-surface-variant">{announcements[0].message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Overview</h1>
          <p className="text-body-md text-on-surface-variant">Your node performance and earnings.</p>
        </div>
        <Link to="/sell" className="btn-primary px-6 py-3 text-headline-sm flex items-center gap-2">
          <span className="material-symbols-outlined">add</span> Sell More Data
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          <Skeleton className="h-24" count={4} />
        ) : (
          <>
            <div className="glass-card p-4 rounded-lg flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-secondary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                <span className="bg-secondary-fixed-dim/20 text-secondary-fixed-dim px-2 py-1 rounded-full text-label-md font-semibold">+12%</span>
              </div>
              <div>
                <p className="text-body-sm text-on-surface-variant">Total Earned</p>
                <p className="text-headline-md text-on-surface text-glow-primary font-bold">₹{stats?.totalEarned || 0}</p>
              </div>
            </div>
            <div className="glass-card p-4 rounded-lg flex flex-col gap-3">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
              <div>
                <p className="text-body-sm text-on-surface-variant">This Month</p>
                <p className="text-headline-md text-on-surface font-bold">₹{stats?.thisMonth || 0}</p>
              </div>
            </div>
            <div className="glass-card p-4 rounded-lg flex flex-col gap-3">
              <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>cell_tower</span>
              <div>
                <p className="text-body-sm text-on-surface-variant">Data Sold</p>
                <p className="text-headline-md text-on-surface font-bold">{stats?.dataSold || 0}GB</p>
              </div>
            </div>
            <div className="glass-card p-4 rounded-lg flex flex-col gap-3">
              <span className="material-symbols-outlined text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>pending</span>
              <div>
                <p className="text-body-sm text-on-surface-variant">Pending</p>
                <p className="text-headline-md text-tertiary-fixed-dim font-bold">₹{stats?.pendingPayout || 0}</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="md:col-span-4 flex flex-col gap-6">
          {/* Active Order */}
          <div className="glass-card p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary-fixed-dim/10 blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none" />
            <div className="flex justify-between items-center z-10">
              <h2 className="text-headline-sm text-on-surface font-semibold">Active Transmission</h2>
              {activeOrder && <span className="badge-processing">PROCESSING</span>}
            </div>
            {activeOrder ? (
              <>
                <div className="flex items-center justify-center py-3 z-10">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full progress-ring" viewBox="0 0 100 100">
                      <circle className="text-surface-variant stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8" />
                      <circle className="text-tertiary-fixed-dim stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset={dashOffset} strokeLinecap="round" strokeWidth="8" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-headline-lg text-on-surface font-bold">{progress}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#1A1A1A] rounded-lg border border-outline-variant/30 z-10">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-outline">timer</span>
                    <span className="text-body-sm text-on-surface-variant">Est. Time Remaining</span>
                  </div>
                  <span className="text-headline-sm text-on-surface font-semibold">{getTimeRemaining(activeOrder)}</span>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 block">cloud_off</span>
                <p className="text-body-md">No active orders</p>
                <Link to="/sell" className="text-primary text-body-sm mt-2 inline-block hover:underline">Start selling →</Link>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-4 rounded-xl flex flex-col gap-3">
            <h3 className="text-headline-sm text-on-surface font-semibold mb-1">Quick Actions</h3>
            <Link to="/wallet" className="w-full bg-[#1A1A1A] hover:bg-surface-variant border border-outline-variant/30 text-on-surface px-4 py-3 rounded-lg text-body-md transition-colors flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">payments</span> Withdraw Funds
            </Link>
            <Link to="/referrals" className="w-full bg-[#1A1A1A] hover:bg-surface-variant border border-outline-variant/30 text-on-surface px-4 py-3 rounded-lg text-body-md transition-colors flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary-container">group_add</span> Refer Friends
            </Link>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-8 flex flex-col gap-6">
          <AdZone id="ad-dashboard-top" height="90px" label="Ad Banner Zone (728x90)" />

          {/* Recent Transactions */}
          <div className="glass-card rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-headline-sm text-on-surface font-semibold">Recent Ledger</h2>
              <Link to="/history" className="text-body-sm text-primary hover:text-primary-fixed-dim">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="p-4 text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Date</th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Amount</th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Type</th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-body-sm text-on-surface">
                  {loading ? (
                    <tr><td colSpan={4} className="p-4"><Skeleton className="h-8" count={3} /></td></tr>
                  ) : transactions.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-on-surface-variant">No transactions yet</td></tr>
                  ) : (
                    transactions.map((t, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 whitespace-nowrap text-on-surface-variant">{new Date(t.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-headline-sm font-semibold">₹{t.amount}</td>
                        <td className="p-4">Data Sale ({t.data_gb}GB)</td>
                        <td className="p-4 text-right">
                          <span className={t.status === 'sold' ? 'badge-completed' : t.status === 'processing' ? 'badge-processing' : 'badge-failed'}>
                            {t.status?.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
