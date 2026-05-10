import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import AdZone from '../components/ui/AdZone';

const packages = [
  { gb: 1, price: 200, icon: 'wifi', label: '' },
  { gb: 2, price: 400, icon: 'bolt', label: 'Most Popular' },
  { gb: 5, price: 1000, icon: 'database', label: '' },
  { gb: 10, price: 2000, icon: 'cloud_upload', label: '' },
];
const HOURS_MAP = { 1: 24, 2: 48, 5: 120, 10: 240 };

export default function SellDataPage() {
  const [selected, setSelected] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checklist, setChecklist] = useState([false, false, false]);
  const navigate = useNavigate();

  const startSell = () => {
    if (!selected) return toast.error('Select a package first!');
    setStep(2);
    setTimeout(() => setChecklist([true, false, false]), 800);
    setTimeout(() => setChecklist([true, true, false]), 2000);
    setTimeout(() => setChecklist([true, true, true]), 3200);
    setTimeout(() => setStep(3), 4000);
  };

  const confirmSell = async () => {
    setLoading(true);
    try {
      await api.post('/sell/start', { dataGb: selected.gb });
      toast.success(`${selected.gb}GB sell order created!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create order');
    } finally { setLoading(false); }
  };

  const pw = step === 1 ? '0%' : step === 2 ? '50%' : '100%';

  return (
    <DashboardLayout>
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold mb-1">Sell Your Data</h1>
          <p className="text-body-md text-on-surface-variant">Turn unused mobile data into digital currency instantly.</p>
        </div>
        <div className="flex items-center justify-between w-full max-w-2xl mx-auto mt-6 relative">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-surface-container -z-10 -translate-y-1/2" />
          <div className="absolute top-1/2 left-0 h-[2px] bg-primary -z-10 -translate-y-1/2 shadow-[0_0_8px_rgba(143,214,255,0.5)] transition-all duration-500" style={{ width: pw }} />
          {[{ n:1, l:'Select Amount' },{ n:2, l:'Connect SIM' },{ n:3, l:'Confirm' }].map(s => (
            <div key={s.n} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= s.n ? 'bg-primary text-background shadow-[0_0_12px_rgba(143,214,255,0.6)]' : 'bg-surface-container border border-outline/30 text-outline'}`}>{s.n}</div>
              <span className={`text-label-md ${step >= s.n ? 'text-primary' : 'text-outline'}`}>{s.l}</span>
            </div>
          ))}
        </div>
      </header>

      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <h2 className="text-headline-sm text-on-surface font-semibold">Available Packages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packages.map(pkg => (
                <button key={pkg.gb} onClick={() => setSelected(pkg)}
                  className={`glass-card rounded-xl p-4 flex flex-col gap-3 text-left transition-all group relative overflow-hidden ${selected?.gb === pkg.gb ? 'border-primary/50 shadow-[0_0_20px_rgba(143,214,255,0.2)] bg-surface-container/50' : 'hover:border-primary/50'}`}>
                  {pkg.label && <div className="absolute top-0 right-0 bg-primary text-background text-label-md font-semibold px-3 py-1 rounded-bl-lg">{pkg.label}</div>}
                  <div className={`flex justify-between items-start w-full ${pkg.label ? 'mt-4' : ''}`}>
                    <span className={`text-headline-lg font-bold ${selected?.gb === pkg.gb ? 'text-primary' : 'text-on-surface group-hover:text-primary'} transition-colors`}>{pkg.gb}GB</span>
                    <span className={`material-symbols-outlined ${selected?.gb === pkg.gb ? 'text-primary' : 'text-outline group-hover:text-primary'}`}>{pkg.icon}</span>
                  </div>
                  <div className={`mt-auto pt-4 border-t ${selected?.gb === pkg.gb ? 'border-primary/20' : 'border-white/5'} w-full`}>
                    <span className="text-headline-sm text-secondary-fixed-dim font-semibold">₹{pkg.price}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="bg-surface-container-high/50 border border-outline-variant/30 rounded-lg p-4 flex items-start gap-3 mt-4">
              <span className="material-symbols-outlined text-primary mt-0.5">info</span>
              <p className="text-body-sm text-on-surface-variant">Estimated sale time: <strong className="text-on-surface">1GB = 24 hours</strong>. Payouts credited instantly on completion.</p>
            </div>
          </div>
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center gap-6 relative overflow-hidden min-h-[300px]">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-surface-variant" />
                <div className="absolute inset-0 rounded-full border-4 border-secondary-fixed-dim border-t-transparent shadow-[0_0_15px_rgba(52,255,141,0.4)] animate-spin" style={{ animationDuration: '3s' }} />
                <span className="material-symbols-outlined text-4xl text-secondary-fixed-dim">sim_card</span>
              </div>
              {selected ? (
                <div className="text-center">
                  <p className="text-headline-md text-on-surface font-bold">{selected.gb}GB Package</p>
                  <p className="text-body-md text-on-surface-variant">Earnings: <span className="text-secondary-fixed-dim font-bold">₹{selected.price}</span></p>
                  <p className="text-body-sm text-on-surface-variant mt-1">Completes in {HOURS_MAP[selected.gb]}h</p>
                </div>
              ) : <p className="text-body-md text-on-surface-variant">Select a package to begin</p>}
            </div>
            <button onClick={startSell} disabled={!selected} className="w-full btn-primary py-4 text-headline-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              Initialize Sale <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col items-center gap-8 py-12">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-surface-variant" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent shadow-[0_0_15px_rgba(143,214,255,0.4)] animate-spin" style={{ animationDuration: '2s' }} />
            <span className="material-symbols-outlined text-5xl text-primary">cell_tower</span>
          </div>
          <h2 className="text-headline-md text-on-surface font-bold">Establishing Connection...</h2>
          <div className="w-full max-w-sm flex flex-col gap-3">
            {['SIM Connection Detected', 'Establishing Secure Node', 'Encrypting Data Stream'].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 ${checklist[i] ? 'text-on-surface' : 'text-on-surface-variant opacity-50'} transition-all duration-500`}>
                <span className="material-symbols-outlined text-sm" style={checklist[i] ? { fontVariationSettings: "'FILL' 1", color: '#00e479' } : {}}>
                  {checklist[i] ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span className="text-body-sm">{item}</span>
              </div>
            ))}
          </div>
          <AdZone id="ad-sell-loading" height="250px" width="300px" label="Interstitial Ad Zone" />
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center gap-8 py-8">
          <div className="w-20 h-20 rounded-full bg-secondary-fixed-dim/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-secondary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h2 className="text-headline-md text-on-surface font-bold">Ready to Start Selling</h2>
          <div className="glass-card rounded-xl p-6 w-full max-w-md flex flex-col gap-4">
            <div className="flex justify-between text-body-md"><span className="text-on-surface-variant">Package</span><span className="text-on-surface font-semibold">{selected?.gb}GB</span></div>
            <div className="flex justify-between text-body-md"><span className="text-on-surface-variant">Earnings</span><span className="text-secondary-fixed-dim font-semibold">₹{selected?.price}</span></div>
            <div className="flex justify-between text-body-md"><span className="text-on-surface-variant">Completion Time</span><span className="text-on-surface font-semibold">{HOURS_MAP[selected?.gb]}h</span></div>
            <div className="h-px bg-white/10 my-1" />
            <div className="flex justify-between text-headline-sm"><span className="text-primary font-semibold">Total Payout</span><span className="text-primary font-bold">₹{selected?.price}</span></div>
          </div>
          <button onClick={confirmSell} disabled={loading} className="btn-primary w-full max-w-md py-4 text-headline-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? 'Processing...' : 'Confirm & Start Selling'} {!loading && <span className="material-symbols-outlined">rocket_launch</span>}
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
