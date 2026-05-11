import { Link } from 'react-router-dom';
import SmartLink from '../ui/SmartLink';

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest w-full py-8 mt-auto border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center px-5 md:px-10 gap-4 relative z-10">
      <Link to="/" className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[20px]">sensors</span>
        <span className="text-headline-sm text-primary font-extrabold">DataSell</span>
      </Link>
      <div className="flex flex-wrap justify-center gap-4 text-body-sm text-on-surface-variant">
        <a href="#" className="hover:text-secondary transition-colors">Network Status</a>
        <a href="#" className="hover:text-secondary transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-secondary transition-colors">Terms of Trade</a>
        <a href="#" className="hover:text-secondary transition-colors">Node Support</a>
        <SmartLink className="hover:text-primary transition-colors text-secondary-fixed-dim font-semibold">
          🔥 Exclusive Deals
        </SmartLink>
      </div>
      <div className="text-body-sm text-on-surface-variant">
        © 2024 DataSell Protocol. All nodes secured.
      </div>
    </footer>
  );
}

