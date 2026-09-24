import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, Truck, ShieldCheck, BadgeCheck, Headset, ChevronLeft, Star, Store,
  PackageSearch, MapPin,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { catalogService } from '../api';
import ProductCard from '../components/ProductCard';
import { SectionTitle } from '../components/ui/Primitives';

const Home: React.FC = () => {
  const { t, language } = useLanguage();
  const { products, shops, countries, reviews } = useData();
  const navigate = useNavigate();

  const [q, setQ] = useState('');
  const [countryId, setCountryId] = useState('');

  const banners = useMemo(() => catalogService.activeBanners(), []);
  const categories = useMemo(() => catalogService.categories(true), []);

  const featured = useMemo(() =>
    [...products].sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0)).slice(0, 8),
  [products]);

  const topShops = useMemo(() =>
    [...shops].filter(s => s.status === 'APPROVED' && s.isActive)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 4),
  [shops]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (countryId) params.set('country', countryId);
    navigate(`/search?${params.toString()}`);
  };

  const trust = [
    { icon: <ShieldCheck size={22} />, title: t('trustGuaranteed'), desc: t('trustGuaranteedDesc') },
    { icon: <Truck size={22} />, title: t('deliveryAvailable'), desc: t('deliveryAvailableDesc') },
    { icon: <BadgeCheck size={22} />, title: t('verifiedShops'), desc: t('verifiedShopsDesc') },
    { icon: <Headset size={22} />, title: t('support247'), desc: t('support247Desc') },
  ];

  return (
    <div className="bg-surface min-h-screen">
      {/* Hero */}
      <section className="relative bg-primary text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, #FCF1D0 0 2px, transparent 2.5px), radial-gradient(circle at 80% 60%, #FCF1D0 0 2px, transparent 2.5px)',
          backgroundSize: '70px 70px',
        }} />
        <div className="max-w-7xl mx-auto px-4 pt-12 pb-16 md:pt-16 md:pb-24 relative">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-cairo font-extrabold leading-tight mb-4">
              {language === 'ar'
                ? <>ابحث عن قطعة غيارك <span className="text-secondary">بسهولة</span></>
                : <>Find your spare part <span className="text-secondary">instantly</span></>}
            </h1>
            <p className="text-white/70 text-sm md:text-base mb-8 max-w-xl">
              {language === 'ar'
                ? 'ملايين القطع من محلات موثوقة في اليمن والسعودية والإمارات — قارن الأسعار، تحقق من التوافق مع سيارتك، واطلب بضغطة زر.'
                : 'Thousands of parts from trusted shops across Yemen, Saudi Arabia and the UAE — compare, verify compatibility, and order in one click.'}
            </p>

            {/* Search box */}
            <form onSubmit={submitSearch} className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl">
              <div className="flex-1 flex items-center gap-2 px-3 text-primary">
                <Search size={20} className="text-gray-400 shrink-0" />
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder={t('searchParts')}
                  className="w-full py-3 outline-none text-sm bg-transparent"
                />
              </div>
              <select
                value={countryId}
                onChange={e => setCountryId(e.target.value)}
                className="sm:w-44 border border-gray-100 rounded-xl px-3 py-3 text-sm text-primary outline-none bg-surface cursor-pointer"
              >
                <option value="">{language === 'ar' ? 'كل الدول' : 'All countries'}</option>
                {countries.map(c => <option key={c.id} value={c.id}>{language === 'ar' ? c.nameAr : c.nameEn}</option>)}
              </select>
              <button type="submit" className="rounded-xl bg-primary text-white px-8 py-3 text-sm font-bold hover:bg-navy active:scale-95 transition">
                {t('search')}
              </button>
            </form>

            {/* Popular quick links */}
            <div className="flex flex-wrap gap-2 mt-4 text-xs">
              {categories.slice(0, 6).map(c => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/search?category=${c.id}`)}
                  className="bg-white/10 hover:bg-white/20 border border-white/15 rounded-full px-3 py-1.5 transition"
                >
                  {language === 'ar' ? c.nameAr : c.nameEn}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {trust.map((tItem, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-md px-4 py-4 flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-secondary/40 text-primary flex items-center justify-center shrink-0">{tItem.icon}</span>
              <div>
                <div className="text-sm font-bold text-primary">{tItem.title}</div>
                <div className="text-xs text-gray-500">{tItem.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Banners */}
      {banners.filter(b => b.position === 'HOME_TOP').length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-8">
          {banners.filter(b => b.position === 'HOME_TOP').map(b => (
            <div key={b.id} className="relative rounded-3xl overflow-hidden shadow-lg">
              <img src={b.imageUrl} className="w-full h-56 object-cover" alt="" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/40 to-transparent flex items-center">
                <div className="p-8 max-w-md text-white">
                  <h3 className="text-2xl font-extrabold mb-2">{language === 'ar' ? b.titleAr : b.titleEn}</h3>
                  <p className="text-sm text-white/80 mb-4">{language === 'ar' ? b.subtitleAr : b.subtitleEn}</p>
                  <button onClick={() => navigate(b.link || '/search')} className="rounded-xl bg-secondary text-primary px-5 py-2.5 text-sm font-bold hover:brightness-95">
                    {language === 'ar' ? 'تصفح الآن' : 'Browse now'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <SectionTitle title={t('categories')} action={<Link to="/search" className="text-sm text-navy font-semibold hover:underline">{t('viewAll')}</Link>} />
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => navigate(`/search?category=${c.id}`)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition p-4 flex flex-col items-center gap-2 text-center"
            >
              <span className="w-14 h-14 rounded-2xl bg-surface text-primary flex items-center justify-center">
                {c.imageUrl ? <img src={c.imageUrl} className="w-10 h-10 object-contain" alt="" /> : <PackageSearch size={26} />}
              </span>
              <span className="text-xs font-semibold text-primary leading-tight">{language === 'ar' ? c.nameAr : c.nameEn}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 mt-12">
        <SectionTitle title={t('featuredParts')} action={<Link to="/search" className="text-sm text-navy font-semibold hover:underline">{t('viewAll')}</Link>} />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map(p => {
            const shop = shops.find(s => s.id === p.shopId);
            return <ProductCard key={p.id} product={p} shopName={language === 'ar' ? shop?.nameAr : shop?.nameEn} city={shop?.city} />;
          })}
        </div>
      </section>

      {/* Top shops */}
      <section className="max-w-7xl mx-auto px-4 mt-12">
        <SectionTitle title={t('topShops')} action={<Link to="/shops" className="text-sm text-navy font-semibold hover:underline">{t('viewAll')}</Link>} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topShops.map(s => (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition p-5 cursor-pointer" onClick={() => navigate(`/shops/${s.id}`)}>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-12 h-12 rounded-xl bg-surface text-primary flex items-center justify-center overflow-hidden">
                  {s.logoUrl ? <img src={s.logoUrl} className="w-full h-full object-cover" alt="" /> : <Store size={22} />}
                </span>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-primary truncate">{language === 'ar' ? s.nameAr : s.nameEn}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={11} /> {s.city}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-sm text-amber-500"><Star size={14} fill="currentColor" />({s.rating ?? 0})</span>
                <span className="text-xs text-gray-400">{s.ratingCount ?? 0} {t('reviews')}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* External request CTA */}
      <section className="max-w-7xl mx-auto px-4 mt-12 mb-16">
        <div className="bg-gradient-to-r from-navy to-primary rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="relative">
            <h3 className="text-2xl font-extrabold mb-2">{t('requestPartCta')}</h3>
            <p className="text-white/70 text-sm max-w-md">{t('requestPartCtaDesc')}</p>
          </div>
          <button onClick={() => navigate('/external-request')} className="rounded-2xl bg-secondary text-primary px-8 py-4 text-base font-bold hover:brightness-95 active:scale-95 transition shrink-0">
            {t('requestPart')} <ChevronLeft size={18} className="inline -scale-x-100 rtl:scale-x-100" />
          </button>
        </div>
      </section>

      {/* Brand strip */}
      <section className="max-w-7xl mx-auto px-4 pb-14">
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {useBrandLogos().map(b => (
            <span key={b.id} className="text-gray-300 text-sm font-semibold flex items-center gap-2">
              <img src={b.logoUrl} className="h-8 w-auto opacity-60" alt="" onError={e => { (e.target as HTMLElement).style.visibility = 'hidden'; }} /> {b.nameEn}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
};

function useBrandLogos() {
  const { makes } = useData();
  return makes.slice(0, 8);
}

export default Home;