import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import Footer from './Footer';
import GlowOrbs from './GlowOrbs';
import NativeBanner from '../ui/NativeBanner';
import AdBanner from '../ui/AdBanner';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-on-background relative">
      <GlowOrbs />
      <Sidebar />
      <TopBar />
      <div className="pt-16 pb-24 md:pb-0 md:pl-72 flex flex-col min-h-screen">
        <main className="flex-1 w-full max-w-7xl mx-auto px-5 md:px-10 py-6 flex flex-col gap-6 relative z-10">
          {children}
          {/* Native Banner Ad */}
          <NativeBanner className="mt-4" />
          {/* Mobile Banner Ad (320x50) */}
          <div className="flex justify-center md:hidden mt-2">
            <AdBanner adKey="81344be2c74c13c4cc40af361eac118d" width={320} height={50} />
          </div>
        </main>
        <Footer />
      </div>
      <BottomNav />
    </div>
  );
}

