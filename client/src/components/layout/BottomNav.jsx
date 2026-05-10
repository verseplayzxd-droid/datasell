import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', icon: 'dashboard', label: 'Home' },
  { path: '/sell', icon: 'bolt', label: 'Sell' },
  { path: '/wallet', icon: 'account_balance_wallet', label: 'Wallet' },
  { path: '/history', icon: 'history', label: 'History' },
  { path: '/referrals', icon: 'group_add', label: 'Invite' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden bg-surface-container/90 backdrop-blur-lg fixed bottom-0 w-full z-50 rounded-t-xl border-t border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.5)] flex justify-around items-center h-20 px-2">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all duration-150 active:scale-90 ${
              isActive
                ? 'bg-primary-container/20 text-primary'
                : 'text-on-surface-variant hover:bg-white/5'
            }`}
          >
            <span
              className="material-symbols-outlined mb-1"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className="text-label-md">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
