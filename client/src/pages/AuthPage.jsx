import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import GlowOrbs from '../components/layout/GlowOrbs';

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const [showOtp, setShowOtp] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const { register: regRegister, handleSubmit: handleRegSubmit, formState: { errors: regErrors }, reset: regReset } = useForm();

  const onLogin = async (data) => {
    try {
      const res = await api.post('/auth/login', data);
      login(res.data.token, res.data.user);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    }
  };

  const onRegister = async (data) => {
    try {
      const res = await api.post('/auth/register', {
        name: data.name,
        phone: data.phone,
        email: data.email,
        password: data.password,
        referralCode: data.referralCode || undefined,
      });
      login(res.data.token, res.data.user);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-on-background relative overflow-x-hidden">
      <GlowOrbs />
      <div className="min-h-screen flex items-center justify-center p-5 md:p-10">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-center">

          {/* Left Side: Branding */}
          <div className="hidden md:flex flex-col gap-6 pr-6 relative z-10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[32px]">sensors</span>
              <h1 className="text-display-lg text-primary tracking-tighter font-extrabold">DataSell</h1>
            </div>
            <h2 className="text-headline-lg text-on-background mt-8 font-bold">Monetize Your <br/><span className="text-secondary-fixed-dim">Digital Footprint</span></h2>
            <p className="text-body-lg text-on-surface-variant">Join the high-speed marketplace where your mobile data is treated as a premium digital currency.</p>
            <div className="flex flex-col gap-4 mt-6">
              {[
                { icon: 'bolt', color: 'primary-container', textColor: 'primary', title: 'Instant Payouts', desc: 'Secure, real-time node transactions straight to your wallet.' },
                { icon: 'security', color: 'secondary-container', textColor: 'secondary-fixed-dim', title: 'Encrypted Nodes', desc: 'Your privacy is guaranteed through our decentralized network.' },
                { icon: 'monitoring', color: 'tertiary-container', textColor: 'tertiary-fixed-dim', title: 'Passive Income', desc: 'Turn idle bandwidth into a continuous revenue stream.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`bg-${item.color}/20 p-2 rounded-full flex items-center justify-center`}>
                    <span className={`material-symbols-outlined text-${item.textColor} text-[20px]`} style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-headline-sm text-on-background font-semibold">{item.title}</h3>
                    <p className="text-body-sm text-on-surface-variant">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Auth Form */}
          <div className="glass-card rounded-[24px] p-6 md:p-8 w-full max-w-md mx-auto relative z-10">
            {/* Mobile Logo */}
            <div className="md:hidden flex items-center justify-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary text-[24px]">sensors</span>
              <h1 className="text-headline-sm text-primary tracking-tighter font-extrabold">DataSell</h1>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-surface-container-high rounded-full p-1 mb-8">
              <button
                onClick={() => { setTab('login'); reset(); }}
                className={`flex-1 py-2 text-center rounded-full text-label-md font-semibold transition-all ${tab === 'login' ? 'bg-surface-variant text-on-background' : 'text-on-surface-variant hover:text-on-background'}`}
              >Login</button>
              <button
                onClick={() => { setTab('register'); regReset(); }}
                className={`flex-1 py-2 text-center rounded-full text-label-md font-semibold transition-all ${tab === 'register' ? 'bg-surface-variant text-on-background' : 'text-on-surface-variant hover:text-on-background'}`}
              >Register</button>
            </div>

            {/* Login Form */}
            {tab === 'login' && (
              <form onSubmit={handleSubmit(onLogin)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-label-md text-on-surface-variant ml-1">Email or Phone</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">person</span>
                    <input
                      {...register('email', { required: 'Email is required' })}
                      className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-body-md"
                      placeholder="Enter identifier"
                      type="text"
                    />
                  </div>
                  {errors.email && <span className="text-error text-body-sm">{errors.email.message}</span>}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center ml-1 mr-1">
                    <label className="text-label-md text-on-surface-variant">Password</label>
                    <a href="#" className="text-label-md text-primary hover:text-primary-fixed-dim transition-colors">Forgot?</a>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
                    <input
                      {...register('password', { required: 'Password is required' })}
                      className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-body-md"
                      placeholder="••••••••"
                      type="password"
                    />
                  </div>
                  {errors.password && <span className="text-error text-body-sm">{errors.password.message}</span>}
                </div>
                <button type="submit" className="btn-primary w-full py-3 text-headline-sm mt-4 flex justify-center items-center gap-2">
                  Access Node <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
                <div className="flex items-center gap-4 my-2">
                  <div className="h-px bg-outline-variant/30 flex-1" />
                  <span className="text-label-md text-on-surface-variant uppercase">Or</span>
                  <div className="h-px bg-outline-variant/30 flex-1" />
                </div>
                <button type="button" className="w-full py-3 rounded-full bg-surface-container-high hover:bg-surface-variant border border-outline-variant/30 text-on-background text-headline-sm font-semibold flex justify-center items-center gap-2 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Authenticate with Google
                </button>
              </form>
            )}

            {/* Register Form */}
            {tab === 'register' && (
              <form onSubmit={handleRegSubmit(onRegister)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-label-md text-on-surface-variant ml-1">Full Name</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">badge</span>
                    <input {...regRegister('name', { required: 'Name is required' })} className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-body-md" placeholder="Your full name" />
                  </div>
                  {regErrors.name && <span className="text-error text-body-sm">{regErrors.name.message}</span>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-label-md text-on-surface-variant ml-1">Phone Number</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">phone</span>
                    <input {...regRegister('phone')} className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-body-md" placeholder="+91 XXXXX XXXXX" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-label-md text-on-surface-variant ml-1">Email</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">mail</span>
                    <input {...regRegister('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-body-md" placeholder="you@email.com" type="email" />
                  </div>
                  {regErrors.email && <span className="text-error text-body-sm">{regErrors.email.message}</span>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-label-md text-on-surface-variant ml-1">Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
                    <input {...regRegister('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-body-md" placeholder="Min 6 characters" type="password" />
                  </div>
                  {regErrors.password && <span className="text-error text-body-sm">{regErrors.password.message}</span>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-label-md text-on-surface-variant ml-1">Referral Code (Optional)</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">card_giftcard</span>
                    <input {...regRegister('referralCode')} className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-body-md" placeholder="DS-XXXX-XXXX" />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-3 text-headline-sm mt-4 flex justify-center items-center gap-2">
                  Create Node <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
