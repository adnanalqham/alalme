import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertTriangle, ShoppingCart, DollarSign, PlusCircle, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { productService, shopService, orderService, inventoryService } from '../../api';
import { Order, OrderStatus, PriceVisibility } from '../../types';
import { Badge, PageHeader, Stat } from '../../components/ui/Primitives';

const statusAr: Record<string, string> = { PENDING: 'قيد المراجعة', CONFIRMED: 'مؤكد', PREPARING: 'قيد التجهيز', READY: 'جاهز', COMPLETED: 'مكتمل', REJECTED: 'مرفوض', CANCELLED: 'ملغي' };

const ShopDashboard: React.FC = () => {
  const { language } = useLanguage();
  const { activeShopId, setActiveShop } = useAuth();

  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    try {
      setShop(shopService.myShop());
      const sid = shopService.myShop().id;
      setProducts(productService.listForShop(sid));
      setOrders(orderService.shopOrders({ shopId: sid }));
      setLowStock(inventoryService.lowStock(sid));
    } catch (err: any) {
      // not a managed shop
    }
  }, [tick, activeShopId]);

  const pendingOrders = orders.filter(o => o.shopGroups.some(g => g.status === OrderStatus.PENDING)).length;
  const revenue = orders
    .filter(o => o.shopGroups.some(g => g.status === OrderStatus.COMPLETED))
    .reduce((s, o) => s + o.shopGroups.filter(g => g.status === OrderStatus.COMPLETED).reduce((x, g) => x + g.subtotal, 0), 0);

  if (!shop) {
    return (
      <div className="p-10 text-center">
        <p className="text-primary font-semibold">{language === 'ar' ? 'لا يوجد محل مُدار لهذا الحساب' : 'No managed shop found for this account'}</p>
        <Link to="/shop/settings" className="inline-block mt-3 text-navy text-sm font-bold hover:underline">{language === 'ar' ? 'إعدادات المحل' : 'Shop settings'}</Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={language === 'ar' ? `لوحة ${shop.nameAr}` : `${shop.nameEn} Dashboard`}
        subtitle={language === 'ar' ? 'نظرة عامة على المحل' : 'Overview of your shop'}
        action={<Link to="/shop/products/new" className="rounded-xl bg-secondary text-primary px-4 py-2.5 text-sm font-bold hover:brightness-95 flex items-center gap-2"><PlusCircle size={15} /> {language === 'ar' ? 'قطعة جديدة' : 'New part'}</Link>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label={language === 'ar' ? 'المنتجات' : 'Products'} value={products.length} icon={<Package size={16} />} />
        <Stat label={language === 'ar' ? 'منخفض المخزون' : 'Low stock'} value={lowStock.length} icon={<AlertTriangle size={16} />} />
        <Stat label={language === 'ar' ? 'طلبات قيد المراجعة' : 'Pending orders'} value={pendingOrders} icon={<ShoppingCart size={16} />} />
        <Stat label={language === 'ar' ? 'الإيرادات (مكتملة)' : 'Revenue (completed)'} value={revenue.toLocaleString()} icon={<DollarSign size={16} />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-primary flex items-center gap-2"><TrendingUp size={15} /> {language === 'ar' ? 'آخر الطلبات' : 'Recent orders'}</h3>
            <Link to="/shop/orders" className="text-xs text-navy font-bold hover:underline">{language === 'ar' ? 'عرض الكل' : 'View all'}</Link>
          </div>
          {orders.length === 0 ? <p className="text-sm text-gray-400">{language === 'ar' ? 'لا توجد طلبات بعد' : 'No orders yet'}</p> : (
            <div className="divide-y divide-gray-50">
              {orders.slice(0, 5).map(o => {
                const g = o.shopGroups.find(x => x.shopId === shop.id);
                return (
                  <Link key={o.id} to={`/shop/orders?order=${o.id}`} className="flex items-center justify-between py-2.5 hover:bg-surface/60 -mx-2 px-2 rounded-lg">
                    <div>
                      <div className="text-sm font-bold text-primary">{o.id}</div>
                      <div className="text-xs text-gray-400">{o.items.length} {language === 'ar' ? 'أصناف' : 'items'} · {new Date(o.createdAt).toLocaleDateString(language === 'ar' ? 'ar' : 'en')}</div>
                    </div>
                    <div className="text-end">
                      <div className="text-sm font-extrabold text-primary">{g?.subtotal.toLocaleString()} {o.currency}</div>
                      <Badge tone={g?.status === OrderStatus.PENDING ? 'warning' : g?.status === OrderStatus.COMPLETED ? 'success' : 'info'}>{language === 'ar' ? statusAr[g?.status ?? ''] ?? g?.status : g?.status}</Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-primary flex items-center gap-2"><AlertTriangle size={15} /> {language === 'ar' ? 'تنبيه المخزون' : 'Low stock alerts'}</h3>
            <Link to="/shop/inventory" className="text-xs text-navy font-bold hover:underline">{language === 'ar' ? 'المخزون' : 'Inventory'}</Link>
          </div>
          {lowStock.length === 0 ? <p className="text-sm text-gray-400">{language === 'ar' ? 'كل القطع متوفرة' : 'All parts in stock'}</p> : (
            <div className="space-y-2">
              {lowStock.slice(0, 5).map(p => (
                <Link key={p.id} to={`/shop/products/${p.id}/edit`} className="flex items-center gap-3 border border-gray-50 rounded-xl p-2.5 hover:bg-surface/60">
                  <img src={p.imageUrl} className="w-10 h-10 rounded-lg object-cover" alt="" onError={e => { (e.target as HTMLElement).style.visibility = 'hidden'; }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-primary line-clamp-1">{language === 'ar' ? p.nameAr : p.nameEn}</div>
                    <div className="text-xs text-gray-400">{p.partNumber}</div>
                  </div>
                  <span className={`text-sm font-extrabold ${p.quantity <= 0 ? 'text-red-500' : 'text-amber-500'}`}>{p.quantity}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopDashboard;