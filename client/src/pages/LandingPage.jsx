import { useState } from 'react';
import { Link } from 'react-router-dom';
import GlowOrbs from '../components/layout/GlowOrbs';
import Footer from '../components/layout/Footer';
import AdBanner from '../components/ui/AdBanner';
import NativeBanner from '../components/ui/NativeBanner';
import SmartLink from '../components/ui/SmartLink';

const faqs = [
  { q: 'How does DataSell work?', a: 'DataSell connects your unused mobile data to buyers in the decentralized marketplace. You select a package, and we securely route your excess bandwidth through our encrypted nodes.' },
  { q: 'How much can I earn?', a: 'You earn ₹200 per GB of data sold. With our referral program, you can earn an additional ₹50 for every friend you invite.' },
  { q: 'Is my data safe?', a: 'Absolutely. All data is encrypted end-to-end through our secure node network. Your personal information is never exposed to buyers.' },
  { q: 'How long does it take to complete a sale?', a: '1GB takes approximately 24 hours. Larger packages take proportionally longer. Payouts are credited instantly upon completion.' },
  { q: 'What is the minimum withdrawal?', a: 'The minimum withdrawal amount is ₹200. Withdrawals via UPI are processed within minutes, while bank transfers take 2-3 business days.' },
];

const testimonials = [
  { name: 'Rahul K.', rating: 5, text: 'Made ₹3,000 in my first month just from unused data. The best passive income app!', role: 'College Student' },
  { name: 'Priya S.', rating: 5, text: 'Super easy to use. I just set it up once and the money keeps coming. Love the referral bonuses too.', role: 'Freelancer' },
  { name: 'Amit D.', rating: 4, text: 'Great platform with fast payouts. The dark mode UI is absolutely stunning. Highly recommend!', role: 'Software Developer' },
];

