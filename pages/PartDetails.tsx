import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingCart, Zap, ShieldCheck, Truck, Star, Check, Heart, MapPin, MessageCircle,
  Phone, ChevronLeft, Package, Barcode, Store, Tag,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { productService, reviewService, shopService, authService } from '../api';
import { PriceVisibility, SaleMode, UserRole } from '../types';
import { Badge, Rating, Price, EmptyState, BarcodeSvg } from '../components/ui/Primitives';

const PartDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { products, shops, reviews, settings } = useData();
  const { toast } = useToast();
  const { add } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const product = useMemo(() => products.find(p => p.id === id), [products, id]);
  const [qty, setQty] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  if (!product) return <EmptyState title={language === 'ar' ? 'القطعة غير موجودة' : 'Part not found'} />;

  const shop = shops.find(s => s.id === product.shopId);
  const hidePrice = product.priceVisibility === PriceVisibility.HIDE_PRICE;
  const externalOnly = product.saleMode === SaleMode.EXTERNAL;
  const offers = productService.samePartOffers(product.partNumber || '', product.id);
  const productReviews = reviews.filter(r => (r.productId === product.id || r.shopId === product.shopId) && r.status === 'APPROVED');
  const fullyApproved = shop?.status === 'APPROVED';

  const addToCart = () => {
    try {
      add(product.id, qty, product.branchId);
      toast(t('addedToCart'), { kind: 'success' });
    } catch (err: any) {
      toast(err?.message, { kind: 'error' });
    }
  };

  const buyNow = () => {
    if (!isAuthenticated) {
      toast(language === 'ar' ? 'سجّل الدخول أولاً' : 'Please sign in first', { kind: 'warning' });
      navigate('/login');
      return;
    }
    add(product.id, qty, product.branchId);
    navigate('/checkout');
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    try {
      reviewService.create({ shopId: product.shopId, productId: product.id, ...reviewForm });
      toast(t('reviewSubmitted'), { kind: 'success' });
      setReviewForm({ rating: 5, comment: '' });
    } catch (err: any) {
      toast(err?.message, { kind: 'error' });
    }
  };

  const whatContacts = externalOnly || hidePrice;

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1">
          <Link to="/" className="hover:text-primary">{t('home')}</Link> / 
          <Link to="/search" className="hover:text-primary">{t('search')}</Link> / 
          <span className="text-primary font-medium">{language === 'ar' ? product.nameAr : product.nameEn}</span>
        </nav>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Gallery */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="aspect-square bg-surface">
                <img src={product.imageUrl} className="w-full h-full object-cover" alt="" onError={e => { (e.target as HTMLImageElement).src = '/logo.png'; }} />
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-1 p-2">
                  {product.images.slice(1).map((im, i) => (
                    <img key={i} src={im} className="w-full h-16 object-cover rounded-lg" alt="" />
                  ))}
                </div>
              )}
            </div>
            {product.barcode && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mt-4 flex items-center gap-4">
                <BarcodeSvg value={product.barcode} className="w-40 h-auto" />
                <div className="text-xs text-gray-400" dir="ltr">{product.partNumber || product.barcode}</div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge tone={product.condition === 'NEW' || product.condition === 'OEM' ? 'success' : 'neutral'}>{product.condition}</Badge>
                <Badge tone="cream">{externalOnly ? t('contactPrice') : t('onlineOrder')}</Badge>
                <span className="text-xs text-gray-400">{product.partNumber || ''}</span>
              </div>
              <h1 className="text-2xl font-extrabold text-primary mb-2">{language === 'ar' ? product.nameAr : product.nameEn}</h1>
              <p className="text-sm text-gray-500 mb-4">{product.carBrand} {product.carModel} <span className="text-gray-400">({product.yearRange || 'General'})</span></p>

              <div className="flex items-center gap-4 mb-4 text-sm">
                <Rating value={product.rating ?? 0} size={16} />
                <span className="text-gray-400">({product.ratingCount ?? 0} {t('reviews')})</span>
              </div>

              <div className="bg-surface rounded-xl p-5 mb-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  {hidePrice ? (
                    <span className="text-2xl font-extrabold text-primary">{t('contactShop')}</span>
                  ) : (
                    <Price value={product.price} currency={product.currency} hide={false} />
                  )}
                  {!externalOnly && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden">
                        <button onClick={() => setQty(v => Math.max(1, v - 1))} className="px-3 py-2 text-primary hover:bg-surface font-bold">−</button>
                        <span className="w-10 text-center text-sm font-bold">{qty}</span>
                        <button onClick={() => setQty(v => Math.min(product.quantity, v + 1))} className="px-3 py-2 text-primary hover:bg-surface font-bold">+</button>
                      </div>
                      <span className={`text-xs ${product.quantity > 0 ? 'text-green-600' : 'text-red-500'} font-semibold`}>
                        {product.quantity > 0 ? `${product.quantity} ${t('inStock')}` : t('outOfStock')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {!externalOnly && product.quantity > 0 && (
                    <>
                      <button onClick={addToCart} className="rounded-xl bg-primary text-white px-6 py-3 text-sm font-bold hover:bg-navy active:scale-95 transition flex items-center gap-2">
                        <ShoppingCart size={16} /> {t('addToCart')}
                      </button>
                      <button onClick={buyNow} className="rounded-xl bg-secondary text-primary px-6 py-3 text-sm font-bold hover:brightness-95 active:scale-95 transition flex items-center gap-2">
                        <Zap size={16} /> {t('buyNow')}
                      </button>
                    </>
                  )}
                  {whatContacts && shop && (
                    <>
                      <a href={`https://wa.me/${shop.whatsappNumber?.replace(/[^0-9]/g, '') || shop.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer"
                        className="rounded-xl bg-green-600 text-white px-6 py-3 text-sm font-bold hover:bg-green-700 transition flex items-center gap-2">
                        <MessageCircle size={16} /> WhatsApp
                      </a>
                      <button onClick={() => toast(t('callShop'))} className="rounded-xl border border-gray-200 text-primary px-6 py-3 text-sm font-semibold hover:bg-surface transition flex items-center gap-2">
                        <Phone size={16} /> {shop.phone}
                      </button>
                    </>
                  )}
                  <button onClick={() => toast(t('wishlistAdded'))} className="rounded-xl border border-gray-200 text-primary p-3 hover:bg-surface transition">
                    <Heart size={18} />
                  </button>
                </div>
              </div>

              {/* Seller strip */}
              {shop && (
                <Link to={`/shops/${shop.id}`} className="flex items-center gap-3 border border-gray-100 rounded-xl p-4 hover:bg-surface/60 transition">
                  <span className="w-12 h-12 rounded-xl bg-surface text-primary flex items-center justify-center overflow-hidden">
                    {shop.logoUrl ? <img src={shop.logoUrl} className="w-full h-full object-cover" alt="" /> : <Store size={20} />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-primary">{language === 'ar' ? shop.nameAr : shop.nameEn}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-2"><MapPin size={11} /> {shop.city} <Rating value={shop.rating ?? 0} size={11} showValue={false} /></div>
                  </div>
                  <Badge tone={fullyApproved ? 'success' : 'warning'}><ShieldCheck size={12} /> {fullyApproved ? t('verified') : t('pending')}</Badge>
                  <ChevronLeft size={16} className="text-gray-300 -scale-x-100 rtl:scale-x-100" />
                </Link>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5 text-xs text-gray-500">
                <div className="flex items-center gap-2"><Truck size={14} className="text-navy" /> {t('deliveryMethods')}</div>
                <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-green-600" /> {t('genuineGuarantee')}</div>
                <div className="flex items-center gap-2"><Package size={14} className="text-navy" /> {t('returns')}</div>
              </div>

              {/* Description */}
              {(product.descriptionEn || product.descriptionAr) && (
                <div className="mt-5 pt-5 border-t border-gray-50">
                  <h3 className="font-bold text-primary text-sm mb-2">{t('description')}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{language === 'ar' ? product.descriptionAr : product.descriptionEn}</p>
                </div>
              )}
            </div>

            {/* Fitments */}
            {product.fitments.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-4">
                <h3 className="font-bold text-primary mb-3 flex items-center gap-2"><Check size={16} className="text-green-600" /> {t('compatibleVehicles')}</h3>
                <div className="flex flex-wrap gap-2">
                  {product.fitments.map(f => (
                    <span key={f.id} className="rounded-lg border border-gray-100 bg-surface px-3 py-1.5 text-xs text-primary font-medium">
                      {language === 'ar' ? f.makeNameAr : f.makeNameEn} {language === 'ar' ? f.modelNameAr : f.modelNameEn}
                      {f.yearLabel ? ` (${f.yearLabel})` : ''} {f.engineBadge ? ` · ${f.engineBadge}` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Same part offers from other shops */}
            {offers.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-4">
                <h3 className="font-bold text-primary mb-3 flex items-center gap-2"><Tag size={16} /> {t('samePartOffers')} ({offers.length})</h3>
                <div className="divide-y divide-gray-50">
                  {offers.map(o => {
                    const s = shops.find(x => x.id === o.shopId);
                    return (
                      <div key={o.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <img src={o.imageUrl} className="w-12 h-12 rounded-lg object-cover" alt="" onError={e => { (e.target as HTMLElement).style.visibility = 'hidden'; }} />
                          <div>
                            <div className="text-sm font-semibold text-primary">{language === 'ar' ? s?.nameAr : s?.nameEn}</div>
                            <div className="text-xs text-gray-400">{s?.city}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {o.priceVisibility === PriceVisibility.SHOW_PRICE
                            ? <Price value={o.price} currency={o.currency} />
                            : <span className="text-sm font-semibold text-primary">{t('contactShop')}</span>}
                          <Link to={`/part/${o.id}`} className="rounded-lg border border-primary/20 px-3 py-1.5 text-xs font-bold text-primary hover:bg-surface">
                            {t('viewDetails')}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="grid lg:grid-cols-5 gap-6 mt-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-primary mb-4">{t('reviews')} ({productReviews.length})</h3>
              {productReviews.length === 0 && <p className="text-sm text-gray-400">{t('noReviews')}</p>}
              <div className="space-y-4">
                {productReviews.map(r => (
                  <div key={r.id} className="border border-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-primary">{r.userName}</span>
                      <Rating value={r.rating} size={12} />
                    </div>
                    <p className="text-sm text-gray-600">{r.comment}</p>
                  </div>
                ))}
                {isAuthenticated && user?.role !== UserRole.ADMIN && user?.role !== UserRole.SHOP_EMPLOYEE && (
                  <form onSubmit={submitReview} className="mt-5 pt-4 border-t border-gray-50">
                    <h4 className="font-bold text-primary text-sm mb-2">{t('writeReview')}</h4>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map(r => (
                        <button key={r} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: r }))}>
                          <Star size={22} fill={r <= reviewForm.rating ? '#f59e0b' : 'none'} stroke="#f59e0b" />
                        </button>
                      ))}
                    </div>
                    <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                      placeholder={language === 'ar' ? 'اكتب تقييمك…' : 'Write your review…'}
                      className="w-full rounded-xl border border-gray-100 bg-surface p-3 text-sm outline-none mb-2" rows={3} />
                    <button type="submit" className="rounded-xl bg-primary text-white px-5 py-2 text-sm font-bold hover:bg-navy">{t('submit')}</button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Related products */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-primary mb-4">{t('relatedParts')}</h3>
              <div className="space-y-3">
                {products.filter(p => p.id !== product.id && p.categoryId === product.categoryId).slice(0, 4).map(p => (
                  <Link key={p.id} to={`/part/${p.id}`} className="flex items-center gap-3 hover:bg-surface/60 rounded-xl p-2 transition">
                    <img src={p.imageUrl} className="w-12 h-12 rounded-lg object-cover" alt="" onError={e => { (e.target as HTMLElement).style.visibility = 'hidden'; }} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-primary line-clamp-1">{language === 'ar' ? p.nameAr : p.nameEn}</div>
                      {p.priceVisibility === PriceVisibility.SHOW_PRICE
                        ? <span className="text-xs font-bold text-navy">{p.price.toLocaleString()} {p.currency}</span>
                        : <span className="text-xs text-gray-400">{t('contactShop')}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartDetails;