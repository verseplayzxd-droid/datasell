import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/axios';
import GlowOrbs from '../../components/layout/GlowOrbs';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminApi.post('/login', { email, password });
      localStorage.setItem('datasell_admin_token', res.data.token);
      localStorage.setItem('datasell_admin', JSON.stringify(res.data.admin));
      toast.success('Admin access granted');
      navigate('/admin/dashboard');
    } catch(err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-on-background flex items-center justify-center relative">
      <GlowOrbs />
      <div className="admin-glass-card rounded-2xl p-8 w-full max-w-md relative z-10">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="material-symbols-outlined text-admin-red text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
          <h1 className="text-headline-lg text-admin-red font-extrabold tracking-tight">ADMIN PANEL</h1>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-label-md text-on-surface-variant mb-2 block font-semibold">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="glass-input w-full rounded-xl py-3 px-4 text-body-md" placeholder="admin@email.com" required />
          </div>
          <div>
            <label className="text-label-md text-on-surface-variant mb-2 block font-semibold">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="glass-input w-full rounded-xl py-3 px-4 text-body-md" placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-full bg-admin-red text-white font-semibold text-headline-sm mt-4 hover:shadow-[0_0_20px_rgba(255,68,68,0.5)] transition-all active:scale-95 disabled:opacity-50">
            {loading ? 'Authenticating...' : 'Access Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}
