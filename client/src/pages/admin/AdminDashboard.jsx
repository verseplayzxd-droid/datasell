import { useState, useEffect } from 'react';
import { adminApi } from '../../api/axios';
import Skeleton from '../../components/ui/Skeleton';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.get('/stats');
        setStats(res.data);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: 'group', color: 'text-primary' },
    { label: 'Total Distributed', value: `₹${stats.totalDistributed}`, icon: 'payments', color: 'text-secondary-fixed-dim' },
    { label: 'Active Orders', value: stats.activeOrders, icon: 'cell_tower', color: 'text-tertiary-fixed-dim' },
    { label: 'Pending Withdrawals', value: stats.pendingWithdrawals, icon: 'hourglass_empty', color: 'text-admin-gold' },
    { label: 'Today\'s Users', value: stats.todayUsers, icon: 'person_add', color: 'text-admin-red' },
    { label: 'Total Withdrawn', value: `₹${stats.totalWithdrawn}`, icon: 'account_balance', color: 'text-primary-fixed-dim' },
  ] : [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-headline-lg text-on-surface font-bold">Admin Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {loading ? <Skeleton className="h-24" count={6} /> : statCards.map((s, i) => (
          <div key={i} className="admin-glass-card rounded-xl p-4 flex flex-col gap-2">
            <span className={`material-symbols-outlined ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            <p className="text-label-md text-on-surface-variant font-semibold uppercase">{s.label}</p>
            <p className="text-headline-md text-on-surface font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="admin-glass-card rounded-xl p-4">
        <h2 className="text-headline-sm text-on-surface font-semibold mb-4">Recent Activity</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 px-4 text-label-md text-on-surface-variant font-semibold">User</th>
                <th className="py-3 px-4 text-label-md text-on-surface-variant font-semibold">Type</th>
                <th className="py-3 px-4 text-label-md text-on-surface-variant font-semibold">Amount</th>
                <th className="py-3 px-4 text-label-md text-on-surface-variant font-semibold">Status</th>
                <th className="py-3 px-4 text-label-md text-on-surface-variant font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="p-4"><Skeleton className="h-6" count={5} /></td></tr>
              ) : stats?.recentActivity?.map((t, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-body-sm text-on-surface">{t.user_name}</td>
                  <td className="py-3 px-4 text-body-sm text-on-surface-variant">{t.type}</td>
                  <td className="py-3 px-4 text-body-sm text-primary font-semibold">₹{t.amount}</td>
                  <td className="py-3 px-4"><span className={t.status === 'completed' ? 'badge-completed' : 'badge-pending'}>{t.status}</span></td>
                  <td className="py-3 px-4 text-body-sm text-on-surface-variant">{new Date(t.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
