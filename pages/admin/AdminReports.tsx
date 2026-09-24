import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line
} from 'recharts';
import {
  BarChart3, Calendar, Filter, Download, DollarSign, ShoppingCart, Users,
  Store, AlertTriangle, RefreshCw, ArrowUpRight, TrendingUp, Package, ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { adminApi } from '../../services/adminApi';

const COLORS = ['#010736', '#f59e0b', '#0ea5e9', '#10b981', '#8b5cf6', '#ec4899', '#f97316', '#64748b'];

const AdminReports: React.FC = () => {
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedShopId, setSelectedShopId] = useState('');
  const [shopsList, setShopsList] = useState<any[]>([]);

  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getReportsSummary({
        from: from || undefined,
        to: to || undefined,
        shop_id: selectedShopId || undefined,
      });
      setReportData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Also load shops list for filter
    adminApi.getShops().then(res => setShopsList(res.shops || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchReports();
  }, [from, to, selectedShopId]);

  const L = (en: string, ar: string) => (isRtl ? ar : en);

  const kpis = reportData?.kpis || {};
  const salesByPeriod = reportData?.sales_by_period || [];
  const ordersByStatus = reportData?.orders_by_status || [];
  const salesByShop = reportData?.sales_by_shop || [];
  const salesByCategory = reportData?.sales_by_category || [];
  const topProducts = reportData?.top_products || [];
  const paymentMethods = reportData?.payment_methods || [];
  const userGrowth = reportData?.user_growth || [];
  const newShops = reportData?.new_shops || [];
  const refundedOrders = reportData?.refunded_orders || [];
  const inventoryStats = reportData?.inventory_stats || {};

  return (
    <div className="space-y-6 text-slate-800">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#010736]/10 text-[#010736] rounded-xl border border-[#010736]/20">
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#010736] tracking-tight">
              {L('Reports & Financial Analytics', 'التقارير والإحصائيات المالية المعتمدة')}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {L(
                'Comprehensive PostgreSQL-aggregated marketplace intelligence, performance metrics, and sales charts.',
                'استعلامات تجميعية مباشرة من قاعدة بيانات PostgreSQL للرقابة المالية وتحليل أداء المتاجر والطلبات.'
              )}
            </p>
          </div>
        </div>

        <button
          onClick={fetchReports}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-[#010736] shadow-xs transition"
          title={L('Refresh', 'تحديث')}
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Real Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#010736]">{L('From:', 'من تاريخ:')}</span>
            <input
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#010736]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#010736]">{L('To:', 'إلى تاريخ:')}</span>
            <input
              type="date"
              value={to}
              onChange={e => setTo(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#010736]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#010736]">{L('Shop Filter:', 'المتجر:')}</span>
            <select
              value={selectedShopId}
              onChange={e => setSelectedShopId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#010736]"
            >
              <option value="">{L('All Shops', 'كافة المتاجر')}</option>
              {shopsList.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name_ar || s.name_en}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-500">
          {L('Active Filter Range:', 'نطاق البحث:')} <strong>{from}</strong> → <strong>{to}</strong>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="min-h-[45vh] flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-xs font-bold text-[#010736]">
            {L('Aggregating report data from PostgreSQL database...', 'جاري تجميع وحساب التقارير من قاعدة البيانات مباشرة...')}
          </p>
        </div>
      ) : error ? (
        <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center max-w-md mx-auto shadow-sm">
          <AlertTriangle size={32} className="text-rose-500 mx-auto mb-2" />
          <h3 className="font-bold text-[#010736] text-sm mb-1">{L('Failed to generate report', 'تعذر استخراج التقرير')}</h3>
          <p className="text-xs text-slate-500 mb-3">{error}</p>
          <button
            onClick={fetchReports}
            className="px-4 py-1.5 bg-[#010736] text-white rounded-xl text-xs font-bold"
          >
            {L('Retry', 'إعادة المحاولة')}
          </button>
        </div>
      ) : (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-bold text-slate-500 mb-1">{L('Period Revenue', 'إيرادات الفترة المحددة')}</div>
              <div className="text-2xl font-black text-[#010736] tracking-tight">
                ${(kpis.revenue ?? 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">{L('Paid Orders Only', 'الطلبات المسددة فقط')}</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-bold text-slate-500 mb-1">{L('Period Orders', 'عدد الطلبات في الفترة')}</div>
              <div className="text-2xl font-black text-[#010736] tracking-tight">
                {(kpis.orders_count ?? 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{L('All order statuses', 'كافة حالات الطلبات')}</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-bold text-slate-500 mb-1">{L('Estimated Commission', 'عمولات المنصة التقديرية')}</div>
              <div className="text-2xl font-black text-amber-600 tracking-tight">
                ${(kpis.commissions ?? 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">{L('5% Marketplace Rate', 'بمعدل 5% القياسي')}</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-bold text-slate-500 mb-1">{L('New User Registrations', 'المستخدمون الجدد')}</div>
              <div className="text-2xl font-black text-emerald-600 tracking-tight">
                +{(kpis.new_users ?? 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{L('Signed up in range', 'سجلوا خلال هذا النطاق')}</div>
            </div>
          </div>

          {/* Report 1: Sales & Revenue Over Time */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="font-bold text-[#010736] text-base mb-4 flex items-center gap-2">
              <TrendingUp size={18} />
              <span>{L('Sales & Revenue by Period (Daily Breakdown)', 'المبيعات والإيرادات حسب الفترة')}</span>
            </h3>

            {salesByPeriod.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {L('No completed sales recorded during this selected date range.', 'لا توجد مبيعات مكتملة في نطاق التاريخ المحدد.')}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={salesByPeriod}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#010736" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#010736" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#010736" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" name={L('Revenue ($)', 'الإيراد ($)')} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Report 2: Sales by Shop & Sales by Category */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales by Shop */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h3 className="font-bold text-[#010736] text-sm mb-3 flex items-center gap-2">
                <Store size={16} />
                <span>{L('Sales by Shop (Merchant Volume)', 'المبيعات حسب المتجر')}</span>
              </h3>

              {salesByShop.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">{L('No shop sales in this period.', 'لا توجد مبيعات متاجر في هذه الفترة.')}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-start text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500">
                        <th className="py-2 text-start font-bold">{L('Shop Name', 'اسم المتجر')}</th>
                        <th className="py-2 text-start font-bold">{L('Orders', 'الطلبات')}</th>
                        <th className="py-2 text-start font-bold">{L('Revenue', 'الإيراد')}</th>
                        <th className="py-2 text-start font-bold">{L('Est. Commission', 'العمولة')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {salesByShop.map((s: any) => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="py-2.5 font-semibold text-[#010736]">{s.name_ar || s.name_en}</td>
                          <td className="py-2.5 font-mono">{s.orders_count}</td>
                          <td className="py-2.5 font-mono font-bold text-slate-900">${Number(s.total_revenue).toLocaleString()}</td>
                          <td className="py-2.5 font-mono font-bold text-amber-700">${Number(s.estimated_commission).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Sales by Category */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h3 className="font-bold text-[#010736] text-sm mb-3 flex items-center gap-2">
                <Package size={16} />
                <span>{L('Sales by Category', 'المبيعات حسب فئة القطع')}</span>
              </h3>

              {salesByCategory.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">{L('No category sales in this period.', 'لا توجد مبيعات حسب الفئات.')}</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={salesByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="category_name" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px' }} />
                    <Bar dataKey="total_amount" fill="#010736" radius={[6, 6, 0, 0]} name={L('Amount ($)', 'المبلغ ($)')} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Report 3: Top Selling Products & Payment Methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top-Selling Products */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h3 className="font-bold text-[#010736] text-sm mb-3 flex items-center gap-2">
                <Package size={16} />
                <span>{L('Top-Selling Spare Parts', 'أكثر المنتجات مبيعاً')}</span>
              </h3>

              {topProducts.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">{L('No product sales data in range.', 'لا توجد مبيعات قطع مسجلة.')}</div>
              ) : (
                <div className="space-y-2">
                  {topProducts.map((p: any) => (
                    <div key={p.product_id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div>
                        <div className="font-bold text-[#010736]">{p.product_name_ar || p.product_name_en}</div>
                        <div className="text-[10px] text-slate-500 font-mono">PN: {p.part_number || '—'}</div>
                      </div>
                      <div className="text-end">
                        <div className="font-bold text-amber-700">{p.total_sold} {L('units', 'قطعة')}</div>
                        <div className="font-mono text-slate-500">${Number(p.revenue).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Methods */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h3 className="font-bold text-[#010736] text-sm mb-3 flex items-center gap-2">
                <DollarSign size={16} />
                <span>{L('Payment Methods Breakdown', 'طرق الدفع المستخدمة')}</span>
              </h3>

              {paymentMethods.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">{L('No payment data in range.', 'لا توجد بيانات مدفوعات.')}</div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie data={paymentMethods} dataKey="count" nameKey="payment_method" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                        {paymentMethods.map((_: any, i: number) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="flex-1 space-y-2 w-full">
                    {paymentMethods.map((m: any, i: number) => (
                      <div key={m.payment_method} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="font-semibold text-slate-700">{m.payment_method}</span>
                        </div>
                        <div className="text-end font-mono">
                          <strong className="text-slate-900">{m.count}</strong> (${Number(m.amount).toLocaleString()})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Report 4: User Growth, Refunds, and Inventory Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Growth */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
              <h4 className="font-bold text-[#010736] text-xs flex items-center gap-1.5">
                <Users size={14} />
                <span>{L('User Growth in Period', 'نمو المستخدمين')}</span>
              </h4>
              <div className="text-2xl font-black text-[#010736]">+{userGrowth.reduce((acc: number, cur: any) => acc + Number(cur.count), 0)}</div>
              <p className="text-[11px] text-slate-500">{L('New customers & mechanics', 'عملاء وفنيون جدد')}</p>
            </div>

            {/* Refunds & Returns */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
              <h4 className="font-bold text-[#010736] text-xs flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-rose-600" />
                <span>{L('Refunds & Returns', 'المرتجعات والاستردادات')}</span>
              </h4>
              <div className="text-2xl font-black text-rose-600">{refundedOrders.length}</div>
              <p className="text-[11px] text-slate-500">
                ${refundedOrders.reduce((acc: number, cur: any) => acc + Number(cur.total), 0).toLocaleString()} {L('total refunded', 'إجمالي مسترد')}
              </p>
            </div>

            {/* Inventory Valuation & Health */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
              <h4 className="font-bold text-[#010736] text-xs flex items-center gap-1.5">
                <Package size={14} className="text-amber-600" />
                <span>{L('Inventory Global Status', 'حالة المخزون المركزي')}</span>
              </h4>
              <div className="text-2xl font-black text-[#010736]">{inventoryStats.total_units ?? 0} <span className="text-xs font-normal text-slate-400">{L('units', 'قطعة')}</span></div>
              <div className="text-[11px] text-slate-500 flex gap-2">
                <span className="text-amber-700 font-bold">{inventoryStats.low_stock_count ?? 0} {L('low stock', 'منخفض')}</span>
                <span>•</span>
                <span className="text-rose-700 font-bold">{inventoryStats.out_of_stock_count ?? 0} {L('out of stock', 'نفد')}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReports;