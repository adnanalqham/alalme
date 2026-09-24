import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { reviewService } from '../../api';
import { Badge, PageHeader, MobileTable } from '../../components/ui/Primitives';

const AdminReviews: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [list, setList] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    try { setList(reviewService.moderationList(filter || undefined)); } catch { /* */ }
  }, [filter, tick]);

  const set = (r: any, status: 'APPROVED' | 'REJECTED') => {
    try { reviewService.setStatus(r.id, status); setTick(x => x + 1); toast(status === 'APPROVED' ? (language === 'ar' ? 'تم الاعتماد' : 'Approved') : (language === 'ar' ? 'تم الرفض' : 'Rejected'), { kind: 'success' }); }
    catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };

  return (
    <div>
      <PageHeader title={language === 'ar' ? 'إدارة التقييمات' : 'Review moderation'} subtitle={language === 'ar' ? 'مراجعة تقييمات العملاء' : 'Moderate customer reviews'} />

      <div className="flex gap-2 mb-4">
        {['', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-xl text-sm font-bold transition ${filter === s ? 'bg-primary text-white' : 'bg-white text-primary border border-gray-100'}`}>
            {s === '' ? (language === 'ar' ? 'الكل' : 'All') : s}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <MobileTable
          headers={[language === 'ar' ? 'العميل' : 'Customer', language === 'ar' ? 'التقييم' : 'Review', language === 'ar' ? 'الحالة' : 'Status', '']}
          empty={language === 'ar' ? 'لا توجد تقييمات' : 'No reviews'}
          rows={list.map(r => [
            <span key="u" className="text-sm font-bold text-primary">{r.userName}</span>,
            <div key="r">
              <div className="text-amber-500 text-xs">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
              <div className="text-sm text-gray-600 mt-0.5">{r.comment}</div>
            </div>,
            <Badge key="s" tone={r.status === 'APPROVED' ? 'success' : r.status === 'PENDING' ? 'warning' : 'danger'}>{r.status}</Badge>,
            <div key="a" className="flex gap-1">
              {r.status !== 'APPROVED' && <button onClick={() => set(r, 'APPROVED')} className="flex items-center gap-1 rounded-lg bg-green-600 text-white px-2.5 py-1.5 text-xs font-bold hover:bg-green-700"><Check size={12} /> {language === 'ar' ? 'اعتماد' : 'Approve'}</button>}
              {r.status !== 'REJECTED' && <button onClick={() => set(r, 'REJECTED')} className="flex items-center gap-1 rounded-lg bg-red-50 text-red-500 px-2.5 py-1.5 text-xs font-bold hover:bg-red-100"><X size={12} /> {language === 'ar' ? 'رفض' : 'Reject'}</button>}
            </div>,
          ])}
        />
      </div>
    </div>
  );
};

export default AdminReviews;