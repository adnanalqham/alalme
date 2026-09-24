import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { complaintService } from '../../api';
import { Badge, PageHeader, MobileTable } from '../../components/ui/Primitives';

const STATUSES = ['OPEN', 'REVIEWING', 'RESOLVED', 'CLOSED'];

const AdminComplaints: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [list, setList] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    try { setList(complaintService.adminList(filter || undefined)); } catch { /* */ }
  }, [filter, tick]);

  const set = (c: any, status: any) => {
    try { complaintService.updateStatus(c.id, status); setTick(x => x + 1); toast(language === 'ar' ? 'تم تحديث الشكوى' : 'Complaint updated', { kind: 'success' }); }
    catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };

  return (
    <div>
      <PageHeader title={language === 'ar' ? 'الشكاوى' : 'Complaints'} subtitle={language === 'ar' ? 'متابعة وحل شكاوى العملاء' : 'Track and resolve customer complaints'} />

      <div className="flex gap-2 mb-4">
        {['', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-xl text-sm font-bold transition ${filter === s ? 'bg-primary text-white' : 'bg-white text-primary border border-gray-100'}`}>
            {s === '' ? (language === 'ar' ? 'الكل' : 'All') : s}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <MobileTable
          headers={[language === 'ar' ? 'العميل' : 'Customer', language === 'ar' ? 'الشكوى' : 'Complaint', language === 'ar' ? 'الحالة' : 'Status', '']}
          empty={language === 'ar' ? 'لا توجد شكاوى' : 'No complaints'}
          rows={list.map(c => [
            <span key="u" className="text-sm font-bold text-primary">{c.userName}</span>,
            <div key="c">
              <div className="text-sm font-semibold text-primary">{c.subject}</div>
              <div className="text-xs text-gray-500 mt-0.5">{c.message}</div>
            </div>,
            <Badge key="s" tone={c.status === 'RESOLVED' ? 'success' : c.status === 'CLOSED' ? 'neutral' : c.status === 'OPEN' ? 'danger' : 'warning'}>{c.status}</Badge>,
            <select key="a" value={c.status} onChange={e => set(c, e.target.value)} className="rounded-lg border border-gray-100 px-2 py-1.5 text-xs font-bold text-primary outline-none">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>,
          ])}
        />
      </div>
    </div>
  );
};

export default AdminComplaints;