import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Circle, Truck, Store, Package, MapPin, CreditCard, ArrowRight, Ban } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { orderService, paymentService } from '../api';
import { Order, OrderStatus, PaymentStatus, DeliveryType } from '../types';
import { Badge, EmptyState } from '../components/ui/Primitives';

const STEP_LABELS_EN = ['Ordered', 'Confirmed', 'Preparing', 'Ready', 'Completed'];
const STEP_LABELS_AR = ['تم الطلب', 'مؤكد', 'قيد التجهيز', 'جاهز', 'مكتمل'];

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    try { setOrder(orderService.getMine(id)); } catch (err: any) { setError(err?.message ?? 'Error'); }
  }, [id]);

  const payments = useMemo(() => {
    if (!order) return [];
    try { return paymentService.forOrder(order.id); } catch { return []; }
  }, [order]);

  if (error) return <EmptyState title={error} icon={<Ban size={30} />} />;
  if (!order) return <EmptyState title={t('loading')} icon={<Package size={30} />} />;

  const statusIdx = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.COMPLETED].indexOf(order.status);

  const cancel = () => {
    try {
      orderService.cancelMine(order.id);
      setOrder({ ...order, status: OrderStatus.CANCELLED });
      toast(t('orderCancelled'), { kind: 'success' });
    } catch (err: any) {
      toast(err?.message, { kind: 'error' });
    }
  };

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <h1 className="text-2xl font-extrabold text-primary">{order.id}</h1>
          <div className="flex gap-2">
            <Badge tone="info">{t('total')}: {order.total.toLocaleString()} {order.currency}</Badge>
            {(order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED) && (
              <button onClick={cancel} className="rounded-lg border border-red-100 bg-white text-red-500 px-4 py-2 text-xs font-bold hover:bg-red-50">
                {t('cancelOrder')}
              </button>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <div className="flex items-center">
            {STEP_LABELS_EN.map((label, i) => {
              const done = order.status === OrderStatus.REJECTED || order.status === OrderStatus.CANCELLED
                ? i === 0 : i <= Math.max(0, statusIdx);
              const cancelled = order.status === OrderStatus.REJECTED || order.status === OrderStatus.CANCELLED;
              return (
                <React.Fragment key={label}>
                  {i > 0 && <div className={`flex-1 h-0.5 rounded ${cancelled && i === 1 ? 'bg-red-100' : done && i <= statusIdx ? 'bg-green-500' : 'bg-gray-100'}`} /> }
                  <div className="flex flex-col items-center gap-1 px-1">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center ${cancelled && i === 0 ? 'bg-red-100 text-red-500' : done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {done || (cancelled && i === 0) ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-500">{language === 'ar' ? STEP_LABELS_AR[i] : label}</span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
          {order.status === OrderStatus.REJECTED && <p className="text-sm text-red-500 mt-4 font-semibold">{t('orderRejected')}</p>}
        </div>

        {/* Groups */}
        {order.shopGroups.map(g => {
          const groupStatus = g.status;
          return (
            <div key={g.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-primary flex items-center gap-2"><Store size={14} /> {language === 'ar' ? g.shopNameAr : g.shopNameEn}</span>
                <Badge tone={groupStatus === OrderStatus.COMPLETED ? 'success' : groupStatus === OrderStatus.PENDING ? 'warning' : groupStatus === OrderStatus.REJECTED || groupStatus === OrderStatus.CANCELLED ? 'danger' : 'info'}>
                  {language === 'ar' ? ({
                    PENDING: 'قيد المراجعة', CONFIRMED: 'مؤكد', PREPARING: 'قيد التجهيز', READY: 'جاهز',
                    COMPLETED: 'مكتمل', REJECTED: 'مرفوض', CANCELLED: 'ملغي',
                  } as any)[groupStatus] : (groupStatus as string)}
                </Badge>
              </div>
              {order.items.filter(i => i.shopId === g.shopId).map(oi => (
                <div key={oi.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-primary">{language === 'ar' ? oi.partNameAr : oi.partNameEn}</div>
                    <div className="text-xs text-gray-400">{t('qty')}: {oi.quantity}</div>
                  </div>
                  <span className="text-sm font-bold text-primary">{oi.unitPrice ? oi.unitPrice.toLocaleString() : t('contactPrice')} {oi.currency}</span>
                </div>
              ))}
              {groupStatus === OrderStatus.COMPLETED && g.commissionAmount != null && (
                <div className="text-[10px] text-gray-400 mt-2">{t('commission')}: {g.commissionAmount}</div>
              )}
            </div>
          );
        })}

        {/* Delivery + payment */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2"><Truck size={14} /> {t('delivery')}</h3>
            <p className="text-sm text-gray-500">{language === 'ar'
              ? ({ PICKUP: 'استلام من المحل', SHOP_DELIVERY: 'توصيل من المحل', DELIVERY_COMPANY: 'توصيل شركة شحن' } as any)[order.deliveryType]
              : (order.deliveryType as string).replace('_', ' ')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('deliveryFee')}: {order.deliveryFee.toLocaleString()} {order.currency}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2"><CreditCard size={14} /> {t('paymentMethod')}</h3>
            <p className="text-sm text-gray-500">{order.paymentMethod.replace('_', ' ')}</p>
            {payments.map(p => (
              <p key={p.id} className="text-xs text-gray-400 mt-1">
                {t('status')}: {p.status === PaymentStatus.PAID ? '✓ ' + t('paid') : p.status === PaymentStatus.REFUNDED ? t('refunded') : t('pendingPayment')} · {p.amount.toLocaleString()} {p.currency}
              </p>
            ))}
          </div>
        </div>

        <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-navy font-semibold hover:underline">
          <ArrowRight size={14} className="rtl:rotate-180" /> {t('allOrders')}
        </Link>
      </div>
    </div>
  );
};

export default OrderDetail;