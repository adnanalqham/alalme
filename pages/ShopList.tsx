import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Store, ShieldCheck, Star } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { Badge, Rating, EmptyState } from '../components/ui/Primitives';

const ShopList: React.FC = () => {
  const { t, language } = useLanguage();
  const { shops, countries, cities } = useData();
  const [q, setQ] = useState('');
  const [countryId, setCountryId] = useState('');
  const [sort, setSort] = useState('rating');

  const list = useMemo(() => {
    let l = shops.filter(s => s.status === 'APPROVED');
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      l = l.filter(sh => (sh.nameEn + (sh.nameAr || '')).toLowerCase().includes(s) || (sh.city || '').toLowerCase().includes(s));
    }
    if (countryId) l = l.filter(sh => sh.countryId === countryId);
    l = [...l].sort((a, b) => {
      if (sort === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
      if (sort === 'name') return language === 'ar' ? (a.nameAr || a.nameEn).localeCompare(b.nameAr || b.nameEn, 'ar') : a.nameEn.localeCompare(b.nameEn);
      return (b.ratingCount ?? b.reviewCount ?? 0) - (a.ratingCount ?? a.reviewCount ?? 0);
    });
    return l;
  }, [shops, q, countryId, sort, language]);

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-extrabold text-primary mb-5">{t('shops')}</h1>

        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <div className="flex-1 flex items-center gap-2 border border-gray-100 rounded-xl px-3 bg-white">
            <Search size={18} className="text-gray-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder={t('searchShops')} className="w-full py-3 outline-none text-sm bg-transparent text-primary" />
          </div>
          <select value={countryId} onChange={e => setCountryId(e.target.value)} className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-primary outline-none">
            <option value="">{language === 'ar' ? 'كل الدول' : 'All countries'}</option>
            {countries.map(c => <option key={c.id} value={c.id}>{language === 'ar' ? c.nameAr : c.nameEn}</option>)}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)} className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-primary outline-none">
            <option value="rating">{t('topRated')}</option>
            <option value="reviews">{t('mostReviewed')}</option>
            <option value="name">{t('name')}</option>
          </select>
        </div>

        {list.length === 0 ? (
          <EmptyState title={t('noResults')} subtitle={t('noResultsDesc')} icon={<Store size={30} />} />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map(s => (
              <Link key={s.id} to={`/shops/${s.id}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition">
                <div className="flex items-start gap-4">
                  <span className="w-16 h-16 rounded-2xl bg-surface text-primary flex items-center justify-center overflow-hidden shrink-0">
                    {s.logoUrl ? <img src={s.logoUrl} className="w-full h-full object-cover" alt="" /> : <Store size={26} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-primary leading-snug">{language === 'ar' ? s.nameAr : s.nameEn}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-1"><MapPin size={11} /> {s.city}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Rating value={s.rating ?? 0} size={13} />
                      <span className="text-xs text-gray-400">({s.reviewCount ?? 0})</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <span className="rounded-lg bg-surface text-primary text-xs font-bold px-2.5 py-1"><Star size={11} className="inline" /> {(s.rating ?? 0).toFixed(1)}</span>
                  <Badge tone="success"><ShieldCheck size={11} /> {t('verified')}</Badge>
                  <span className="ms-auto text-xs text-gray-400">{s.productCount ?? 0} {t('products')}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopList;