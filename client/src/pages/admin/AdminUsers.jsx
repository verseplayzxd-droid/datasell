import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/axios';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [addMoneyModal, setAddMoneyModal] = useState(null);
  const [addAmount, setAddAmount] = useState('');
  const [addNote, setAddNote] = useState('');

  useEffect(() => { fetchUsers(); }, [page, search, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/users', { params: { search, status: statusFilter, page, limit: 15 } });
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch(e) {} finally { setLoading(false); }
  };

  const banUser = async (id) => {
    try {
      const res = await adminApi.post(`/users/${id}/ban`);
      toast.success(res.data.message);
      fetchUsers();
    } catch(e) { toast.error('Failed'); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminApi.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch(e) { toast.error('Failed'); }
  };

  const handleAddMoney = async () => {
    if (!addAmount || parseFloat(addAmount) <= 0) return toast.error('Invalid amount');
    try {
      const res = await adminApi.post(`/users/${addMoneyModal.id}/add-money`, { amount: parseFloat(addAmount), note: addNote });
      toast.success(res.data.message);
      setAddMoneyModal(null); setAddAmount(''); setAddNote('');
      fetchUsers();
    } catch(e) { toast.error('Failed'); }
  };

  const viewUser = async (id) => {
    try {
      const res = await adminApi.get(`/users/${id}`);
      setSelectedUser(res.data);
    } catch(e) { toast.error('Failed to load user'); }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-headline-lg text-on-surface font-bold">Users Management</h1>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="glass-input rounded-lg px-4 py-2 text-body-sm flex-1" placeholder="Search by name, phone, or email..." />
        <div className="flex gap-2">
          {['all','active','banned'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`px-4 py-2 rounded-full text-label-md font-semibold transition-colors ${statusFilter === s ? 'bg-admin-red text-white' : 'bg-surface-variant text-on-surface-variant hover:bg-white/10'}`}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10 bg-surface-container-low/30">
                {['ID','Name','Email','Phone','Balance','Earned','Status','Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-label-md text-on-surface-variant font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-body-sm text-outline font-mono">#{u.id}</td>
                  <td className="py-3 px-4 text-body-sm text-on-surface font-semibold">{u.name}</td>
                  <td className="py-3 px-4 text-body-sm text-on-surface-variant">{u.email}</td>
                  <td className="py-3 px-4 text-body-sm text-on-surface-variant">{u.phone || '—'}</td>
                  <td className="py-3 px-4 text-body-sm text-primary font-semibold">₹{u.balance}</td>
                  <td className="py-3 px-4 text-body-sm text-secondary-fixed-dim font-semibold">₹{u.total_earned}</td>
                  <td className="py-3 px-4"><span className={!u.is_banned ? 'badge-completed' : 'badge-failed'}>{u.is_banned ? 'banned' : 'active'}</span></td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button onClick={() => viewUser(u.id)} className="p-1 hover:bg-white/10 rounded" title="View"><span className="material-symbols-outlined text-[18px] text-primary">visibility</span></button>
                      <button onClick={() => setAddMoneyModal(u)} className="p-1 hover:bg-white/10 rounded" title="Add Money"><span className="material-symbols-outlined text-[18px] text-secondary-fixed-dim">add_circle</span></button>
                      <button onClick={() => banUser(u.id)} className="p-1 hover:bg-white/10 rounded" title="Ban/Unban"><span className="material-symbols-outlined text-[18px] text-tertiary-fixed-dim">block</span></button>
                      <button onClick={() => deleteUser(u.id)} className="p-1 hover:bg-white/10 rounded" title="Delete"><span className="material-symbols-outlined text-[18px] text-admin-red">delete</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-white/5 p-4 flex justify-between items-center">
          <span className="text-body-sm text-on-surface-variant">Total: {total} users</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page-1))} disabled={page===1} className="px-3 py-1 rounded bg-surface-container border border-outline-variant/30 text-on-surface-variant text-sm disabled:opacity-50">Prev</button>
            <span className="px-3 py-1 text-on-surface text-sm font-semibold">Page {page}</span>
            <button onClick={() => setPage(page+1)} disabled={users.length < 15} className="px-3 py-1 rounded bg-surface-container border border-outline-variant/30 text-on-surface-variant text-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {/* Add Money Modal */}
      {addMoneyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setAddMoneyModal(null)}>
          <div className="admin-glass-card rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-headline-sm text-on-surface font-bold mb-4">Add Money to {addMoneyModal.name}</h2>
            <p className="text-body-sm text-on-surface-variant mb-4">Current balance: <span className="text-primary font-semibold">₹{addMoneyModal.balance}</span></p>
            <div className="flex flex-col gap-3">
              <input type="number" value={addAmount} onChange={e => setAddAmount(e.target.value)} className="glass-input rounded-lg px-4 py-2 text-body-md" placeholder="Amount (₹)" />
              <input type="text" value={addNote} onChange={e => setAddNote(e.target.value)} className="glass-input rounded-lg px-4 py-2 text-body-md" placeholder="Reason/Note" />
              <div className="flex gap-2 mt-2">
                <button onClick={() => setAddMoneyModal(null)} className="flex-1 py-2 rounded-full bg-surface-variant text-on-surface-variant font-semibold">Cancel</button>
                <button onClick={handleAddMoney} className="flex-1 py-2 rounded-full bg-admin-red text-white font-semibold hover:shadow-[0_0_15px_rgba(255,68,68,0.4)] transition-all">Add Money</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div className="admin-glass-card rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-headline-sm text-on-surface font-bold mb-4">User #{selectedUser.user.id}</h2>
            <div className="grid grid-cols-2 gap-3 text-body-sm mb-4">
              {Object.entries(selectedUser.user).filter(([k]) => k !== 'password_hash').map(([k,v]) => (
                <div key={k}><span className="text-on-surface-variant">{k}:</span> <span className="text-on-surface font-semibold">{String(v)}</span></div>
              ))}
            </div>
            <button onClick={() => setSelectedUser(null)} className="w-full py-2 rounded-full bg-surface-variant text-on-surface-variant font-semibold mt-4">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
