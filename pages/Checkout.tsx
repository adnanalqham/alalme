import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Plus, CreditCard, Banknote, Wallet, Truck, Store, ArrowRight, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { orderService, authService } from '../api';
import { PaymentMethod, DeliveryType, PriceVisibility } from '../types';
import { EmptyState } from '../components/ui/Primitives';

const PaymentLabels: Record<PaymentMethod, { en: string; ar: string }> = {
  [PaymentMethod.CASH]: { en: 'Cash on delivery', ar: 'الدفع عند الاستلام' },
  [PaymentMethod.BANK_TRANSFER]: { en: 'Bank transfer', ar: 'تحويل بنكي' },
  [PaymentMethod.WALLET]: { en: 'Wallet balance', ar: 'رصيد المحفظة' },
  [PaymentMethod.CARD]: { en: 'Debit / Credit card', ar: 'بطاقة بنكية' },
};

const DeliveryLabels: Record<DeliveryType, { en: string; ar: string }> = {
  [DeliveryType.PICKUP]: { en: 'Shop pickup', ar: 'استلام من المحل' },
  [DeliveryType.SHOP_DELIVERY]: { en: 'Shop delivery', ar: 'توصيل من المحل' },
  [DeliveryType.DELIVERY_COMPANY]: { en: 'Courier delivery', ar: 'توصيل شركة شحن' },
};

