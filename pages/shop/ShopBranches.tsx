import React, { useEffect, useState } from 'react';
import { Plus, MapPin, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { shopService } from '../../api';
import { PageHeader, MobileTable, inputCls, labelCls } from '../../components/ui/Primitives';

const ShopBranches: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [list, setList] = useState<any[]>([]);
  const [tick, setTick] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nameEn: '', nameAr: '', phone: '', address: '', email: '', workingHours: '' });

  useEffect(() => {
    try { setList(shopService.branchesOf(shopService.myShop().id)); } catch { /* */ }
  }, [tick]);

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      shopService.createBranch({ ...form });
      toast(language === 'ar' ? 'تمت إضافة الفرع' : 'Branch added', { kind: 'success' });
      setForm({ nameEn: '', nameAr: '', phone: '', address: '', email: '', workingHours: '' });
      setShowForm(false); setTick(x => x + 1);
    } catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };

  const del = (b: any) => {
    try { shopService.deleteBranch(b.id); setTick(x => x + 1); toast(language === 'ar' ? 'تم حذف الفرع' : 'Branch deleted', { kind: 'success' }); }
    catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };

  return (
    <div>
      <PageHeader
        title={language === 'ar' ? 'الفروع' : 'Branches'}
        subtitle={language === 'ar' ? 'إدارة فروع المحل ومواقعها' : 'Manage shop locations'}
        action={<button onClick={() => setShowForm(v => !v)} className="rounded-xl bg-primary text-white px-4 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-navy"><Plus size={15} /> {language === 'ar' ? 'فرع جديد' : 'New branch'}</button>}
      />

      {showForm && (
        <form onSubmit={create} className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 mb-5 grid sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>{language === 'ar' ? 'اسم الفرع (إنجليزي) *' : 'Branch name (EN) *'}</label><input value={form.nameEn} onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))} required className={inputCls} /></div>
          <div><label className={labelCls}>{language === 'ar' ? 'اسم الفرع (عربي)' : 'Branch name (AR)'}</label><input value={form.nameAr} onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))} className={inputCls} /></div>
          <div><label className={labelCls}>{language === 'ar' ? 'الهاتف' : 'Phone'}</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} /></div>
          <div><label className={labelCls}>Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} /></div>
          <div><label className={labelCls}>{language === 'ar' ? 'العنوان' : 'Address'}</label><input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={inputCls} /></div>
          <div><label className={labelCls}>{language === 'ar' ? 'ساعات العمل' : 'Working hours'}</label><input value={form.workingHours} onChange={e => setForm(f => ({ ...f, workingHours: e.target.value }))} placeholder="09:00 - 18:00" className={inputCls} /></div>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="rounded-xl bg-primary text-white px-5 py-2.5 text-sm font-bold">{language === 'ar' ? 'حفظ' : 'Save'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-gray-100 px-4 py-2.5 text-sm font-semibold text-primary">{language === 'ar' ? 'إلغاء' : 'Cancel'}</button>
          </div>
        </form>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <MobileTable
          headers={[language === 'ar' ? 'الفرع' : 'Branch', language === 'ar' ? 'العنوان' : 'Address', language === 'ar' ? 'الهاتف' : 'Phone', '']}
          empty={language === 'ar' ? 'لا توجد فروع' : 'No branches'}
          rows={list.map(b => [
            <div key="n">
              <div className="font-semibold text-primary">{b.nameEn}</div>
              <div className="text-xs text-gray-400">{b.nameAr}</div>
            </div>,
            <div key="a" className="flex items-center gap-1 text-sm text-gray-500"><MapPin size={12} className="text-navy" /> {b.address || '—'}</div>,
            <span key="p" className="text-sm text-gray-500" dir="ltr">{b.phone || '—'}</span>,
            <div key="x" className="flex gap-1 justify-end">
              {b.workingHours && <span className="text-xs text-gray-400 me-2">{b.workingHours}</span>}
              <button onClick={() => del(b)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
            </div>,
          ])}
        />
      </div>
    </div>
  );
};

export default ShopBranches;