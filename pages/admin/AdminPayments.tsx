import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { paymentService, adminService } from '../../api';
import { Badge, PageHeader, MobileTable } from '../../components/ui/Primitives';

const AdminPayments: React.FC = () => {
  const { language } = useLanguage();
  const [list, setList] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    try { setList(paymentService.adminAll().filter(p => !filter || p.status === filter)); } catch (err: any) { /* */ }
  }, [filter, tick]);

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  return (
    <div>
      <PageHeader title={t('Payments', 'المدفوعات')} subtitle={`${list.length} ${t('records', 'سجل')}`} />

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {['', 'PENDING', 'PAID', 'FAILED', 'REFUNDED'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${filter === s ? 'bg-primary text-white' : 'bg-white text-primary border border-gray-100'}`}>
            {s === '' ? t('All', 'الكل') : s}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <MobileTable
          headers={[t('Payment', 'الدفعة'), t('Method', 'الطريقة'), t('Amount', 'المبلغ'), t('Status', 'الحالة'), t('Date', 'التاريخ')]}
          empty={t('No payments', 'لا توجد مدفوعات')}
          rows={list.map(p => [
            <span key="id" className="font-bold text-primary" dir="ltr">{p.id}</span>,
            <Badge key="m" tone="info">{p.method}</Badge>,
            <span key="a" className="font-extrabold text-primary">{p.amount.toLocaleString()} {p.currency}</span>,
            <Badge key="s" tone={p.status === 'PAID' ? 'success' : p.status === 'FAILED' ? 'danger' : p.status === 'REFUNDED' ? 'warning' : 'neutral'}>{p.status}</Badge>,
            <span key="d" className="text-sm text-gray-500">{new Date(p.createdAt).toLocaleString(language === 'ar' ? 'ar' : 'en')}</span>,
          ])}
        />
      </div>
    </div>
  );
};

export default AdminPayments;