const Checkout: React.FC = () => {
  const { t, language } = useLanguage();
  const { items, subtotal, clear } = useCart();
  const { products, shops, settings, countries, cities } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>(DeliveryType.SHOP_DELIVERY);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addr, setAddr] = useState({ label: '', countryId: '', cityId: '', address: '', phone: '' });

  const addresses = useMemo(() => {
    try { return authService.addressBook(); } catch { return []; }
  }, [placing]);

  const groups = useMemo(() => {
    const map = new Map<string, { productIds: string[]; name: string }>();
    items.forEach(it => {
      const p = products.find(x => x.id === it.productId);
      const s = p?.shopId ?? '__unknown';
      if (!map.has(s)) map.set(s, { productIds: [], name: shops.find(sh => sh.id === s)?.nameEn ?? '—' });
      map.get(s)!.productIds.push(it.productId);
    });
    return [...map.entries()];
  }, [items, products, shops]);

  const visibleItems = items.filter(it => products.find(p => p.id === it.productId)?.priceVisibility === PriceVisibility.SHOW_PRICE);
  const subtotalVisible = visibleItems.reduce((n, i) => n + i.unitPrice * i.quantity, 0);

  const saveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      authService.saveAddress({
        label: addr.label || (language === 'ar' ? 'منزل' : 'Home'),
        countryId: addr.countryId, cityId: addr.cityId || undefined, city: cities.find(c => c.id === addr.cityId)?.nameEn,
        address: addr.address, phone: addr.phone,
      });
      setShowAddressForm(false);
      setAddr({ label: '', countryId: '', cityId: '', address: '', phone: '' });
      toast(t('addressSaved'), { kind: 'success' });
      setPlacing(p => !p); // refresh addresses
    } catch (err: any) {
      toast(err?.message, { kind: 'error' });
    }
  };

  const placeOrder = () => {
    try {
      setPlacing(true);
      const order = orderService.placeOrder({
        deliveryType,
        deliveryAddressId: deliveryType === DeliveryType.PICKUP ? undefined : selectedAddress || undefined,
        notes: notes || undefined,
        paymentMethod,
      });
      clear();
      toast(t('orderPlaced'), { kind: 'success' });
      navigate(`/orders/${order.id}`);
    } catch (err: any) {
      toast(err?.message, { kind: 'error' });
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-surface min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <EmptyState title={t('cartEmpty')} icon={<Truck size={30} />} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-extrabold text-primary mb-5">{t('checkout')}</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Delivery method */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-primary mb-3 flex items-center gap-2"><Truck size={16} /> {t('deliveryMethod')}</h3>
              <div className="grid sm:grid-cols-3 gap-2">
                {(Object.keys(DeliveryLabels) as DeliveryType[]).map(dt => (
                  <button key={dt} onClick={() => setDeliveryType(dt)}
                    className={`rounded-xl border p-4 text-start transition ${deliveryType === dt ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                    <div className="text-sm font-bold text-primary">{language === 'ar' ? DeliveryLabels[dt].ar : DeliveryLabels[dt].en}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{dt === DeliveryType.PICKUP ? 'Free' : 'Est. ' + (settings.currency === 'YER' ? '500' : settings.currency === 'SAR' ? '25' : '10')}</div>
                  </button>
                ))}
              </div>
            </section>

            {/* Address */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-primary mb-3 flex items-center gap-2"><MapPin size={16} /> {t('deliveryAddress')}</h3>
              {deliveryType !== DeliveryType.PICKUP && addresses.length > 0 ? (
                <div className="space-y-2">
                  {addresses.map(a => (
                    <label key={a.id} className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${selectedAddress === a.id ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                      <input type="radio" name="addr" value={a.id} checked={selectedAddress === a.id} onChange={() => setSelectedAddress(a.id)} className="mt-1 accent-primary" />
                      <div>
                        <div className="text-sm font-bold text-primary">{a.label}</div>
                        <div className="text-xs text-gray-400">{a.address} · {a.phone}</div>
                      </div>
                    </label>
                  ))}
                  {selectedAddress === '' && <p className="text-xs text-red-500">{t('selectAddress')}</p>}
                </div>
              ) : deliveryType !== DeliveryType.PICKUP ? (
                <p className="text-sm text-gray-400 mb-2">{t('noAddresses')}</p>
              ) : null}

              {deliveryType !== DeliveryType.PICKUP && (
                showAddressForm ? (
                  <form onSubmit={saveAddress} className="mt-4 grid grid-cols-2 gap-3 bg-surface rounded-xl p-4">
                    <input value={addr.label} onChange={e => setAddr(a => ({ ...a, label: e.target.value }))} placeholder={t('addressLabel')} className="col-span-1 rounded-lg border border-gray-100 px-3 py-2 text-sm outline-none" />
                    <input value={addr.phone} onChange={e => setAddr(a => ({ ...a, phone: e.target.value }))} placeholder={t('phone')} required className="col-span-1 rounded-lg border border-gray-100 px-3 py-2 text-sm outline-none" />
                    <select value={addr.countryId} onChange={e => setAddr(a => ({ ...a, countryId: e.target.value, cityId: '' }))} required className="rounded-lg border border-gray-100 px-3 py-2 text-sm outline-none">
                      <option value="">{t('country')}…</option>
                      {countries.map(c => <option key={c.id} value={c.id}>{language === 'ar' ? c.nameAr : c.nameEn}</option>)}
                    </select>
                    <select value={addr.cityId} onChange={e => setAddr(a => ({ ...a, cityId: e.target.value }))} className="rounded-lg border border-gray-100 px-3 py-2 text-sm outline-none">
                      <option value="">{t('city')}…</option>
                      {cities.filter(c => !addr.countryId || c.countryId === addr.countryId).map(c => <option key={c.id} value={c.id}>{language === 'ar' ? c.nameAr : c.nameEn}</option>)}
                    </select>
                    <input value={addr.address} onChange={e => setAddr(a => ({ ...a, address: e.target.value }))} placeholder={t('streetAddress')} required className="col-span-2 rounded-lg border border-gray-100 px-3 py-2 text-sm outline-none" />
                    <div className="col-span-2 flex gap-2">
                      <button type="submit" className="rounded-xl bg-primary text-white px-4 py-2 text-sm font-bold hover:bg-navy">{t('save')}</button>
                      <button type="button" onClick={() => setShowAddressForm(false)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-primary">{t('cancel')}</button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => setShowAddressForm(true)} className="mt-3 inline-flex items-center gap-1 text-sm text-navy font-bold hover:underline">
                    <Plus size={14} /> {t('addAddress')}
                  </button>
                )
              )}
            </section>

            {/* Payment */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-primary mb-3 flex items-center gap-2"><CreditCard size={16} /> {t('paymentMethod')}</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {(Object.keys(PaymentLabels) as PaymentMethod[]).map(pm => (
                  <button key={pm} onClick={() => setPaymentMethod(pm)}
                    className={`rounded-xl border p-4 text-start transition ${paymentMethod === pm ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">{language === 'ar' ? PaymentLabels[pm].ar : PaymentLabels[pm].en}</span>
                      {pm === PaymentMethod.WALLET && <Wallet size={16} className="text-navy" />}
                      {pm === PaymentMethod.CARD && <CreditCard size={16} className="text-navy" />}
                      {pm === PaymentMethod.CASH && <Banknote size={16} className="text-green-600" />}
                    </div>
                    {pm === PaymentMethod.WALLET && <div className="text-xs text-gray-400 mt-1">{t('walletBalance')}: {user?.wallet?.balance ?? 0}</div>}
                  </button>
                ))}
              </div>
              {(paymentMethod === PaymentMethod.CARD || paymentMethod === PaymentMethod.BANK_TRANSFER) && (
                <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5"><Info size={12} /> {t('paymentNote')}</p>
              )}
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-primary mb-2">{t('orderNotes')}</h3>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder={language === 'ar' ? 'ملاحظات للبائع…' : 'Notes for the seller…'} className="w-full rounded-xl border border-gray-100 bg-surface px-3 py-2 text-sm outline-none" />
            </section>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-20">
              <h3 className="font-bold text-primary mb-4">{t('orderSummary')}</h3>
              <div className="space-y-3 mb-4">
                {groups.map(([shopId, g]) => (
                  <div key={shopId} className="border border-gray-50 rounded-xl p-3">
                    <div className="text-xs font-bold text-navy mb-2 flex items-center gap-1.5"><Store size={12} /> {g.name}</div>
                    {g.productIds.slice(0, 3).map(pid => {
                      const p = products.find(x => x.id === pid);
                      const it = items.find(i => i.productId === pid);
                      if (!p || !it) return null;
                      return (
                        <div key={pid} className="flex items-center justify-between text-xs py-0.5">
                          <span className="text-gray-500 line-clamp-1">{language === 'ar' ? p.nameAr : p.nameEn} ×{it.quantity}</span>
                          {p.priceVisibility === PriceVisibility.SHOW_PRICE ? <span className="font-semibold text-primary">{it.unitPrice * it.quantity}</span> : <span className="text-red-500 text-[10px]">{t('contactPrice')}</span>}
                        </div>
                      );
                    })}
                    {g.productIds.length > 3 && <div className="text-[10px] text-gray-400 mt-1">+{g.productIds.length - 3} {t('more')}</div>}
                  </div>
                ))}
              </div>
              <hr className="border-gray-50 mb-3" />
              <div className="text-sm text-gray-500 flex justify-between mb-1"><span>{t('subtotal')}</span><span className="font-bold text-primary">{subtotalVisible.toLocaleString()} {settings.currency}</span></div>
              <div className="text-sm text-gray-500 flex justify-between mb-1"><span>{t('deliveryFee')}</span><span className="font-bold text-primary">{deliveryType === DeliveryType.PICKUP ? 0 : (settings.currency === 'YER' ? 2000 : 40)}</span></div>
              <hr className="border-gray-50 my-3" />
              <div className="text-lg font-extrabold text-primary flex justify-between">
                <span>{t('total')}</span>
                <span>{(subtotalVisible + (deliveryType === DeliveryType.PICKUP ? 0 : (settings.currency === 'YER' ? 2000 : 40))).toLocaleString()} {settings.currency}</span>
              </div>
              <button onClick={placeOrder} disabled={placing || (deliveryType !== DeliveryType.PICKUP && !selectedAddress)}
                className="mt-5 w-full rounded-xl bg-secondary text-primary py-3.5 text-sm font-extrabold hover:brightness-95 disabled:opacity-40 transition flex items-center justify-center gap-2">
                {placing ? '…' : t('placeOrder')} {!placing && <ArrowRight size={16} className="rtl:rotate-180" />}
              </button>
              <Link to="/cart" className="block text-center text-xs text-gray-400 hover:text-primary mt-3">{t('backToCart')}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;