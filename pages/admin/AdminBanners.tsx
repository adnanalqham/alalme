import React, { useState } from 'react';
import { Plus, Image, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { bannerService } from '../../api';
import { PageHeader, inputCls } from '../../components/ui/Primitives';

const AdminBanners: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [list, setList] = useState<any[]>(() => { try { return bannerService.adminList(); } catch { return []; } });
  const [tick, setTick] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titleEn: '', titleAr: '', subtitleEn: '', subtitleAr: '', imageUrl: '', link: '', position: 'HOME_TOP' as any });

  const refresh = () => { try { setList(bannerService.adminList()); } catch { /* */ } };

  const add = () => {
    if (!form.titleEn && !form.titleAr) { toast(language === 'ar' ? 'أدخل عنواناً' : 'Enter a title', { kind: 'warning' }); return; }
    try {
      bannerService.create({
        titleEn: form.titleEn || form.titleAr, titleAr: form.titleAr || form.titleEn,
        subtitleEn: form.subtitleEn || undefined, subtitleAr: form.subtitleAr || undefined,
        imageUrl: form.imageUrl || '/logo.png', link: form.link || undefined,
        position: form.position, isActive: true, sortOrder: list.length + 1,
      });
      refresh(); setShowForm(false); setForm({ titleEn: '', titleAr: '', subtitleEn: '', subtitleAr: '', imageUrl: '', link: '', position: 'HOME_TOP' as any });
      toast(language === 'ar' ? 'تمت إضافة البانر' : 'Banner added', { kind: 'success' });
    } catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };

  const toggle = (b: any) => { try { bannerService.toggle(b.id); refresh(); setTick(x => x + 1); } catch (err: any) { toast(err?.message, { kind: 'error' }); } };
  const remove = (b: any) => { try { bannerService.remove(b.id); refresh(); setTick(x => x + 1); } catch (err: any) { toast(err?.message, { kind: 'error' }); } };
  const move = (b: any, d: number) => {
    const idx = list.findIndex(x => x.id === b.id);
    const target = idx + d;
    if (target < 0 || target >= list.length) return;
    try {
      bannerService.update(b.id, { sortOrder: list[target].sortOrder });
      bannerService.update(list[target].id, { sortOrder: b.sortOrder });
      refresh(); setTick(x => x + 1);
    } catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };

  return (
    <div>
      <PageHeader title={language === 'ar' ? 'البانرات' : 'Banners'} action={
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 rounded-xl bg-primary text-white px-4 py-2 text-sm font-bold hover:bg-navy"><Plus size={14} /> {language === 'ar' ? 'إضافة بانر' : 'Add banner'}</button>
      } />

      {showForm && (
        <div className="max-w-xl rounded-2xl border border-gray-100 bg-white shadow-sm p-4 mb-4 space-y-2">
          <div className="flex gap-2">
            <input value={form.titleEn} onChange={e => setForm(f => ({ ...f, titleEn: e.target.value }))} placeholder="Title (EN)" className={inputCls} />
            <input value={form.titleAr} onChange={e => setForm(f => ({ ...f, titleAr: e.target.value }))} placeholder="العنوان (عربي)" className={inputCls} />
          </div>
          <div className="flex gap-2">
            <input value={form.subtitleEn} onChange={e => setForm(f => ({ ...f, subtitleEn: e.target.value }))} placeholder="Subtitle (EN)" className={inputCls} />
            <input value={form.subtitleAr} onChange={e => setForm(f => ({ ...f, subtitleAr: e.target.value }))} placeholder="الوصف (عربي)" className={inputCls} />
          </div>
          <div className="flex gap-2">
            <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="Image URL (optional)" className={inputCls} />
            <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="/parts" className={inputCls} />
          </div>
          <div className="flex gap-2">
            <select value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value as any }))} className={inputCls}>
              <option value="HOME_TOP">HOME_TOP</option>
              <option value="HOME_MID">HOME_MID</option>
              <option value="SHOP">SHOP</option>
            </select>
            <button onClick={add} className="rounded-xl bg-primary text-white px-4 text-sm font-bold hover:bg-navy">{language === 'ar' ? 'حفظ' : 'Save'}</button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden max-w-3xl">
        {list.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-400">{language === 'ar' ? 'لا توجد بانرات' : 'No banners'}</p>
        ) : (
          list.map((b, i) => (
            <div key={b.id} className="flex items-center gap-3 p-3 border-b border-gray-50 last:border-0">
              <div className="w-24 h-14 rounded-xl overflow-hidden bg-surface shrink-0">
                {b.imageUrl && b.imageUrl.startsWith('data:') ? <img src={b.imageUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-primary"><Image size={18} /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-primary truncate">{language === 'ar' ? b.titleAr : b.titleEn}</div>
                <div className="text-xs text-gray-400 truncate">{language === 'ar' ? b.subtitleAr : b.subtitleEn} · {b.position}</div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => move(b, -1)} disabled={i === 0} className="w-8 h-8 rounded-lg border border-gray-100 text-xs font-bold text-primary hover:bg-surface disabled:opacity-30">↑</button>
                <button onClick={() => move(b, 1)} disabled={i === list.length - 1} className="w-8 h-8 rounded-lg border border-gray-100 text-xs font-bold text-primary hover:bg-surface disabled:opacity-30">↓</button>
                <button onClick={() => toggle(b)} className={`px-3 rounded-lg text-xs font-bold ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{b.isActive ? 'ON' : 'OFF'}</button>
                <button onClick={() => remove(b)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"><Trash2 size={13} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminBanners;