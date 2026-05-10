import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import GlowOrbs from '../../components/layout/GlowOrbs';

const navItems = [
  { path: '/admin/dashboard', icon: 'dashboard', label: 'Overview' },
  { path: '/admin/users', icon: 'group', label: 'Users' },
  { path: '/admin/transactions', icon: 'receipt_long', label: 'Transactions' },
  { path: '/admin/sell-orders', icon: 'cell_tower', label: 'Sell Orders' },
  { path: '/admin/withdrawals', icon: 'payments', label: 'Withdrawals' },
  { path: '/admin/add-money', icon: 'add_circle', label: 'Add Money' },
  { path: '/admin/announcements', icon: 'campaign', label: 'Announcements' },
  { path: '/admin/settings', icon: 'settings', label: 'Settings' },
];

export default function AdminLayout() {
  const location = useLocation();
  const token = localStorage.getItem('datasell_admin_token');
  if (!token) return <Navigate to="/admin/login" replace />;

  const admin = JSON.parse(localStorage.getItem('datasell_admin') || '{}');

  const logout = () => {
    localStorage.removeItem('datasell_admin_token');
    localStorage.removeItem('datasell_admin');
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-on-background relative">
      <GlowOrbs />
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col bg-background/95 backdrop-blur-2xl h-full w-64 fixed left-0 top-0 z-40 border-r border-admin-red/20 shadow-2xl">
        <div className="p-4 border-b border-admin-red/20 flex items-center gap-3">
          <span className="material-symbols-outlined text-admin-red" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
          <div>
            <h2 className="text-headline-sm text-admin-red font-bold">ADMIN</h2>
            <p className="text-body-sm text-on-surface-variant">{admin.name}</p>
          </div>
        </div>
        <nav className="flex flex-col py-2 flex-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 py-3 px-5 text-sm transition-all ${isActive ? 'admin-sidebar-active font-semibold' : 'text-on-surface-variant hover:bg-white/5 hover:text-admin-red border-l-4 border-transparent'}`}>
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-admin-red/20">
          <button onClick={logout} className="w-full flex items-center gap-2 text-on-surface-variant hover:text-admin-red transition-colors text-sm">
            <span className="material-symbols-outlined text-[20px]">logout</span> Logout
          </button>
        </div>
      </aside>
      {/* Top Bar */}
      <header className="bg-background/80 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-admin-red/20 flex justify-between items-center px-5 h-14 md:w-[calc(100%-16rem)] md:left-64">
        <div className="flex items-center gap-2">
          <span className="bg-admin-red/20 text-admin-red px-3 py-1 rounded-full text-label-md font-bold">ADMIN PANEL</span>
        </div>
        <Link to="/" className="text-body-sm text-on-surface-variant hover:text-primary transition-colors">← Back to Site</Link>
      </header>
      {/* Main */}
      <div className="pt-14 md:pl-64 min-h-screen">
        <main className="p-5 md:p-8 max-w-7xl mx-auto relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
