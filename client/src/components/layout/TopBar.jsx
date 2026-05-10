import { Link } from 'react-router-dom';

export default function TopBar() {
  return (
    <header className="bg-background/80 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-white/10 shadow-[0_0_20px_rgba(122,208,255,0.15)] flex justify-between items-center px-5 md:px-10 h-16 md:w-[calc(100%-18rem)] md:left-72">
      <Link to="/dashboard" className="flex items-center gap-2 text-primary">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>sensors</span>
        <span className="text-headline-md tracking-tighter font-extrabold">DataSell</span>
      </Link>
      <Link
        to="/sell"
        className="bg-primary text-on-primary px-4 py-2 rounded-full text-label-md font-semibold hover:shadow-[0_0_15px_rgba(143,214,255,0.5)] transition-all active:scale-95 duration-200"
      >
        Get Started
      </Link>
    </header>
  );
}
