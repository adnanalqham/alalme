import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon, Store, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { vehicleService } from '../api';
import { Logo } from '../components/brand/Logo';

const Register: React.FC = () => {
  const { language } = useLanguage();
  const { countries, cities, categories } = useData();
  const { register, registerShopOwner } = useAuth();
  const { toast } = useToast();

  const [type, setType] = useState<'customer' | 'shop'>('customer');

  const [form, setForm] = useState({
    fullName: '', username: '', email: '', phone: '', password: '',
    countryId: '', cityId: '', address: '', ownedCarBrand: '',
  });
  const [preferred, setPreferred] = useState<string[]>([]);
  const [shop, setShop] = useState({ nameEn: '', nameAr: '', descriptionEn: '', whatsappNumber: '', opensAt: '09:00', closesAt: '18:00' });

  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));
  const citiesList = useMemo(() => (form.countryId ? cities.filter(c => c.countryId === form.countryId) : cities), [form.countryId, cities]);
  const brands = useMemo(() => vehicleService.makes(), []);

  const toggleCat = (id: string) => setPreferred(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (type === 'customer') {
        (register as any)({
          fullName: form.fullName, username: form.username, password: form.password,
          email: form.email, phone: form.phone, countryId: form.countryId, cityId: form.cityId || undefined,
          city: citiesList.find(c => c.id === form.cityId)?.nameEn, address: form.address,
          preferredCategories: preferred, ownedCarBrands: form.ownedCarBrand ? [form.ownedCarBrand] : [],
        } as any);
        toast(language === 'ar' ? 'تم إنشاء الحساب!' : 'Account created!', { kind: 'success' });
      } else {
        registerShopOwner({
          fullName: form.fullName, username: form.username, password: form.password,
          email: form.email, phone: shop.whatsappNumber || form.phone, countryId: form.countryId, cityId: form.cityId,
          shop: {
            nameEn: shop.nameEn, nameAr: shop.nameAr, descriptionEn: shop.descriptionEn,
            phone: form.phone, whatsappNumber: shop.whatsappNumber, countryId: form.countryId, cityId: form.cityId,
            city: citiesList.find(c => c.id === form.cityId)?.nameEn,
          },
        });
        toast(language === 'ar' ? 'تم تسجيل المحل! بانتظار موافقة الإدارة.' : 'Shop registered! Awaiting admin approval.', { kind: 'success' });
      }
      window.location.hash = type === 'customer' ? '#/' : '#/shop';
    } catch (err: any) {
      toast(err?.message ?? 'Registration failed', { kind: 'error' });
    }
  };

  const L = language === 'ar'
    ? { title: 'إنشاء حساب', sub: 'انضم كعميل أو مسجّل محل.', fullName: 'الاسم الكامل', user: 'اسم المستخدم', email: 'البريد الإلكتروني', phone: 'رقم الهاتف', pass: 'كلمة المرور', country: 'الدولة', city: 'المدينة', address: 'العنوان', signup: 'إنشاء الحساب', have: 'لديك حساب؟', login: 'تسجيل الدخول', customer: 'عميل', shopOwner: 'مالك محل', shopNameEn: 'اسم المحل (إنجليزي)', shopNameAr: 'اسم المحل (عربي)', desc: 'وصف المحل (اختياري)', whatsapp: 'رقم واتساب', preferred: 'فئات مفضلة', carBrand: 'ماركة سيارتك' }
    : { title: 'Create account', sub: 'Join as a customer or shop owner.', fullName: 'Full name', user: 'Username', email: 'Email', phone: 'Phone', pass: 'Password', country: 'Country', city: 'City', address: 'Address', signup: 'Create account', have: 'Have an account?', login: 'Sign in', customer: 'Customer', shopOwner: 'Shop owner', shopNameEn: 'Shop name (EN)', shopNameAr: 'Shop name (AR)', desc: 'Shop description (optional)', whatsapp: 'WhatsApp number', preferred: 'Preferred categories', carBrand: 'Your car brand' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-primary to-navy flex items-center justify-center px-4 py-10" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-3xl p-4 shadow-xl"><Logo size={64} light={false} /></div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-7">
          <h1 className="text-xl font-extrabold text-primary text-center">{L.title}</h1>
          <p className="text-xs text-gray-400 text-center mt-1 mb-5">{L.sub}</p>

          <div className="flex bg-surface rounded-xl p-1 mb-5 text-xs font-bold">
            <button onClick={() => setType('customer')} className={`flex-1 rounded-lg py-2 transition flex items-center justify-center gap-1.5 ${type === 'customer' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}>
              <UserIcon size={12} /> {L.customer}
            </button>
            <button onClick={() => setType('shop')} className={`flex-1 rounded-lg py-2 transition flex items-center justify-center gap-1.5 ${type === 'shop' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}>
              <Store size={12} /> {L.shopOwner}
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input value={form.fullName} onChange={e => set('fullName')(e.target.value)} placeholder={L.fullName} required className="col-span-2 rounded-xl border border-gray-100 bg-surface px-3 py-3 text-sm outline-none placeholder:text-gray-300" />
              <input value={form.username} onChange={e => set('username')(e.target.value)} placeholder={L.user} required className="rounded-xl border border-gray-100 bg-surface px-3 py-3 text-sm outline-none placeholder:text-gray-300" />
              <input value={form.password} onChange={e => set('password')(e.target.value)} type="password" placeholder={L.pass} required minLength={3} className="rounded-xl border border-gray-100 bg-surface px-3 py-3 text-sm outline-none placeholder:text-gray-300" />
              <input value={form.email} onChange={e => set('email')(e.target.value)} type="email" placeholder={L.email} className="rounded-xl border border-gray-100 bg-surface px-3 py-3 text-sm outline-none placeholder:text-gray-300" />
              <input value={form.phone} onChange={e => set('phone')(e.target.value)} type="tel" placeholder={L.phone} required className="rounded-xl border border-gray-100 bg-surface px-3 py-3 text-sm outline-none placeholder:text-gray-300" />
            </div>

            {type === 'shop' && (
              <div className="grid grid-cols-2 gap-3 bg-secondary/20 rounded-xl p-3">
                <input value={shop.nameEn} onChange={e => setShop(s => ({ ...s, nameEn: e.target.value }))} placeholder={L.shopNameEn} required className="rounded-xl bg-white px-3 py-2.5 text-sm outline-none placeholder:text-gray-300" />
                <input value={shop.nameAr} onChange={e => setShop(s => ({ ...s, nameAr: e.target.value }))} placeholder={L.shopNameAr} required className="rounded-xl bg-white px-3 py-2.5 text-sm outline-none placeholder:text-gray-300" />
                <input value={shop.descriptionEn} onChange={e => setShop(s => ({ ...s, descriptionEn: e.target.value }))} placeholder={L.desc} className="col-span-2 rounded-xl bg-white px-3 py-2.5 text-sm outline-none placeholder:text-gray-300" />
                <input value={shop.whatsappNumber} onChange={e => setShop(s => ({ ...s, whatsappNumber: e.target.value }))} placeholder={L.whatsapp + ' (' + L.phone + ')'} className="col-span-2 rounded-xl bg-white px-3 py-2.5 text-sm outline-none placeholder:text-gray-300" />
              </div>
            )}

            <select value={form.countryId} onChange={e => set('countryId')(e.target.value)} required className="w-full rounded-xl border border-gray-100 bg-surface px-3 py-3 text-sm outline-none text-primary">
              <option value="">{L.country}…</option>
              {countries.map(c => <option key={c.id} value={c.id}>{language === 'ar' ? c.nameAr : c.nameEn}</option>)}
            </select>
            <select value={form.cityId} onChange={e => set('cityId')(e.target.value)} disabled={!form.countryId} className="w-full rounded-xl border border-gray-100 bg-surface px-3 py-3 text-sm outline-none text-primary disabled:opacity-50">
              <option value="">{L.city}…</option>
              {citiesList.map(c => <option key={c.id} value={c.id}>{language === 'ar' ? c.nameAr : c.nameEn}</option>)}
            </select>
            {type === 'shop' ? (
              <input value={form.address} onChange={e => set('address')(e.target.value)} placeholder={L.address} className="w-full rounded-xl border border-gray-100 bg-surface px-3 py-3 text-sm outline-none placeholder:text-gray-300" />
            ) : (
              <>
                <select value={form.ownedCarBrand} onChange={e => set('ownedCarBrand')(e.target.value)} className="w-full rounded-xl border border-gray-100 bg-surface px-3 py-3 text-sm outline-none text-primary">
                  <option value="">{L.carBrand}…</option>
                  {brands.map(b => <option key={b.id} value={b.nameEn}>{language === 'ar' ? b.nameAr : b.nameEn}</option>)}
                </select>
                <div>
                  <div className="text-xs text-gray-400 font-semibold mb-1.5">{L.preferred}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.filter(c => c.isActive).slice(0, 12).map(c => (
                      <button key={c.id} type="button" onClick={() => toggleCat(c.id)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${preferred.includes(c.id) ? 'bg-primary text-white' : 'bg-surface text-gray-500 hover:text-primary'}`}>
                        {language === 'ar' ? c.nameAr : c.nameEn}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="w-full rounded-xl bg-primary text-white py-3 text-sm font-bold hover:bg-navy transition flex items-center justify-center gap-2">
              {L.signup} <ArrowRight size={15} className="rtl:rotate-180" />
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            {L.have} <Link to="/login" className="text-primary font-bold hover:underline">{L.login}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;