import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User as UserIcon, Package, Heart, MapPin, Car, LogOut, MessageSquareWarning,
  Bell, Plus, Trash2, Star,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { authService, complaintService, vehicleService } from '../api';
import { PriceVisibility } from '../types';
import { Badge, EmptyState } from '../components/ui/Primitives';

type Tab = 'overview' | 'garage' | 'wishlist' | 'addresses' | 'complaints';

const Profile: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, logout } = useAuth();
  const { products, shops, countries, cities } = useData();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('overview');
  const [tick, setTick] = useState(0);

  const [veh, setVeh] = useState({ makeId: '', modelId: '', generationId: '', engineId: '', year: '' });
  const [compForm, setCompForm] = useState({ shopId: '', subject: '', message: '' });
  const [addrForm, setAddrForm] = useState({ label: '', countryId: '', cityId: '', address: '', phone: '' });
  const [showAddr, setShowAddr] = useState(false);

  const wishlist = useMemo(() => { try { return authService.myWishlist().productIds; } catch { return []; } }, [tick]);
  const garage = useMemo(() => { try { return authService.myGarage(); } catch { return []; } }, [tick]);
  const addresses = useMemo(() => { try { return authService.addressBook(); } catch { return []; } }, [tick]);
  const complaintsList = useMemo(() => { try { return complaintService.listMine(); } catch { return []; } }, [tick]);

  const models = useMemo(() => (veh.makeId ? vehicleService.models(veh.makeId) : []), [veh.makeId]);
  const generations = useMemo(() => (veh.modelId ? vehicleService.generations(veh.modelId) : []), [veh.modelId]);
  const engines = useMemo(() => (veh.generationId ? vehicleService.engines(veh.generationId) : []), [veh.generationId]);

  if (!user) return null;

  const addVehicle = () => {
    if (!veh.makeId || !veh.modelId) { toast(t('fillVehicle'), { kind: 'warning' }); return; }
    try {
      authService.addToGarage({
        makeId: veh.makeId, modelId: veh.modelId,
        generationId: veh.generationId || undefined, engineId: veh.engineId || undefined,
        year: veh.year ? Number(veh.year) : undefined,
      });
      toast(t('vehicleAdded'), { kind: 'success' });
      setVeh({ makeId: '', modelId: '', generationId: '', engineId: '', year: '' });
      setTick(x => x + 1);
    } catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };

  const addAddress = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      authService.saveAddress({
        label: addrForm.label || (language === 'ar' ? 'منزل' : 'Home'),
        countryId: addrForm.countryId, cityId: addrForm.cityId || undefined,
        address: addrForm.address, phone: addrForm.phone,
      });
      toast(t('addressSaved'), { kind: 'success' });
      setAddrForm({ label: '', countryId: '', cityId: '', address: '', phone: '' });
      setShowAddr(false); setTick(x => x + 1);
    } catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };

  const submitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compForm.subject.trim() || !compForm.message.trim()) { toast(t('fillAll'), { kind: 'warning' }); return; }
    try {
      complaintService.create({ shopId: compForm.shopId || undefined, subject: compForm.subject, message: compForm.message });
      toast(t('complaintSent'), { kind: 'success' });
      setCompForm({ shopId: '', subject: '', message: '' });
      setTick(x => x + 1);
    } catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: language === 'ar' ? 'نظرة عامة' : 'Overview', icon: <UserIcon size={15} /> },
    { key: 'garage', label: language === 'ar' ? 'مرآبي' : 'My garage', icon: <Car size={15} /> },
    { key: 'wishlist', label: language === 'ar' ? 'المفضلة' : 'Wishlist', icon: <Heart size={15} /> },
    { key: 'addresses', label: language === 'ar' ? 'العناوين' : 'Addresses', icon: <MapPin size={15} /> },
    { key: 'complaints', label: language === 'ar' ? 'الشكاوى' : 'Complaints', icon: <MessageSquareWarning size={15} /> },
  ];

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5 flex flex-wrap items-center gap-5">
          <span className="w-20 h-20 rounded-3xl bg-gradient-to-br from-navy to-primary text-white flex items-center justify-center text-2xl font-extrabold">
            {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </span>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold text-primary">{user.fullName}</h1>
            <p className="text-sm text-gray-400">{user.email} · {user.phone}</p>
            <div className="flex gap-2 mt-2">
              <Badge tone="info">{language === 'ar' ? 'عميل' : 'Customer'}</Badge>
              <span className="text-xs text-gray-400">{t('walletBalance')}: {user.wallet?.balance?.toLocaleString() ?? 0}</span>
            </div>
          </div>
          <button onClick={() => { logout(); }} className="rounded-xl border border-red-100 text-red-500 px-4 py-2.5 text-sm font-bold hover:bg-red-50 flex items-center gap-2">
            <LogOut size={15} /> {t('logout')}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto mb-5 border-b border-gray-100">
          {tabs.map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key)}
              className={`px-4 py-2.5 text-sm font-bold rounded-t-xl -mb-px whitespace-nowrap flex items-center gap-1.5 transition ${tab === tb.key ? 'bg-white text-primary border border-gray-100 border-b-white' : 'text-gray-400 hover:text-primary'}`}>
              {tb.icon} {tb.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {tab === 'overview' && (
              <div className="grid sm:grid-cols-2 gap-4">
                <Link to="/orders" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition flex items-center gap-4">
                  <span className="w-12 h-12 rounded-2xl bg-navy/10 text-navy flex items-center justify-center"><Package size={20} /></span>
                  <div><div className="font-bold text-primary text-sm">{t('myOrders')}</div><div className="text-xs text-gray-400">{language === 'ar' ? 'تتبع وتسلم الطلبات' : 'Track and receive orders'}</div></div>
                </Link>
                <Link to="/notifications" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition flex items-center gap-4">
                  <span className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-500 flex items-center justify-center"><Bell size={20} /></span>
                  <div><div className="font-bold text-primary text-sm">{t('notifications')}</div><div className="text-xs text-gray-400">{language === 'ar' ? 'التنبيهات والإشعارات' : 'Alerts and updates'}</div></div>
                </Link>
                <Link to="/search" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition flex items-center gap-4">
                  <span className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center"><Car size={20} /></span>
                  <div><div className="font-bold text-primary text-sm">{t('searchParts')}</div><div className="text-xs text-gray-400">{language === 'ar' ? 'ابحث عن القطع' : 'Find parts'}</div></div>
                </Link>
                <Link to="/" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition flex items-center gap-4">
                  <span className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center"><Star size={20} /></span>
                  <div><div className="font-bold text-primary text-sm">{t('browseParts')}</div><div className="text-xs text-gray-400">{language === 'ar' ? 'تصفح العروض' : 'Browse offers'}</div></div>
                </Link>
              </div>
            )}

            {tab === 'garage' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-primary mb-4 flex items-center gap-2"><Car size={16} /> {language === 'ar' ? 'مرآبي' : 'My garage'}</h3>
                {garage.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {garage.map(v => (
                      <div key={v.id} className="flex items-center justify-between border border-gray-50 rounded-xl p-3">
                        <div>
                          <div className="text-sm font-bold text-primary">{v.makeNameEn} {v.modelNameEn}</div>
                          <div className="text-xs text-gray-400">{v.year ? `${v.year} · ` : ''}{v.engineBadge}</div>
                        </div>
                        <button onClick={() => { try { authService.removeFromGarage(v.id); setTick(x => x + 1); } catch { /* */ } }} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <Select value={veh.makeId} onChange={v => setVeh(x => ({ ...x, makeId: v, modelId: '', generationId: '', engineId: '' }))} options={[{ value: '', label: t('selectMake') }, ...vehicleService.makes().map(m => ({ value: m.id, label: language === 'ar' ? m.nameAr : m.nameEn }))]} />
                  <Select value={veh.modelId} onChange={v => setVeh(x => ({ ...x, modelId: v, generationId: '', engineId: '' }))} disabled={!veh.makeId} options={[{ value: '', label: t('selectModel') }, ...models.map(m => ({ value: m.id, label: language === 'ar' ? m.nameAr : m.nameEn }))]} />
                  <Select value={veh.generationId} onChange={v => setVeh(x => ({ ...x, generationId: v, engineId: '' }))} disabled={!veh.modelId} options={[{ value: '', label: t('selectGeneration') }, ...generations.map(g => ({ value: g.id, label: `${language === 'ar' ? g.nameAr : g.nameEn} (${g.yearStart}${g.yearEnd ? '-' + g.yearEnd : '+'})` }))]} />
                  <Select value={veh.engineId} onChange={v => setVeh(x => ({ ...x, engineId: v }))} disabled={!veh.generationId} options={[{ value: '', label: t('selectEngine') }, ...engines.map(e => ({ value: e.id, label: e.badge }))]} />
                  <input value={veh.year} onChange={e => setVeh(x => ({ ...x, year: e.target.value }))} placeholder={language === 'ar' ? 'سنة الصنع' : 'Model year'} className="rounded-lg border border-gray-100 bg-surface px-3 py-2 text-sm outline-none" />
                  <button onClick={addVehicle} className="rounded-lg bg-primary text-white text-sm font-bold py-2 hover:bg-navy">{t('addVehicle')}</button>
                </div>
              </div>
            )}

            {tab === 'wishlist' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-primary mb-4 flex items-center gap-2"><Heart size={16} /> {language === 'ar' ? 'المفضلة' : 'Wishlist'}</h3>
                {wishlist.length === 0 ? <EmptyState title={t('wishlistEmpty')} icon={<Heart size={28} />} /> : (
                  <div className="grid grid-cols-2 gap-3">
                    {wishlist.map(pid => {
                      const p = products.find(x => x.id === pid);
                      if (!p) return null;
                      return (
                        <Link key={pid} to={`/part/${p.id}`} className="flex gap-3 border border-gray-50 rounded-xl p-3 hover:bg-surface/60 transition">
                          <img src={p.imageUrl} className="w-14 h-14 rounded-lg object-cover" alt="" onError={e => { (e.target as HTMLElement).style.visibility = 'hidden'; }} />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-primary line-clamp-2">{language === 'ar' ? p.nameAr : p.nameEn}</div>
                            {p.priceVisibility === PriceVisibility.SHOW_PRICE
                              ? <span className="text-xs font-extrabold text-navy">{p.price.toLocaleString()} {p.currency}</span>
                              : <span className="text-[10px] text-gray-400">{t('contactShop')}</span>}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {tab === 'addresses' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-primary">{t('deliveryAddress')}</h3>
                  <button onClick={() => setShowAddr(v => !v)} className="text-sm text-navy font-bold flex items-center gap-1"><Plus size={14} /> {t('addAddress')}</button>
                </div>
                {addresses.length === 0 && <EmptyState title={t('noAddresses')} icon={<MapPin size={26} />} />}
                <div className="space-y-2">
                  {addresses.map(a => (
                    <div key={a.id} className="border border-gray-50 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-primary">{a.label}</div>
                        <div className="text-xs text-gray-400">{a.address} · {a.phone}</div>
                      </div>
                      <Badge tone="cream">{a.cityId ? cities.find(c => c.id === a.cityId)?.nameEn : a.city}</Badge>
                    </div>
                  ))}
                </div>
                {showAddr && (
                  <form onSubmit={addAddress} className="mt-4 grid grid-cols-2 gap-3 bg-surface rounded-xl p-4">
                    <input value={addrForm.label} onChange={e => setAddrForm(a => ({ ...a, label: e.target.value }))} placeholder={t('addressLabel')} className="rounded-lg border border-gray-100 px-3 py-2 text-sm outline-none" />
                    <input value={addrForm.phone} onChange={e => setAddrForm(a => ({ ...a, phone: e.target.value }))} placeholder={t('phone')} required className="rounded-lg border border-gray-100 px-3 py-2 text-sm outline-none" />
                    <select value={addrForm.countryId} onChange={e => setAddrForm(a => ({ ...a, countryId: e.target.value, cityId: '' }))} required className="rounded-lg border border-gray-100 px-3 py-2 text-sm outline-none">
                      <option value="">{t('country')}…</option>
                      {countries.map(c => <option key={c.id} value={c.id}>{language === 'ar' ? c.nameAr : c.nameEn}</option>)}
                    </select>
                    <select value={addrForm.cityId} onChange={e => setAddrForm(a => ({ ...a, cityId: e.target.value }))} className="rounded-lg border border-gray-100 px-3 py-2 text-sm outline-none">
                      <option value="">{t('city')}…</option>
                      {cities.filter(c => !addrForm.countryId || c.countryId === addrForm.countryId).map(c => <option key={c.id} value={c.id}>{language === 'ar' ? c.nameAr : c.nameEn}</option>)}
                    </select>
                    <input value={addrForm.address} onChange={e => setAddrForm(a => ({ ...a, address: e.target.value }))} placeholder={t('streetAddress')} required className="col-span-2 rounded-lg border border-gray-100 px-3 py-2 text-sm outline-none" />
                    <div className="col-span-2 flex gap-2">
                      <button type="submit" className="rounded-xl bg-primary text-white px-4 py-2 text-sm font-bold">{t('save')}</button>
                      <button type="button" onClick={() => setShowAddr(false)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-primary">{t('cancel')}</button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {tab === 'complaints' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-primary mb-4 flex items-center gap-2"><MessageSquareWarning size={16} /> {language === 'ar' ? 'الشكاوى' : 'Complaints'}</h3>
                <form onSubmit={submitComplaint} className="grid gap-3 mb-5 bg-surface rounded-xl p-4">
                  <input value={compForm.subject} onChange={e => setCompForm(c => ({ ...c, subject: e.target.value }))} placeholder={language === 'ar' ? 'عنوان الشكوى' : 'Subject'} required className="rounded-lg border border-gray-100 px-3 py-2 text-sm outline-none" />
                  <select value={compForm.shopId} onChange={e => setCompForm(c => ({ ...c, shopId: e.target.value }))} className="rounded-lg border border-gray-100 px-3 py-2 text-sm outline-none">
                    <option value="">{language === 'ar' ? 'جميع المحلات (عام)' : 'All shops (general)'}</option>
                    {shops.map(s => <option key={s.id} value={s.id}>{language === 'ar' ? s.nameAr : s.nameEn}</option>)}
                  </select>
                  <textarea value={compForm.message} onChange={e => setCompForm(c => ({ ...c, message: e.target.value }))} placeholder={language === 'ar' ? 'اشرح المشكلة…' : 'Describe the issue…'} required rows={3} className="rounded-lg border border-gray-100 px-3 py-2 text-sm outline-none" />
                  <button type="submit" className="rounded-xl bg-primary text-white px-4 py-2 text-sm font-bold self-start">{language === 'ar' ? 'إرسال الشكوى' : 'Submit complaint'}</button>
                </form>
                {complaintsList.length === 0 ? <EmptyState title={t('noComplaints')} icon={<MessageSquareWarning size={26} />} /> : (
                  <div className="space-y-2">
                    {complaintsList.map(c => (
                      <div key={c.id} className="border border-gray-50 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-primary">{c.subject}</span>
                          <Badge tone={c.status === 'CLOSED' || c.status === 'RESOLVED' ? 'success' : c.status === 'REVIEWING' ? 'info' : 'warning'}>{c.status}</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{c.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Side summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-primary mb-3">{language === 'ar' ? 'إحصائيات' : 'Stats'}</h3>
              {[
                { label: t('myOrders'), value: '—' },
                { label: language === 'ar' ? 'مركبات' : 'Vehicles', value: garage.length },
                { label: language === 'ar' ? 'مفضلة' : 'Wishlist', value: wishlist.length },
                { label: language === 'ar' ? 'عناوين' : 'Addresses', value: addresses.length },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-500">{s.label}</span>
                  <span className="text-sm font-extrabold text-primary">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function Select({ value, onChange, options, disabled }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; disabled?: boolean }) {
  return (
    <select value={value} disabled={disabled} onChange={e => onChange(e.target.value)} className="w-full rounded-lg border border-gray-100 bg-surface px-3 py-2 text-sm text-primary outline-none disabled:opacity-50">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export default Profile;