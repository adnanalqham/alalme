import React, { useEffect, useState } from 'react';
import { Save, Clock, Globe, Phone, Image } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { shopService } from '../../api';
import { PageHeader, inputCls, labelCls } from '../../components/ui/Primitives';

const ShopSettings: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [shop, setShop] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    try {
      const s = shopService.myShop();
      setShop(s);
      setForm({
        nameEn: s.nameEn, nameAr: s.nameAr, descriptionEn: s.descriptionEn ?? '', descriptionAr: s.descriptionAr ?? '',
        phone: s.phone, whatsappNumber: s.whatsappNumber ?? '', email: s.email ?? '',
        logoUrl: s.logoUrl ?? '', addressDetails: s.addressDetails ?? '',
        workingHours: s.workingHours ?? '09:00 - 18:00', openingTime: '09:00', closingTime: '18:00',
      });
    } catch { /* */ }
  }, []);

  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      shopService.updateSettings({
        nameEn: form.nameEn, nameAr: form.nameAr,
        descriptionEn: form.descriptionEn, descriptionAr: form.descriptionAr,
        phone: form.phone, whatsappNumber: form.whatsappNumber, email: form.email,
        logoUrl: form.logoUrl, addressDetails: form.addressDetails, workingHours: `${form.openingTime} - ${form.closingTime}`,
      });
      toast(language === 'ar' ? 'تم حفظ الإعدادات' : 'Settings saved', { kind: 'success' });
    } catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };

  if (!shop) return null;

  return (
    <div>
      <PageHeader
        title={language === 'ar' ? 'إعدادات المحل' : 'Shop settings'}
        subtitle={shop.status === 'APPROVED' ? (language === 'ar' ? 'المحل معتمد' : 'Approved shop') : (language === 'ar' ? 'الحالة: قيد المراجعة' : 'Status: pending')}
      />
      <form onSubmit={save} className="max-w-2xl space-y-5">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
          <h3 className="font-bold text-primary mb-4 flex items-center gap-2"><Globe size={15} /> {language === 'ar' ? 'البيانات' : 'Identity'}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>{language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (EN)'}</label><input value={form.nameEn} onChange={e => set('nameEn')(e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>{language === 'ar' ? 'الاسم (عربي)' : 'Name (AR)'}</label><input value={form.nameAr} onChange={e => set('nameAr')(e.target.value)} className={inputCls} /></div>
            <div className="sm:col-span-2"><label className={labelCls}>{language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (EN)'}</label><textarea value={form.descriptionEn} onChange={e => set('descriptionEn')(e.target.value)} rows={2} className={inputCls} /></div>
            <div className="sm:col-span-2"><label className={labelCls}>{language === 'ar' ? 'الوصف (عربي)' : 'Description (AR)'}</label><textarea value={form.descriptionAr} onChange={e => set('descriptionAr')(e.target.value)} rows={2} className={inputCls} /></div>
            <div><label className={labelCls}>{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</label><input value={form.phone} onChange={e => set('phone')(e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>WhatsApp</label><input value={form.whatsappNumber} onChange={e => set('whatsappNumber')(e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Email</label><input type="email" value={form.email} onChange={e => set('email')(e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>{language === 'ar' ? 'العنوان' : 'Address'}</label><input value={form.addressDetails} onChange={e => set('addressDetails')(e.target.value)} className={inputCls} /></div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
          <h3 className="font-bold text-primary mb-4 flex items-center gap-2"><Image size={15} /> {language === 'ar' ? 'الشعار' : 'Logo'}</h3>
          <div className="flex items-center gap-4">
            <span className="w-16 h-16 rounded-2xl bg-surface overflow-hidden flex items-center justify-center">
              {form.logoUrl ? <img src={form.logoUrl} className="w-full h-full object-cover" alt="" /> : <Image className="text-primary/30" size={22} />}
            </span>
            <input value={form.logoUrl} onChange={e => set('logoUrl')(e.target.value)} placeholder="https://…" className={inputCls} />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
          <h3 className="font-bold text-primary mb-4 flex items-center gap-2"><Clock size={15} /> {language === 'ar' ? 'ساعات العمل' : 'Working hours'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>{language === 'ar' ? 'الافتتاح' : 'Opening'}</label><input type="time" value={form.openingTime} onChange={e => set('openingTime')(e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>{language === 'ar' ? 'الإغلاق' : 'Closing'}</label><input type="time" value={form.closingTime} onChange={e => set('closingTime')(e.target.value)} className={inputCls} /></div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="submit" className="rounded-xl bg-primary text-white px-6 py-3 text-sm font-bold hover:bg-navy flex items-center gap-2"><Save size={15} /> {language === 'ar' ? 'حفظ الإعدادات' : 'Save settings'}</button>
          <span className="text-xs text-gray-400">{language === 'ar' ? 'العمولة الحالية:' : 'Current commission:'} {shop.commissionType === 'FIXED' ? shop.commissionValue : shop.commissionValue + '%'}</span>
        </div>
      </form>
    </div>
  );
};

export default ShopSettings;