import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart, Store, Tag, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { PriceVisibility } from '../types';
import { EmptyState } from '../components/ui/Primitives';

const CartPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { items, updateQuantity, remove, subtotal, clear } = useCart();
  const { products, shops, settings } = useData();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const groups = useMemo(() => {
    const map = new Map<string, typeof items>();
    items.forEach(it => {
      const p = products.find(x => x.id === it.productId);
      const s = p?.shopId ?? '__unknown';
      if (!map.has(s)) map.set(s, []);
      map.get(s)!.push(it);
    });
    return [...map.entries()];
  }, [items, products]);

  const visibleItems = items.filter(it => {
    const p = products.find(x => x.id === it.productId);
    return p && p.priceVisibility === PriceVisibility.SHOW_PRICE;
  });
  const subtotalVisible = visibleItems.reduce((n, i) => n + i.unitPrice * i.quantity, 0);

  const checkout = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="bg-surface min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <EmptyState
            title={t('cartEmpty')}
            subtitle={t('cartEmptyDesc')}
            icon={<ShoppingCart size={34} />}
            action={<Link to="/search" className="rounded-xl bg-primary text-white px-6 py-3 text-sm font-bold hover:bg-navy">{t('browseParts')}</Link>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-extrabold text-primary">{t('cart')} ({items.length})</h1>
          <button onClick={clear} className="text-sm text-red-500 font-semibold hover:underline">{t('clearCart')}</button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {groups.map(([shopId, groupItems]) => {
              const shop = shops.find(s => s.id === shopId);
              return (
                <div key={shopId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50 bg-cream/30">
                    <Store size={14} className="text-navy" />
                    <span className="text-sm font-bold text-primary">{shop ? (language === 'ar' ? shop.nameAr : shop.nameEn) : '—'}</span>
                    <span className="text-xs text-gray-400">{shop?.city}</span>
                  </div>
                  {groupItems.map(it => {
                    const p = products.find(x => x.id === it.productId);
                    if (!p) return null;
                    const hidePrice = p.priceVisibility === PriceVisibility.HIDE_PRICE;
                    const externalOnly = p.saleMode === 'EXTERNAL';
                    return (
                      <div key={it.id} className="flex gap-3 p-4 border-b border-gray-50 last:border-0">
                        <Link to={`/part/${p.id}`}>
                          <img src={p.imageUrl} className="w-20 h-20 rounded-xl object-cover" alt="" onError={e => { (e.target as HTMLImageElement).src = '/logo.png'; }} />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/part/${p.id}`} className="text-sm font-bold text-primary line-clamp-1 hover:underline">{language === 'ar' ? p.nameAr : p.nameEn}</Link>
                          <div className="text-xs text-gray-400 mt-0.5">{p.partNumber}</div>
                          {hidePrice || externalOnly ? (
                            <div className="mt-1">
                              <span className="text-xs text-red-500 font-semibold">{t('contactPrice')}</span>
                              {shop?.phone && (
                                <a href={`https://wa.me/${shop.whatsappNumber?.replace(/[^0-9]/g, '') || shop.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer"
                                  className="ms-2 inline-flex items-center gap-1 text-xs text-green-600 font-bold hover:underline">
                                  <MessageCircle size={12} /> WhatsApp
                                </a>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm font-extrabold text-primary mt-1">{it.unitPrice.toLocaleString()} {it.currency}</div>
                          )}
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <button onClick={() => remove(it.id)} className="text-gray-300 hover:text-red-500 transition"><Trash2 size={16} /></button>
                          {!hidePrice && !externalOnly && (
                            <div className="flex items-center border border-gray-100 rounded-lg overflow-hidden">
                              <button onClick={() => updateQuantity(it.id, Math.max(1, it.quantity - 1))} className="px-2 py-1 text-primary bg-surface hover:bg-cream"><Minus size={12} /></button>
                              <span className="w-8 text-center text-xs font-bold">{it.quantity}</span>
                              <button onClick={() => updateQuantity(it.id, it.quantity + 1)} className="px-2 py-1 text-primary bg-surface hover:bg-cream"><Plus size={12} /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-20">
              <h3 className="font-bold text-primary mb-4">{t('orderSummary')}</h3>
              <div className="text-sm text-gray-500 mb-2 flex items-center justify-between">
                <span>{t('products')} ({visibleItems.reduce((n, i) => n + i.quantity, 0)})</span>
                <span className="font-bold text-primary">{subtotalVisible.toLocaleString()} {settings.currency}</span>
              </div>
              <hr className="my-3 border-gray-50" />
              <div className="text-lg font-extrabold text-primary flex items-center justify-between">
                <span>{t('total')}</span>
                <span>{subtotalVisible.toLocaleString()} {settings.currency}</span>
              </div>
              <button onClick={checkout} className="mt-5 w-full rounded-xl bg-primary text-white py-3.5 text-sm font-bold hover:bg-navy transition flex items-center justify-center gap-2">
                {t('checkout')} <ArrowRight size={16} className="rtl:rotate-180" />
              </button>
              <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5"><Tag size={12} /> {t('cartNote')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;