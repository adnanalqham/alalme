import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { reportService, shopService, orderService } from '../../api';
import { OrderStatus } from '../../types';
import { PageHeader, Stat } from '../../components/ui/Primitives';

const COLORS = ['#010736', '#22396F', '#FCF1D0', '#7c95d6', '#f0b429'];

const ShopReports: React.FC = () => {
  const { language } = useLanguage();
  const [summary, setSummary] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [range, setRange] = useState<'7' | '30' | '90' | 'all'>('30');

  useEffect(() => {
    try {
      const shop = shopService.myShop();
      setOrders(orderService.shopOrders({ shopId: shop.id }));
      const from = new Date(); from.setDate(from.getDate() - Number(range === 'all' ? 3650 : range));
      setSummary(reportService.summary({ from: from.toISOString().slice(0, 10) }));
    } catch { /* */ }
  }, [range]);

  const byMonth = new Map<string, number>();
  const byStatus = new Map<string, number>();
  for (const o of orders) {
    const g = o.shopGroups?.[0];
    const key = o.createdAt.slice(0, 7);
    byMonth.set(key, (byMonth.get(key) ?? 0) + (g?.subtotal ?? 0));
    byStatus.set(g?.status ?? 'PENDING', (byStatus.get(g?.status ?? 'PENDING') ?? 0) + 1);
  }
  const salesData = [...byMonth.entries()].sort().map(([month, value]) => ({ month, value }));
  const statusData = [...byStatus.entries()].map(([name, value]) => ({ name, value }));

  const completed = orders.flatMap(o => o.shopGroups).filter((g: any) => g.status === OrderStatus.COMPLETED);
  const revenue = completed.reduce((s, g: any) => s + g.subtotal, 0);
  const commissions = completed.reduce((s, g: any) => s + (g.commissionAmount ?? 0), 0);

  return (
    <div>
      <PageHeader
        title={language === 'ar' ? 'التقارير' : 'Reports'}
        subtitle={language === 'ar' ? 'أداء المبيعات والطلبات' : 'Sales and order performance'}
        action={
          <div className="flex gap-2">
            {(['7', '30', '90', 'all'] as const).map(r => (
              <button key={r} onClick={() => setRange(r)} className={`px-3 py-2 rounded-xl text-xs font-bold transition ${range === r ? 'bg-primary text-white' : 'bg-white border border-gray-100 text-primary'}`}>
                {r === 'all' ? (language === 'ar' ? 'الكل' : 'All') : r + 'd'}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label={language === 'ar' ? 'الطلبات' : 'Orders'} value={orders.length} icon={<ShoppingCart size={16} />} />
        <Stat label={language === 'ar' ? 'مكتملة' : 'Completed'} value={completed.length} icon={<TrendingUp size={16} />} />
        <Stat label={language === 'ar' ? 'الإيرادات' : 'Revenue'} value={revenue.toLocaleString()} icon={<DollarSign size={16} />} />
        <Stat label={language === 'ar' ? 'العمولات' : 'Commissions'} value={commissions.toLocaleString()} icon={<TrendingUp size={16} />} />
      </div>

      {summary?.popularVehicles?.length ? (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 mb-6">
          <h3 className="font-bold text-primary mb-4">{language === 'ar' ? 'أكثر المركبات توافقاً' : 'Top compatible vehicles'}</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {summary.popularVehicles.slice(0, 8).map((v: any) => (
              <div key={v.label} className="flex items-center justify-between border border-gray-50 rounded-xl px-3 py-2">
                <span className="text-sm text-primary">{v.label}</span>
                <span className="text-xs font-bold text-navy">{v.count} {language === 'ar' ? 'قطعة' : 'parts'}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
          <h3 className="font-bold text-primary mb-4">{language === 'ar' ? 'المبيعات الشهرية' : 'Monthly sales'}</h3>
          {salesData.length === 0 ? <p className="text-sm text-gray-400">{language === 'ar' ? 'لا بيانات بعد' : 'No data yet'}</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8a8a8a' }} />
                <YAxis tick={{ fontSize: 11, fill: '#8a8a8a' }} />
                <Tooltip />
                <Bar dataKey="value" fill="#010736" radius={[6, 6, 0, 0]} name={language === 'ar' ? 'الإيراد' : 'Revenue'} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
          <h3 className="font-bold text-primary mb-4">{language === 'ar' ? 'حالات الطلبات' : 'Orders by status'}</h3>
          {statusData.length === 0 ? <p className="text-sm text-gray-400">{language === 'ar' ? 'لا بيانات بعد' : 'No data yet'}</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopReports;