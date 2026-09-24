import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, X, Truck, PackageOpen } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { usePermissions } from '../../context/AuthContext';
import { orderService } from '../../api';
import { Order, OrderStatus } from '../../types';
import { Badge, PageHeader, MobileTable } from '../../components/ui/Primitives';

const NEXT: Record<string, OrderStatus[]> = {
  PENDING: [OrderStatus.CONFIRMED, OrderStatus.REJECTED],
  CONFIRMED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  PREPARING: [OrderStatus.READY],
  READY: [OrderStatus.COMPLETED],
};

const ShopOrders: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { canConfirmOrders, canUpdateOrders } = usePermissions();
  const [params] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    try { setOrders(orderService.shopOrders({ status: statusFilter || undefined })); } catch { /* */ }
  }, [statusFilter, tick]);

  const act = (orderId: string, shopId: string, status: OrderStatus) => {
    try { orderService.updateShopGroupStatus(orderId, shopId, status); setTick(x => x + 1); toast(status, { kind: 'success' }); }
    catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };

  const statusAr: Record<string, string> = { PENDING: 'قيد المراجعة', CONFIRMED: 'مؤكد', PREPARING: 'قيد التجهيز', READY: 'جاهز', COMPLETED: 'مكتمل', REJECTED: 'مرفوض', CANCELLED: 'ملغي' };
  const focus = params.get('order');

  return (
    <div>
      <PageHeader
        title={language === 'ar' ? 'طلبات المحل' : 'Shop orders'}
        subtitle={language === 'ar' ? `عدد الطلبات: ${orders.length}` : `${orders.length} orders`}
      />

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {['', OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.COMPLETED, OrderStatus.REJECTED].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${statusFilter === s ? 'bg-primary text-white' : 'bg-white text-primary border border-gray-100 hover:border-gray-200'}`}>
            {s === '' ? (language === 'ar' ? 'الكل' : 'All') : language === 'ar' ? statusAr[s] : s}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <MobileTable
          headers={[language === 'ar' ? 'الطلب' : 'Order', language === 'ar' ? 'العميل' : 'Item', language === 'ar' ? 'الإجمالي' : 'Total', language === 'ar' ? 'الحالة' : 'Status', language === 'ar' ? 'إجراء' : 'Action']}
          empty={language === 'ar' ? 'لا توجد طلبات' : 'No orders'}
          rows={orders.map(o => {
            const g = o.shopGroups[0];
            const next = NEXT[g?.status ?? 'PENDING'] ?? [];
            return [
              <div key="id">
                <div className={`font-bold text-primary ${focus === o.id ? 'ring-2 ring-secondary rounded px-1 inline-block' : ''}`}>{o.id}</div>
                <div className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleString(language === 'ar' ? 'ar' : 'en')}</div>
              </div>,
              <div key="it">
                <div className="text-sm font-semibold text-primary">{language === 'ar' ? g?.shopNameAr : g?.shopNameEn}</div>
                <div className="text-xs text-gray-400">{o.items.length} {language === 'ar' ? 'أصناف' : 'items'}{o.notes ? ` · 💬 ${o.notes}` : ''}</div>
              </div>,
              <span key="t" className="font-extrabold text-primary">{g?.subtotal.toLocaleString()} {o.currency}</span>,
              <Badge key="s" tone={g?.status === OrderStatus.COMPLETED ? 'success' : g?.status === OrderStatus.REJECTED || g?.status === OrderStatus.CANCELLED ? 'danger' : g?.status === OrderStatus.PENDING ? 'warning' : 'info'}>
                {language === 'ar' ? statusAr[g?.status ?? ''] ?? g?.status : g?.status}
              </Badge>,
              <div key="a" className="flex gap-1 flex-wrap">
                {canUpdateOrders && g && g.status === OrderStatus.READY && <button onClick={() => act(o.id, g.shopId, OrderStatus.COMPLETED)} className="flex items-center gap-1 rounded-lg bg-green-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-green-700"><Truck size={12} /> {language === 'ar' ? 'تسليم' : 'Deliver'}</button>}
                {canUpdateOrders && g && g.status === OrderStatus.CONFIRMED && <button onClick={() => act(o.id, g.shopId, OrderStatus.PREPARING)} className="flex items-center gap-1 rounded-lg bg-navy/10 text-navy px-3 py-1.5 text-xs font-bold hover:bg-navy/20"><PackageOpen size={12} /> {language === 'ar' ? 'بدء تجهيز' : 'Prepare'}</button>}
                {canUpdateOrders && g && g.status === OrderStatus.PREPARING && <button onClick={() => act(o.id, g.shopId, OrderStatus.READY)} className="rounded-lg bg-amber-100 text-amber-700 px-3 py-1.5 text-xs font-bold hover:bg-amber-200">{language === 'ar' ? 'جاهز' : 'Mark ready'}</button>}
                {canConfirmOrders && g && (g.status === OrderStatus.PENDING) && (
                  <>
                    <button onClick={() => act(o.id, g.shopId, OrderStatus.CONFIRMED)} className="flex items-center gap-1 rounded-lg bg-green-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-green-700"><Check size={12} /> {language === 'ar' ? 'قبول' : 'Accept'}</button>
                    <button onClick={() => act(o.id, g.shopId, OrderStatus.REJECTED)} className="flex items-center gap-1 rounded-lg bg-red-50 text-red-500 px-3 py-1.5 text-xs font-bold hover:bg-red-100"><X size={12} /> {language === 'ar' ? 'رفض' : 'Reject'}</button>
                  </>
                )}
                {!canConfirmOrders && !canUpdateOrders && (
                  <span className="text-xs text-gray-400 py-1">{language === 'ar' ? 'للمشاهدة فقط' : 'View only'}</span>
                )}
              </div>,
            ];
          })}
        />
      </div>
    </div>
  );
};

export default ShopOrders;