export default function LandingPage() {
  const [sliderValue, setSliderValue] = useState(3);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-on-background relative flex flex-col overflow-x-hidden">
      <GlowOrbs />

      {/* TopAppBar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(122,208,255,0.15)] flex justify-between items-center px-5 md:px-10 h-16 max-w-7xl mx-auto left-0 right-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>sensors</span>
          <span className="text-headline-md tracking-tighter text-primary font-extrabold">DataSell</span>
        </div>
        <Link to="/auth" className="bg-primary text-on-primary text-label-md font-semibold px-6 py-2 rounded-full hover:bg-primary-fixed hover:shadow-[0_0_15px_rgba(143,214,255,0.5)] transition-all active:scale-95 duration-200">
          Get Started
        </Link>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-8 px-5 md:px-10 w-full max-w-7xl mx-auto flex flex-col gap-20 relative z-10">

        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-8 min-h-[500px]">
          <div className="flex-1 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 bg-surface-container/50 border border-outline-variant/30 px-3 py-1 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse" />
              <span className="text-label-md text-secondary-fixed font-semibold">Live Network</span>
            </div>
            <h1 className="text-display-lg text-primary-fixed font-extrabold leading-tight">Sell Your Unused Mobile Data</h1>
            <h2 className="text-headline-lg text-secondary-container font-bold">&amp; Earn ₹200 Per GB</h2>
            <p className="text-body-lg text-on-surface-variant max-w-xl">Join the decentralized data marketplace. Turn your excess bandwidth into passive income securely and anonymously.</p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link to="/auth" className="btn-primary px-8 py-3 text-headline-sm text-center">Start Selling Now</Link>
              <a href="#how-it-works" className="btn-outline px-8 py-3 text-headline-sm text-center">See How It Works</a>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <div className="flex">
                {[1,2,3,4].map(i => (
                  <span key={i} className="material-symbols-outlined text-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
                <span className="material-symbols-outlined text-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
              </div>
              <span className="text-body-md text-on-surface-variant"><strong>4.8</strong> Rating from 10k+ users</span>
            </div>
          </div>
          <div className="flex-1 relative w-full max-w-md mx-auto">
            <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full" />
            <img
              alt="DataSell Dashboard"
              className="relative z-10 w-full h-auto rounded-[32px] border-4 border-surface-container-high shadow-2xl object-cover aspect-[9/16]"
              src="/hero-phone.png"
            />
          </div>
        </section>

        {/* Banner Ad 728x90 */}
        <div className="flex justify-center w-full">
          <AdBanner adKey="137ac60323a46f587ab9c7d2f5bfe5d2" width={728} height={90} />
        </div>

        {/* How It Works */}
        <section id="how-it-works" className="flex flex-col items-center gap-12">
          <div className="text-center">
            <h2 className="text-headline-lg text-on-surface font-bold mb-2">How It Works</h2>
            <p className="text-body-lg text-on-surface-variant">Three simple steps to start earning</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {[
              { icon: 'sim_card', title: 'Select Package', desc: 'Choose how much data you want to sell (1GB-10GB). Bigger packages earn more.', step: '01' },
              { icon: 'cell_tower', title: 'Connect & Sell', desc: 'Our encrypted nodes securely route your unused bandwidth to the marketplace.', step: '02' },
              { icon: 'account_balance_wallet', title: 'Get Paid', desc: 'Earnings are credited to your wallet automatically. Withdraw via UPI or bank.', step: '03' },
            ].map((item, i) => (
              <div key={i} className="glass-card rounded-xl p-6 flex flex-col gap-4 hover:shadow-[0_0_20px_rgba(143,214,255,0.15)] transition-all group">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                  </div>
                  <span className="text-display-lg text-surface-container-high font-extrabold group-hover:text-primary/20 transition-colors">{item.step}</span>
                </div>
                <h3 className="text-headline-sm text-on-surface font-semibold">{item.title}</h3>
                <p className="text-body-sm text-on-surface-variant">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Banner Ad 468x60 */}
        <div className="flex justify-center w-full">
          <AdBanner adKey="57eb44a0b02710f63520dd7f65f72881" width={468} height={60} />
        </div>

        {/* Earnings Calculator */}
        <section className="flex flex-col items-center gap-8">
          <div className="text-center">
            <h2 className="text-headline-lg text-on-surface font-bold mb-2">Earnings Calculator</h2>
            <p className="text-body-lg text-on-surface-variant">See how much you can earn</p>
          </div>
          <div className="glass-card rounded-xl p-8 w-full max-w-xl flex flex-col items-center gap-6">
            <div className="text-center">
              <span className="text-display-lg text-primary font-extrabold text-glow-primary">{sliderValue}GB</span>
              <p className="text-body-md text-on-surface-variant mt-1">per month</p>
            </div>
            <input
              type="range" min="1" max="10" value={sliderValue}
              onChange={(e) => setSliderValue(parseInt(e.target.value))}
              className="w-full h-2 bg-surface-container rounded-full appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between w-full text-body-sm text-on-surface-variant">
              <span>1GB</span><span>5GB</span><span>10GB</span>
            </div>
            <div className="w-full border-t border-white/10 pt-4 flex justify-between items-center">
              <span className="text-body-lg text-on-surface-variant">Monthly Earnings</span>
              <span className="text-headline-lg text-secondary-container font-bold text-glow-green">₹{sliderValue * 200}</span>
            </div>
            <SmartLink className="btn-primary w-full py-3 text-headline-sm text-center mt-2 block">Start Earning Now</SmartLink>
          </div>
        </section>

        {/* Testimonials */}
        <section className="flex flex-col items-center gap-8">
          <h2 className="text-headline-lg text-on-surface font-bold">What Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {testimonials.map((t, i) => (
              <div key={i} className="glass-card rounded-xl p-6 flex flex-col gap-4">
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} className="material-symbols-outlined text-tertiary-container text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <p className="text-body-md text-on-surface-variant flex-1">"{t.text}"</p>
                <div>
                  <p className="text-body-md text-on-surface font-semibold">{t.name}</p>
                  <p className="text-body-sm text-on-surface-variant">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Banner Ad 300x250 */}
        <div className="flex justify-center w-full">
          <AdBanner adKey="a935041c2501b424b15c5b5b6113ae98" width={300} height={250} />
        </div>

        {/* FAQ */}
        <section className="flex flex-col items-center gap-8 mb-8">
          <h2 className="text-headline-lg text-on-surface font-bold">Frequently Asked Questions</h2>
          <div className="w-full max-w-3xl flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-body-lg text-on-surface font-semibold">{faq.q}</span>
                  <span className={`material-symbols-outlined text-primary transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40 pb-4' : 'max-h-0'}`}>
                  <p className="px-6 text-body-md text-on-surface-variant">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Native Banner */}
        <NativeBanner className="mt-4" />

        {/* Mobile Banner 320x50 */}
        <div className="flex justify-center md:hidden">
          <AdBanner adKey="81344be2c74c13c4cc40af361eac118d" width={320} height={50} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
