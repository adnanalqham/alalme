import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { orderService, paymentService, adminService } from '../../api';
import { Badge, PageHeader, MobileTable } from '../../components/ui/Primitives';

const AdminOrders: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [data, setData] = useState<{ orders: any[]; total: number }>({ orders: [], total: 0 });
  const [status, setStatus] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    try { setData(orderService.adminList({ status: status || undefined })); } catch { /* */ }
  }, [status, tick]);

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  return (
    <div>
      <PageHeader title={t('All orders', 'كل الطلبات')} subtitle={`${data.total} ${t('total', 'إجمالي')}`} />

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {['', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'REJECTED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => setStatus(s)} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${status === s ? 'bg-primary text-white' : 'bg-white text-primary border border-gray-100'}`}>
            {s === '' ? t('All', 'الكل') : s}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <MobileTable
          headers={[t('Order', 'الطلب'), t('Customer', 'العميل'), t('Shops', 'المحلات'), t('Total', 'الإجمالي'), t('Status', 'الحالة')]}
          empty={t('No orders', 'لا توجد طلبات')}
          rows={data.orders.map(o => [
            <div key="id">
              <div className="font-bold text-primary">{o.id}</div>
              <div className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleString(language === 'ar' ? 'ar' : 'en')}</div>
            </div>,
            <span key="c" className="text-sm text-primary">{o.customerId}</span>,
            <div key="s" className="flex flex-wrap gap-1">
              {o.shopGroups.map((g: any) => <Badge key={g.shopId} tone="info">{language === 'ar' ? g.shopNameAr : g.shopNameEn}</Badge>)}
            </div>,
            <span key="t" className="font-extrabold text-primary">{o.total.toLocaleString()} {o.currency}</span>,
            <Badge key="st" tone={o.status === 'COMPLETED' ? 'success' : o.status === 'PENDING' ? 'warning' : o.status === 'REJECTED' || o.status === 'CANCELLED' ? 'danger' : 'info'}>{o.status}</Badge>,
          ])}
        />
      </div>
    </div>
  );
};

export default AdminOrders;