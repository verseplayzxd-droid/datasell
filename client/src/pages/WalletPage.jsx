import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import AdZone from '../components/ui/AdZone';
import Skeleton from '../components/ui/Skeleton';

export default function WalletPage() {
  const [balance, setBalance] = useState(null);
  const [method, setMethod] = useState('upi');
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bankDetails, setBankDetails] = useState({ accountName: '', accountNumber: '', ifscCode: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [balRes, histRes] = await Promise.all([
          api.get('/wallet/balance'),
          api.get('/withdraw/history'),
        ]);
        setBalance(balRes.data);
        setHistory(histRes.data);
      } catch(e) {} finally { setFetching(false); }
    })();
  }, []);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt < 200) return toast.error('Minimum withdrawal is ₹200');
    if (method === 'upi' && !upiId) return toast.error('Enter UPI ID');
    if (method === 'bank' && (!bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.ifscCode)) return toast.error('Fill all bank details');
    setLoading(true);
    try {
      await api.post('/withdraw/request', { amount: amt, method, upiId: method === 'upi' ? upiId : undefined, bankDetails: method === 'bank' ? bankDetails : undefined });
      toast.success('Withdrawal request submitted!');
      navigate('/withdrawal-success', { state: { amount: amt, method } });
    } catch(err) {
      toast.error(err.response?.data?.error || 'Withdrawal failed');
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      {/* Balance & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card rounded-xl p-4 lg:col-span-2 flex flex-col justify-center min-h-[200px] relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <span className="material-symbols-outlined text-[200px] text-primary">account_balance_wallet</span>
          </div>
          <div className="relative z-10">
            <h2 className="text-headline-sm text-on-surface-variant mb-2 font-semibold">Available Balance</h2>
            {fetching ? <Skeleton className="h-12 w-48" /> : (
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-tertiary-container text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
                <div className="text-display-lg text-primary font-extrabold">₹{balance?.balance || '0.00'}</div>
              </div>
            )}
            <div className="mt-3">
              <span className="bg-secondary-fixed-dim/20 text-secondary-fixed-dim text-label-md font-semibold px-3 py-1 rounded-full border border-secondary-fixed-dim/30">
                {balance?.balance >= 200 ? 'Ready to Withdraw' : 'Min ₹200 to withdraw'}
              </span>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 flex flex-col gap-3 border-l-4 border-l-tertiary-container justify-center">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-tertiary-container mt-1">info</span>
            <div>
              <h3 className="text-headline-sm text-on-surface font-semibold mb-1">Processing Time</h3>
              <p className="text-body-sm text-on-surface-variant">UPI transfers take 5-10 min. Bank transfers may take 2-3 business days.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="glass-card rounded-xl p-4 lg:col-span-7 flex flex-col gap-6">
          <h2 className="text-headline-md text-on-surface font-bold border-b border-white/10 pb-3">Withdraw Funds</h2>
          <form onSubmit={handleWithdraw} className="flex flex-col gap-4">
            <div>
              <label className="text-label-md text-on-surface-variant mb-2 block font-semibold">Withdrawal Amount (Min ₹200)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-headline-md text-primary font-bold">₹</span>
                <input type="number" min="200" value={amount} onChange={e => setAmount(e.target.value)} className="glass-input w-full rounded-xl py-3 pl-10 pr-4 text-body-lg" placeholder="Enter amount" />
              </div>
            </div>
            <div>
              <label className="text-label-md text-on-surface-variant mb-2 block font-semibold">Transfer Method</label>
              <div className="flex p-1 bg-surface-container-high rounded-lg gap-1">
                <button type="button" onClick={() => setMethod('upi')} className={`flex-1 py-2 text-body-sm rounded-md transition-colors ${method === 'upi' ? 'bg-surface-variant text-on-surface shadow-sm border border-white/5' : 'text-on-surface-variant hover:text-on-surface'}`}>UPI</button>
                <button type="button" onClick={() => setMethod('bank')} className={`flex-1 py-2 text-body-sm rounded-md transition-colors ${method === 'bank' ? 'bg-surface-variant text-on-surface shadow-sm border border-white/5' : 'text-on-surface-variant hover:text-on-surface'}`}>Bank Transfer</button>
              </div>
            </div>
            {method === 'upi' && (
              <div>
                <label className="text-label-md text-on-surface-variant mb-2 block font-semibold">UPI ID</label>
                <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} className="glass-input w-full rounded-xl py-3 px-4 text-body-md" placeholder="username@upi" />
              </div>
            )}
            {method === 'bank' && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-label-md text-on-surface-variant mb-2 block font-semibold">Account Name</label>
                  <input type="text" value={bankDetails.accountName} onChange={e => setBankDetails({...bankDetails, accountName: e.target.value})} className="glass-input w-full rounded-xl py-3 px-4 text-body-md" placeholder="Full Name" />
                </div>
                <div>
                  <label className="text-label-md text-on-surface-variant mb-2 block font-semibold">Account Number</label>
                  <input type="text" value={bankDetails.accountNumber} onChange={e => setBankDetails({...bankDetails, accountNumber: e.target.value})} className="glass-input w-full rounded-xl py-3 px-4 text-body-md" placeholder="Account Number" />
                </div>
                <div>
                  <label className="text-label-md text-on-surface-variant mb-2 block font-semibold">IFSC Code</label>
                  <input type="text" value={bankDetails.ifscCode} onChange={e => setBankDetails({...bankDetails, ifscCode: e.target.value})} className="glass-input w-full rounded-xl py-3 px-4 text-body-md" placeholder="e.g. HDFC0001234" />
                </div>
              </div>
            )}
          </form>
        </div>
        <div className="glass-card rounded-xl p-4 lg:col-span-5 flex flex-col gap-4 h-fit sticky top-24">
          <h3 className="text-headline-sm text-on-surface font-semibold border-b border-white/10 pb-3">Transaction Summary</h3>
          <div className="flex flex-col gap-3 text-body-sm">
            <div className="flex justify-between text-on-surface-variant"><span>Withdrawal Amount</span><span className="text-on-surface">₹{amount || '0'}</span></div>
            <div className="flex justify-between text-on-surface-variant"><span>Network Fee</span><span className="text-secondary-fixed-dim">Free</span></div>
            <div className="h-px bg-white/10 my-1" />
            <div className="flex justify-between text-headline-sm text-primary font-semibold"><span>Total Payout</span><span>₹{amount || '0'}</span></div>
          </div>
          <button onClick={handleWithdraw} disabled={loading} className="btn-primary w-full py-4 text-headline-sm mt-3 flex justify-center items-center gap-2 disabled:opacity-50">
            <span className="material-symbols-outlined">send</span> {loading ? 'Processing...' : 'Confirm Withdrawal'}
          </button>
          <AdZone id="ad-withdraw-confirm" height="250px" width="100%" label="Ad Zone (300x250)" />
        </div>
      </div>
    </DashboardLayout>
  );
}
