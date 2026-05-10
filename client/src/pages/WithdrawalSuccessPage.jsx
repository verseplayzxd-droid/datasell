import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import GlowOrbs from '../components/layout/GlowOrbs';
import AdZone from '../components/ui/AdZone';

export default function WithdrawalSuccessPage() {
  const location = useLocation();
  const amount = location.state?.amount || 200;
  const method = location.state?.method || 'upi';

  useEffect(() => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#00bfff','#34ff8d','#FFD700','#8fd6ff'] });
    const t = setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { y: 0.5 } }), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-on-background flex flex-col relative">
      <GlowOrbs />
      <main className="flex-grow flex items-center justify-center p-5 md:p-10 w-full max-w-7xl mx-auto relative z-10">
        <div className="w-full max-w-md flex flex-col items-center text-center gap-8">
          {/* Success Icon */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full rotating-ring animate-spin opacity-80" style={{ animationDuration: '4s' }} />
            <div className="absolute inset-2 bg-[#0A0A0A] rounded-full z-10 flex items-center justify-center shadow-[0_0_30px_rgba(52,255,141,0.2)]">
              <span className="material-symbols-outlined text-6xl text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
          </div>
          {/* Header */}
          <div>
            <h1 className="text-display-lg text-on-surface font-extrabold">Withdrawal Requested! <span className="inline-block">🎉</span></h1>
            <p className="text-body-lg text-on-surface-variant mt-2">Your funds are on their way.</p>
          </div>
          {/* Details Card */}
          <div className="glass-card w-full rounded-xl p-4 flex flex-col gap-3 text-left">
            <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
              <span className="text-body-sm text-on-surface-variant">Request ID</span>
              <span className="text-body-sm text-on-surface font-semibold tracking-wider">#DS{Date.now().toString().slice(-10)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
              <span className="text-body-sm text-on-surface-variant">Amount</span>
              <span className="text-headline-sm text-secondary-container font-bold">₹{amount}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
              <span className="text-body-sm text-on-surface-variant">Method</span>
              <span className="text-body-sm text-on-surface font-semibold">{method.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-body-sm text-on-surface-variant">Status</span>
              <div className="bg-tertiary-container/20 text-tertiary px-3 py-1 rounded-full flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] animate-pulse">hourglass_empty</span>
                <span className="text-label-md font-semibold">Processing</span>
              </div>
            </div>
          </div>
          {/* Ad Zone */}
          <AdZone id="ad-success-page" height="200px" width="100%" label="Full Screen Ad Zone" />
          {/* Buttons */}
          <div className="w-full flex flex-col gap-3">
            <Link to="/sell" className="btn-primary w-full py-4 text-headline-sm flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">bolt</span> Sell More Data
            </Link>
            <Link to="/dashboard" className="btn-outline w-full py-4 text-headline-sm flex items-center justify-center gap-2">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
