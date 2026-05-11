import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdBanner from '../ui/AdBanner';
import SmartLink from '../ui/SmartLink';

const navItems = [
  { path: '/dashboard', icon: 'grid_view', label: 'Dashboard' },
  { path: '/sell', icon: 'cell_tower', label: 'Sell Data' },
  { path: '/wallet', icon: 'payments', label: 'Wallet' },
  { path: '/history', icon: 'receipt_long', label: 'History' },
  { path: '/referrals', icon: 'share', label: 'Referrals' },
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex flex-col bg-background/95 backdrop-blur-2xl h-full w-72 fixed left-0 top-0 z-40 border-r border-white/10 shadow-2xl">
      {/* User Profile */}
      <div className="p-6 border-b border-white/10 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold text-lg">
          {user?.name?.charAt(0)?.toUpperCase() || 'D'}
        </div>
        <div>
          <h2 className="text-headline-sm text-on-surface font-semibold">{user?.name || 'Data Seller'}</h2>
          <p className="text-body-sm text-on-surface-variant">
            Pro Member <span className="text-secondary-fixed-dim text-[10px] ml-1 px-1.5 py-0.5 rounded bg-secondary-container/10">Verified</span>
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col py-4 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 py-3 px-6 transition-all duration-300 ${
                isActive
                  ? 'bg-secondary-container/10 text-secondary-fixed-dim border-l-4 border-secondary-fixed-dim'
                  : 'text-on-surface-variant hover:bg-white/5 hover:text-primary border-l-4 border-transparent'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Ad */}
      <div className="px-4 pb-2 flex flex-col items-center gap-2">
        <AdBanner adKey="03636bb437a6a159c1ce8ee22e29393d" width={160} height={300} />
        <SmartLink className="text-label-md text-primary/70 hover:text-primary transition-colors text-center block py-1">
          💰 Explore Offers
        </SmartLink>
      </div>
    </aside>
  );
}
