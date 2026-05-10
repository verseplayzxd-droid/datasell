import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import Skeleton from '../components/ui/Skeleton';

export default function ReferralPage() {
  const [code, setCode] = useState('');
  const [stats, setStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [codeRes, statsRes, listRes] = await Promise.all([
          api.get('/referral/code'), api.get('/referral/stats'), api.get('/referral/list'),
        ]);
        setCode(codeRes.data.referralCode);
        setStats(statsRes.data);
        setReferrals(listRes.data);
      } catch(e) {} finally { setLoading(false); }
    })();
  }, []);

  const copyCode = () => { navigator.clipboard.writeText(code); toast.success('Code copied!'); };
  const shareWhatsApp = () => window.open(`https://wa.me/?text=Join%20DataSell%20and%20earn%20money!%20Use%20my%20code:%20${code}`, '_blank');
  const shareTelegram = () => window.open(`https://t.me/share/url?url=https://datasell.app&text=Join%20DataSell%20with%20code:%20${code}`, '_blank');

  return (
    <DashboardLayout>
      {/* Hero */}
      <section className="glass-card rounded-xl p-4 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
        <div className="z-10 flex flex-col gap-4 max-w-lg">
          <h1 className="text-display-lg text-on-surface font-extrabold">Refer Friends &amp; Earn <span className="text-secondary-fixed-dim">₹50</span> Each!</h1>
          <p className="text-body-lg text-on-surface-variant">Build your network. When your friends start selling data, you both get a bonus.</p>
        </div>
      </section>

      {/* Code & Stats */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 glass-card rounded-xl p-4 md:p-8 flex flex-col gap-6">
          <h3 className="text-headline-md text-on-surface font-bold">Your Invite Code</h3>
          <div className="flex items-center bg-[#1A1A1A] border border-outline-variant rounded-xl p-2 relative focus-within:border-primary focus-within:shadow-[0_0_10px_rgba(143,214,255,0.3)] transition-all">
            <input className="bg-transparent border-none text-on-surface text-headline-sm font-semibold w-full focus:ring-0 px-4 text-center tracking-widest uppercase" readOnly value={loading ? '...' : code} />
            <button onClick={copyCode} className="absolute right-2 bg-surface-variant hover:bg-surface-bright text-on-surface p-2 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[20px]">content_copy</span>
            </button>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="h-[1px] flex-1 bg-outline-variant/50" />
            <span className="text-label-md text-on-surface-variant font-semibold">SHARE VIA</span>
            <div className="h-[1px] flex-1 bg-outline-variant/50" />
          </div>
          <div className="flex justify-center gap-4">
            <button onClick={shareWhatsApp} className="w-12 h-12 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] flex items-center justify-center hover:bg-[#25D366]/20 hover:shadow-[0_0_15px_rgba(37,211,102,0.3)] transition-all">
              <span className="material-symbols-outlined">chat</span>
            </button>
            <button onClick={shareTelegram} className="w-12 h-12 rounded-full bg-[#0088cc]/10 border border-[#0088cc]/30 text-[#0088cc] flex items-center justify-center hover:bg-[#0088cc]/20 hover:shadow-[0_0_15px_rgba(0,136,204,0.3)] transition-all">
              <span className="material-symbols-outlined">send</span>
            </button>
            <button className="w-12 h-12 rounded-full bg-surface-variant border border-outline-variant text-on-surface flex items-center justify-center hover:bg-surface-bright transition-all">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>
        </div>
        <div className="md:col-span-5 grid grid-rows-3 gap-4">
          {loading ? <Skeleton className="h-20" count={3} /> : (
            <>
              <div className="glass-card rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center"><span className="material-symbols-outlined">group</span></div>
                  <div><p className="text-label-md text-on-surface-variant uppercase font-semibold">Friends Invited</p><p className="text-headline-md text-on-surface font-bold">{stats?.friendsInvited || 0}</p></div>
                </div>
              </div>
              <div className="glass-card rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-secondary-fixed-dim/10 blur-xl rounded-full" />
                <div className="flex items-center gap-3 z-10">
                  <div className="w-10 h-10 rounded-full bg-secondary-fixed-dim/10 text-secondary-fixed-dim flex items-center justify-center"><span className="material-symbols-outlined">account_balance_wallet</span></div>
                  <div><p className="text-label-md text-on-surface-variant uppercase font-semibold">Total Earnings</p><p className="text-headline-md text-secondary-fixed-dim font-bold">₹{stats?.totalEarnings || 0}</p></div>
                </div>
              </div>
              <div className="glass-card rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-tertiary-fixed-dim/10 text-tertiary-fixed-dim flex items-center justify-center"><span className="material-symbols-outlined">hourglass_empty</span></div>
                  <div><p className="text-label-md text-on-surface-variant uppercase font-semibold">Pending</p><p className="text-headline-md text-tertiary-fixed-dim font-bold">{stats?.pendingVerification || 0}</p></div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Referral List */}
      {referrals.length > 0 && (
        <section className="glass-card rounded-xl p-4 md:p-8 flex flex-col gap-6">
          <h3 className="text-headline-md text-on-surface font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary-fixed-dim">emoji_events</span> Your Referrals
          </h3>
          <div className="flex flex-col gap-2">
            {referrals.map((r, i) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-headline-sm text-outline w-6 text-center font-bold">{i + 1}</span>
                  <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant font-bold">{r.name?.charAt(0)?.toUpperCase()}</div>
                  <span className="text-body-md text-on-surface">{r.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-headline-sm text-secondary-fixed-dim font-bold block">₹{r.bonus_amount}</span>
                  <span className="text-label-md text-on-surface-variant">{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </DashboardLayout>
  );
}
