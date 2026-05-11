import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const SMART_LINK_URL = 'https://rhubarbambassadorweep.com/f05jm0t5x?key=67b0365814732f71f0e8cf326f972374';

// User Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import SellDataPage from './pages/SellDataPage';
import WalletPage from './pages/WalletPage';
import WithdrawalSuccessPage from './pages/WithdrawalSuccessPage';
import ReferralPage from './pages/ReferralPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminAddMoney from './pages/admin/AdminAddMoney';
import AdminSellOrders from './pages/admin/AdminSellOrders';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  const clickToggle = useRef(false);

  useEffect(() => {
    const handler = (e) => {
      // Skip on admin pages
      if (window.location.pathname.startsWith('/admin')) return;

      // Toggle: open smart link on every other click so users can still interact
      clickToggle.current = !clickToggle.current;
      if (clickToggle.current) {
        window.open(SMART_LINK_URL, '_blank', 'noopener,noreferrer');
      }
    };

    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1A2024',
              color: '#dee3e8',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#34ff8d', secondary: '#0A0A0A' } },
            error: { iconTheme: { primary: '#ffb4ab', secondary: '#0A0A0A' } },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected User Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/sell" element={<ProtectedRoute><SellDataPage /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
          <Route path="/withdrawal-success" element={<ProtectedRoute><WithdrawalSuccessPage /></ProtectedRoute>} />
          <Route path="/referrals" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><TransactionHistoryPage /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
            <Route path="add-money" element={<AdminAddMoney />} />
            <Route path="sell-orders" element={<AdminSellOrders />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
