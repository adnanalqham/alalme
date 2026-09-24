import React, { useEffect, useState } from 'react';
import { Store, Check, X, Percent } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { adminService } from '../../api';
import { CommissionType, ShopStatus } from '../../types';
import { Badge, PageHeader, MobileTable, inputCls } from '../../components/ui/Primitives';

const AdminShops: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [list, setList] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    try { setList(adminService.shops().filter(s => !filter || s.status === filter)); } catch { /* */ }
  }, [tick, filter]);

  const approve = (s: any) => { try { adminService.approveShop(s.id); setTick(x => x + 1); toast(language === 'ar' ? 'تم اعتماد المحل' : 'Shop approved', { kind: 'success' }); } catch (err: any) { toast(err?.message, { kind: 'error' }); } };
  const reject = (s: any) => { try { adminService.rejectShop(s.id, 'Please review your details.'); setTick(x => x + 1); toast(language === 'ar' ? 'تم الرفض' : 'Rejected', { kind: 'warning' }); } catch (err: any) { toast(err?.message, { kind: 'error' }); } };
  const setCommission = (shopId: string, type: CommissionType, value: number) => {
    try { adminService.setCommission(shopId, type, value); setTick(x => x + 1); toast(language === 'ar' ? 'تم تعديل العمولة' : 'Commission updated', { kind: 'success' }); }
    catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };

  return (
    <div>
      <PageHeader title={language === 'ar' ? 'المحلات' : 'Shops'} subtitle={language === 'ar' ? 'اعتماد المحلات والعمولات' : 'Approve shops and set commissions'} />

      <div className="flex gap-2 mb-4">
        {['', ShopStatus.PENDING, ShopStatus.APPROVED, ShopStatus.REJECTED].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-xl text-sm font-bold transition ${filter === s ? 'bg-primary text-white' : 'bg-white text-primary border border-gray-100'}`}>
            {s === '' ? (language === 'ar' ? 'الكل' : 'All') : s}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <MobileTable
          headers={[language === 'ar' ? 'المحل' : 'Shop', language === 'ar' ? 'الحالة' : 'Status', language === 'ar' ? 'العمولة' : 'Commission', language === 'ar' ? 'إجراءات' : 'Actions']}
          empty={language === 'ar' ? 'لا توجد محلات' : 'No shops'}
          rows={list.map(s => [
            <div key="s">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-surface text-primary flex items-center justify-center overflow-hidden">{s.logoUrl ? <img src={s.logoUrl} className="w-full h-full object-cover" alt="" /> : <Store size={15} />}</span>
                <div>
                  <div className="font-semibold text-primary">{s.nameEn}</div>
                  <div className="text-xs text-gray-400">· {s.phone}{s.ownerId ? ` · ${s.ownerId}` : ''}</div>
                </div>
              </div>
            </div>,
            <Badge key="st" tone={s.status === ShopStatus.APPROVED ? 'success' : s.status === ShopStatus.PENDING ? 'warning' : 'danger'}>{s.status}</Badge>,
            <div key="c" className="flex items-center gap-1">
              <select defaultValue={s.commissionType ?? CommissionType.PERCENT} onChange={e => setCommission(s.id, e.target.value as CommissionType, Number(s.commissionValue ?? 3))} className="rounded-lg border border-gray-100 px-1 py-1 text-xs outline-none">
                <option value={CommissionType.PERCENT}>%</option>
                <option value={CommissionType.FIXED}>CR</option>
              </select>
              <input key="v" type="number" min={0} max={100} defaultValue={s.commissionValue ?? 3}
                onBlur={e => { const v = Number(e.target.value); if (v >= 0) setCommission(s.id, s.commissionType ?? CommissionType.PERCENT, v); }}
                className="w-16 rounded-lg border border-gray-100 px-2 py-1 text-xs outline-none" />
              <Percent size={12} className="text-gray-300" />
            </div>,
            <div key="a" className="flex gap-1">
              {s.status !== ShopStatus.APPROVED && <button onClick={() => approve(s)} className="flex items-center gap-1 rounded-lg bg-green-600 text-white px-2.5 py-1.5 text-xs font-bold hover:bg-green-700"><Check size={12} /> {language === 'ar' ? 'اعتماد' : 'Approve'}</button>}
              {s.status === ShopStatus.PENDING && <button onClick={() => reject(s)} className="flex items-center gap-1 rounded-lg bg-red-50 text-red-500 px-2.5 py-1.5 text-xs font-bold hover:bg-red-100"><X size={12} /> {language === 'ar' ? 'رفض' : 'Reject'}</button>}
            </div>,
          ])}
        />
      </div>
    </div>
  );
};

export default AdminShops;