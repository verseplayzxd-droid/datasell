import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/axios';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await adminApi.get('/announcements');
      setAnnouncements(res.data);
    } catch(e) {} finally { setLoading(false); }
  };

  const create = async (e) => {
    e.preventDefault();
    if (!title || !message) return toast.error('Fill all fields');
    try {
      await adminApi.post('/announcements', { title, message });
      toast.success('Announcement created');
      setTitle(''); setMessage('');
      fetchAnnouncements();
    } catch(e) { toast.error('Failed'); }
  };

  const toggle = async (id, currentActive) => {
    try {
      await adminApi.put(`/announcements/${id}`, { is_active: !currentActive });
      toast.success('Updated');
      fetchAnnouncements();
    } catch(e) { toast.error('Failed'); }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-headline-lg text-on-surface font-bold">Announcements</h1>

      {/* Create */}
      <form onSubmit={create} className="admin-glass-card rounded-xl p-6 flex flex-col gap-4">
        <h2 className="text-headline-sm text-on-surface font-semibold">Create New Announcement</h2>
        <input value={title} onChange={e => setTitle(e.target.value)} className="glass-input rounded-lg px-4 py-3 text-body-md" placeholder="Announcement title" />
        <textarea value={message} onChange={e => setMessage(e.target.value)} className="glass-input rounded-lg px-4 py-3 text-body-md h-24 resize-none" placeholder="Announcement message..." />
        <button type="submit" className="self-end px-6 py-2 rounded-full bg-admin-red text-white font-semibold hover:shadow-[0_0_15px_rgba(255,68,68,0.4)] transition-all">Publish</button>
      </form>

      {/* List */}
      <div className="flex flex-col gap-3">
        {announcements.map(a => (
          <div key={a.id} className={`admin-glass-card rounded-xl p-4 flex justify-between items-start gap-4 ${!a.is_active && 'opacity-50'}`}>
            <div>
              <h3 className="text-body-lg text-on-surface font-semibold">{a.title}</h3>
              <p className="text-body-sm text-on-surface-variant mt-1">{a.message}</p>
              <p className="text-label-md text-outline mt-2">{new Date(a.created_at).toLocaleDateString()}</p>
            </div>
            <button onClick={() => toggle(a.id, a.is_active)} className={`px-3 py-1 rounded-full text-label-md font-semibold ${a.is_active ? 'bg-secondary-fixed-dim/20 text-secondary-fixed-dim' : 'bg-surface-variant text-on-surface-variant'}`}>
              {a.is_active ? 'Active' : 'Inactive'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
