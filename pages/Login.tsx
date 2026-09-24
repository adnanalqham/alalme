import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User as UserIcon, Phone, MessageCircle, ShieldCheck, Mail } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Logo } from '../components/brand/Logo';
import { User, UserRole } from '../types';
import { resolveUserExperience } from '../services/roleResolution';

const DEMO = [
  { u: 'salem99', p: 'cust123', label: 'Customer' },
  { u: 'ahmed_parts', p: 'seller123', label: 'Shop owner' },
  { u: 'ad', p: '123', label: 'Super admin' },
];

const Login: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { user, isAuthenticated, loginFull, loginWithPhone, verifyOtp, loginWithProvider } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<'creds' | 'phone'>('creds');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [phoneHint, setPhoneHint] = useState('');
  const [showDemo, setShowDemo] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      redirectUser(user);
    }
  }, [isAuthenticated, user]);

  const submitCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const u = await loginFull(username, password);
      toast(language === 'ar' ? 'مرحباً بك!' : 'Welcome back!', { kind: 'success' });
      redirectUser(u);
    } catch (err: any) {
      toast(err?.message ?? 'Login failed', { kind: 'error' });
    }
  };

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await loginWithPhone(phone);
    setOtpSent(true);
    setPhoneHint(res.hint);
  };

  const confirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const u = await verifyOtp(phone, otp);
      toast('✓', { kind: 'success' });
      redirectUser(u);
    } catch (err: any) {
      toast(err?.message ?? 'Invalid code', { kind: 'error' });
    }
  };

  const social = async (provider: 'google' | 'apple') => {
    await loginWithProvider(provider);
  };

  const redirectUser = (u: User) => {
    const res = resolveUserExperience(u);
    navigate(res.defaultRoute);
  };

  const L = language === 'ar'
    ? { title: 'تسجيل الدخول', sub: 'مرحباً بعودتك! سجّل للوصول إلى الطلبات والمفضلة.', user: 'اسم المستخدم', pass: 'كلمة المرور', enter: 'دخول', or: 'أو', phones: 'الدخول بالهاتف', otpLabel: 'أدخل رمز التحقق', send: 'إرسال الرمز', verify: 'تأكيد', demoTitle: 'حسابات تجريبية', noAccount: 'ليس لديك حساب؟', signup: 'سجّل الآن', google: 'دخول بحساب Google', apple: 'دخول بحساب Apple', hint: '' }
    : { title: 'Sign in', sub: 'Welcome back! Sign in to track orders and wishlists.', user: 'Username', pass: 'Password', enter: 'Sign in', or: 'or', phones: 'Sign in with phone', otpLabel: 'Enter 6-digit code', send: 'Send code', verify: 'Verify', demoTitle: 'Demo accounts', noAccount: "Don't have an account?", signup: 'Create one', google: 'Continue with Google', apple: 'Continue with Apple', hint: '' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-primary to-navy flex items-center justify-center px-4 py-10" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-3xl p-4 shadow-xl"><Logo size={64} light={false} /></div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-7">
          <h1 className="text-xl font-extrabold text-primary text-center">{L.title}</h1>
          <p className="text-xs text-gray-400 text-center mt-1 mb-5">{L.sub}</p>

          {/* Mode switch */}
          <div className="flex bg-surface rounded-xl p-1 mb-5 text-xs font-bold">
            <button onClick={() => setMode('creds')} className={`flex-1 rounded-lg py-2 transition ${mode === 'creds' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}>
              <Lock size={12} className="inline me-1" />{language === 'ar' ? (mode === 'creds' ? '' : '') : ''}{language === 'ar' ? 'كلمة المرور' : 'Password'}
            </button>
            <button onClick={() => setMode('phone')} className={`flex-1 rounded-lg py-2 transition ${mode === 'phone' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}>
              <Phone size={12} className="inline me-1" />{language === 'ar' ? 'الهاتف (OTP)' : 'Phone (OTP)'}
            </button>
          </div>

          {mode === 'creds' ? (
            <form onSubmit={submitCreds} className="space-y-3">
              <Input icon={<UserIcon size={15} />} value={username} onChange={setUsername} type="text" placeholder={L.user} />
              <Input icon={<Lock size={15} />} value={password} onChange={setPassword} type="password" placeholder={L.pass} />
              <button type="submit" className="w-full rounded-xl bg-primary text-white py-3 text-sm font-bold hover:bg-navy transition">{L.enter}</button>
            </form>
          ) : !otpSent ? (
            <form onSubmit={requestOtp} className="space-y-3">
              <Input icon={<Phone size={15} />} value={phone} onChange={setPhone} type="tel" placeholder="+967 7XXXXXXXX" />
              <button type="submit" className="w-full rounded-xl bg-primary text-white py-3 text-sm font-bold hover:bg-navy transition">{L.send}</button>
            </form>
          ) : (
            <form onSubmit={confirmOtp} className="space-y-3">
              <p className="text-xs text-blue-600 text-center bg-blue-50 rounded-lg py-2">{phoneHint}</p>
              <Input icon={<ShieldCheck size={15} />} value={otp} onChange={setOtp} type="text" inputMode="numeric" maxLength={6} placeholder={L.otpLabel} />
              <button type="submit" className="w-full rounded-xl bg-primary text-white py-3 text-sm font-bold hover:bg-navy transition">{L.verify}</button>
              <button type="button" onClick={() => { setOtpSent(false); setPhone(''); }} className="w-full text-xs text-gray-400 hover:text-primary">{language === 'ar' ? 'تغيير الرقم' : 'Change number'}</button>
            </form>
          )}

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[10px] text-gray-400 font-semibold">{L.or}</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => social('google')} className="rounded-xl border border-gray-100 py-2.5 text-xs font-bold text-primary hover:bg-surface transition flex items-center justify-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-extrabold">G</span> {L.google}
            </button>
            <button onClick={() => social('apple')} className="rounded-xl border border-gray-100 py-2.5 text-xs font-bold text-primary hover:bg-surface transition flex items-center justify-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] flex items-center justify-center font-extrabold">A</span> {L.apple}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            {L.noAccount} <Link to="/register" className="text-primary font-bold hover:underline">{L.signup}</Link>
          </p>
        </div>

        {/* Demo accounts (Visible strictly in DEV environment only, Super Admin permanently hidden) */}
        {Boolean((import.meta as any).env?.DEV) && showDemo && (
          <div className="mt-4 bg-white/10 rounded-2xl p-4 backdrop-blur">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white/90">{L.demoTitle} (بيئة التطوير فقط)</span>
              <button onClick={() => setShowDemo(false)} className="text-white/60 text-[10px] hover:text-white">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO.filter(d => d.label !== 'Super admin').map(d => (
                <button key={d.u} onClick={() => { setMode('creds'); setUsername(d.u); setPassword(d.p); }}
                  className="bg-white/10 rounded-xl px-2 py-2 text-start hover:bg-white/20 transition">
                  <div className="text-[10px] text-white/80">{d.label}</div>
                  <div className="text-[10px] font-mono text-secondary" dir="ltr">{d.u} / {d.p}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface DemoTipProps {}

function Input({ icon, value, onChange, type, placeholder, maxLength, inputMode }: { icon?: React.ReactNode; value: string; onChange: (v: string) => void; type: string; placeholder: string; maxLength?: number; inputMode?: any }) {
  return (
    <div className="flex items-center gap-2 border border-gray-100 rounded-xl px-3 bg-surface focus-within:border-primary/40 transition">
      <span className="text-gray-400">{icon}</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        className="w-full py-3 text-sm outline-none bg-transparent text-primary placeholder:text-gray-300"
      />
    </div>
  );
}

export default Login;