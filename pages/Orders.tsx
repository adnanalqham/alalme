import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PackageSearch, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { orderService } from '../api';
import { Order, OrderStatus } from '../types';
import { Badge, EmptyState } from '../components/ui/Primitives';

const statusTone: Record<string, 'neutral' | 'success' | 'warning' | 'info' | 'danger'> = {
  [OrderStatus.PENDING]: 'warning',
  [OrderStatus.CONFIRMED]: 'info',
  [OrderStatus.PREPARING]: 'info',
  [OrderStatus.READY]: 'success',
  [OrderStatus.COMPLETED]: 'success',
  [OrderStatus.REJECTED]: 'danger',
  [OrderStatus.CANCELLED]: 'danger',
};
const statusEn: Record<string, string> = {
  PENDING: 'Pending', CONFIRMED: 'Confirmed', PREPARING: 'Preparing', READY: 'Ready',
  COMPLETED: 'Completed', REJECTED: 'Rejected', CANCELLED: 'Cancelled',
};
const statusAr: Record<string, string> = {
  PENDING: 'قيد المراجعة', CONFIRMED: 'مؤكد', PREPARING: 'قيد التجهيز', READY: 'جاهز',
  COMPLETED: 'مكتمل', REJECTED: 'مرفوض', CANCELLED: 'ملغي',
};

const Orders: React.FC = () => {
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    try { setOrders(orderService.myOrders()); } catch { /* requires auth */ }
  }, []);

  if (orders.length === 0) {
    return (
      <div className="bg-surface min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <EmptyState
            title={language === 'ar' ? 'لا توجد طلبات بعد' : 'No orders yet'}
            icon={<PackageSearch size={34} />}
            action={<Link to="/search" className="rounded-xl bg-primary text-white px-6 py-3 text-sm font-bold hover:bg-navy">{t('browseParts')}</Link>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-extrabold text-primary mb-5">{t('myOrders')}</h1>
        <div className="space-y-3">
          {orders.map(o => {
            const shipped = o.shopGroups.every(g => g.status === OrderStatus.COMPLETED || g.status === OrderStatus.CANCELLED || g.status === OrderStatus.REJECTED);
            const displayStatus = shipped && o.shopGroups.some(g => g.status === OrderStatus.COMPLETED) ? OrderStatus.COMPLETED : o.status === OrderStatus.CANCELLED ? OrderStatus.CANCELLED : o.shopGroups[0]?.status ?? o.status;
            return (
              <Link key={o.id} to={`/orders/${o.id}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-extrabold text-primary">{o.id}</span>
                    <Badge tone={statusTone[displayStatus]}>{language === 'ar' ? statusAr[displayStatus] : statusEn[displayStatus]}</Badge>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {o.shopGroups.length} {t('shops')} · {o.paymentMethod} · {new Date(o.createdAt).toLocaleDateString(language === 'ar' ? 'ar' : 'en')}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {o.shopGroups.map(g => language === 'ar' ? g.shopNameAr : g.shopNameEn).join(' · ')}
                  </div>
                </div>
                <div className="text-end">
                  <div className="text-base font-extrabold text-primary">{o.total.toLocaleString()} {o.currency}</div>
                  <ArrowRight size={14} className="ms-auto text-gray-300 rtl:rotate-180 mt-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Orders;