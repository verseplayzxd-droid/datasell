import { useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/axios';

export default function AdminAddMoney() {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState('admin_add');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const searchUsers = async (q) => {
    setSearch(q);
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const res = await adminApi.get('/users', { params: { search: q, limit: 5 } });
      setSearchResults(res.data.users);
    } catch(e) {}
  };

  const handleAdd = async () => {
    if (!selectedUser || !amount || parseFloat(amount) <= 0) return toast.error('Invalid input');
    setLoading(true);
    try {
      const res = await adminApi.post(`/users/${selectedUser.id}/add-money`, { amount: parseFloat(amount), note: `[${type}] ${note}` });
      toast.success(res.data.message + ` New balance: ₹${res.data.newBalance}`);
      setSelectedUser({ ...selectedUser, balance: res.data.newBalance });
      setAmount(''); setNote(''); setShowConfirm(false);
    } catch(e) { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-headline-lg text-on-surface font-bold">Add Money</h1>

      {/* Search */}
      <div className="admin-glass-card rounded-xl p-6 flex flex-col gap-4">
        <label className="text-headline-sm text-on-surface font-semibold">Search User</label>
        <input value={search} onChange={e => searchUsers(e.target.value)} className="glass-input rounded-lg px-4 py-3 text-body-md" placeholder="Search by phone or email..." />
        {searchResults.length > 0 && !selectedUser && (
          <div className="flex flex-col gap-1 bg-surface-container rounded-lg overflow-hidden">
            {searchResults.map(u => (
              <button key={u.id} onClick={() => { setSelectedUser(u); setSearchResults([]); }} className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex justify-between">
                <span className="text-on-surface font-semibold">{u.name}</span>
                <span className="text-on-surface-variant text-body-sm">{u.email}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected User Card */}
      {selectedUser && (
        <div className="admin-glass-card rounded-xl p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-headline-sm text-on-surface font-bold">{selectedUser.name}</h3>
              <p className="text-body-sm text-on-surface-variant">{selectedUser.email}</p>
            </div>
            <button onClick={() => { setSelectedUser(null); setSearch(''); }} className="text-on-surface-variant hover:text-admin-red">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="flex gap-4">
            <div className="glass-card p-3 rounded-lg flex-1 text-center">
              <p className="text-label-md text-on-surface-variant font-semibold">Balance</p>
              <p className="text-headline-md text-primary font-bold">₹{selectedUser.balance}</p>
            </div>
            <div className="glass-card p-3 rounded-lg flex-1 text-center">
              <p className="text-label-md text-on-surface-variant font-semibold">Total Earned</p>
              <p className="text-headline-md text-secondary-fixed-dim font-bold">₹{selectedUser.total_earned}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <label className="text-label-md text-on-surface-variant font-semibold">Amount (₹)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="glass-input rounded-lg px-4 py-3 text-body-lg" placeholder="Enter amount" />

            <label className="text-label-md text-on-surface-variant font-semibold">Reason/Note</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} className="glass-input rounded-lg px-4 py-3 text-body-md" placeholder="e.g. Manual payout, Bonus" />

            <label className="text-label-md text-on-surface-variant font-semibold">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="glass-input rounded-lg px-4 py-3 text-body-md">
              <option value="admin_add">Manual Add</option>
              <option value="sale_bonus">Sale Bonus</option>
              <option value="referral_bonus">Referral Bonus</option>
              <option value="correction">Correction</option>
            </select>

            <button onClick={() => setShowConfirm(true)} disabled={!amount} className="btn-primary py-3 text-headline-sm mt-2 disabled:opacity-50 bg-admin-red hover:shadow-[0_0_20px_rgba(255,68,68,0.4)]">
              Add ₹{amount || 0} to {selectedUser.name}
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowConfirm(false)}>
          <div className="admin-glass-card rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-headline-sm text-admin-gold font-bold mb-4">⚠️ Confirm Addition</h2>
            <p className="text-body-md text-on-surface-variant mb-4">
              Add <span className="text-admin-red font-bold">₹{amount}</span> to <span className="text-on-surface font-semibold">{selectedUser?.name}</span>?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 rounded-full bg-surface-variant text-on-surface-variant font-semibold">Cancel</button>
              <button onClick={handleAdd} disabled={loading} className="flex-1 py-2 rounded-full bg-admin-red text-white font-semibold disabled:opacity-50">{loading ? 'Adding...' : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
