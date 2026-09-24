import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, MessageCircle, Phone, Star, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import ProductCard from '../components/ProductCard';
import { Badge, Rating, EmptyState } from '../components/ui/Primitives';

const ShopDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { shops, products, reviews } = useData();
  const [tab, setTab] = useState<'products' | 'reviews'>('products');

  const shop = useMemo(() => shops.find(s => s.id === id), [shops, id]);
  const shopProducts = useMemo(() => products.filter(p => p.shopId === id), [products, id]);
  const shopReviews = useMemo(() => reviews.filter(r => r.shopId === id && r.status === 'APPROVED'), [reviews, id]);

  if (!shop) return <EmptyState title={t('shopNotFound')} icon={<MapPin size={30} />} />;

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Banner header */}
        <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="h-32 bg-gradient-to-r from-navy to-primary relative">
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#FCF1D022,transparent_50%)]" />
          </div>
          <div className="bg-white p-5">
            <div className="flex flex-wrap items-center gap-5">
              <span className="-mt-16 w-20 h-20 rounded-2xl border-4 border-white bg-surface text-primary flex items-center justify-center overflow-hidden shadow-sm z-10">
                {shop.logoUrl ? <img src={shop.logoUrl} className="w-full h-full object-cover" alt="" /> : <Star size={28} />}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-primary">{language === 'ar' ? shop.nameAr : shop.nameEn}</h1>
                  <Badge tone="success"><CheckCircle2 size={12} /> {t('verified')}</Badge>
                </div>
                <div className="text-sm text-gray-400 flex flex-wrap items-center gap-3 mt-1">
                  <span className="flex items-center gap-1"><MapPin size={13} /> {shop.address}, {shop.city}</span>
                  <Rating value={shop.rating ?? 0} size={14} />
                  <span>({shop.reviewCount ?? 0} {t('reviews')})</span>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={`https://wa.me/${shop.whatsappNumber?.replace(/[^0-9]/g, '') || shop.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer"
                  className="rounded-xl bg-green-600 text-white px-4 py-2.5 text-sm font-bold hover:bg-green-700 transition flex items-center gap-2">
                  <MessageCircle size={16} /> WhatsApp
                </a>
                {shop.phone && <button onClick={() => {}} className="rounded-xl border border-gray-200 text-primary px-4 py-2.5 text-sm font-bold hover:bg-surface transition flex items-center gap-2"><Phone size={16} /> {shop.phone}</button>}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">{shop.descriptionEn}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-5 border-b border-gray-100 mb-5">
          {(['products', 'reviews'] as const).map(k => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-5 py-2.5 text-sm font-bold rounded-t-xl -mb-px transition ${tab === k ? 'bg-white text-primary border border-gray-100 border-b-white' : 'text-gray-400 hover:text-primary'}`}>
              {k === 'products' ? t('products') : t('reviews')}
              <span className="ms-1.5 text-xs text-gray-400">({k === 'products' ? shopProducts.length : shopReviews.length})</span>
            </button>
          ))}
        </div>

        {tab === 'products' ? (
          shopProducts.length === 0 ? (
            <EmptyState title={t('noProducts')} icon={<Star size={30} />} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {shopProducts.map(p => (
                <ProductCard key={p.id} product={p} shopName={language === 'ar' ? shop.nameAr : shop.nameEn} city={shop.city} />
              ))}
            </div>
          )
        ) : (
          <div className="space-y-3 max-w-3xl">
            {shopReviews.length === 0 && <EmptyState title={t('noReviews')} icon={<Star size={30} />} />}
            {shopReviews.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-primary">{r.userName}</span>
                  <Rating value={r.rating} size={13} />
                </div>
                <p className="text-sm text-gray-600">{r.comment}</p>
              </div>
            ))}
            {shopReviews.length > 0 && (
              <Link to="/shops" className="inline-block text-sm text-navy font-semibold hover:underline mt-2">{t('backToShops')} →</Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopDetail;