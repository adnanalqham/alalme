import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Store, Package, ShoppingCart, DollarSign, CreditCard, Warehouse,
  Star, MessageSquareWarning, TrendingUp, AlertTriangle, CheckCircle2,
  Clock, ArrowUpRight, ArrowDownRight, RefreshCw, ChevronLeft, ChevronRight,
  ShieldCheck, Eye, ExternalLink, Calendar
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { useLanguage } from '../../context/LanguageContext';
import { adminApi } from '../../services/adminApi';

const AdminDashboard: React.FC = () => {
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodDays, setPeriodDays] = useState<number>(30);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getDashboard({ days: periodDays });
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data from backend API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [periodDays]);

  const L = (en: string, ar: string) => (isRtl ? ar : en);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-[#010736]">
          {L('Loading real dashboard statistics from PostgreSQL...', 'جاري تحميل الإحصائيات الحقيقية من قاعدة بيانات PostgreSQL...')}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-sm">
        <AlertTriangle size={36} className="text-rose-500 mx-auto mb-3" />
        <h3 className="font-bold text-[#010736] text-base mb-1">{L('Failed to load dashboard', 'تعذر تحميل بيانات لوحة التحكم')}</h3>
        <p className="text-xs text-slate-500 mb-4">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-[#010736] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow"
        >
          {L('Retry Connection', 'إعادة المحاولة')}
        </button>
      </div>
    );
  }

  const {
    users = {},
    shops = {},
    products = {},
    orders = {},
    sales = {},
    payments = {},
    inventory = {},
    reviews_complaints = {},
    recent = {},
    charts = {},
    period = {},
  } = data || {};

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Banner & Period Selector */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#010736] tracking-tight">
              {L('ALA Platform Control Center', 'لوحة تحكم منصة آلا المركزية')}
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
              Live PostgreSQL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {L(
              'Real-time automotive spare parts marketplace transactions, inventory, and access metrics.',
              'بيانات وإحصائيات مباشرة من قاعدة البيانات لكافة عمليات سوق قطع غيار السيارات والمخزون.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs">
            <Calendar size={14} className="text-slate-500 mx-1" />
            {[
              { days: 7, label: L('7 Days', '7 أيام') },
              { days: 30, label: L('30 Days', '30 يوماً') },
              { days: 90, label: L('90 Days', '3 أشهر') },
              { days: 365, label: L('1 Year', 'سنة') },
            ].map(p => (
              <button
                key={p.days}
                onClick={() => setPeriodDays(p.days)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  periodDays === p.days
                    ? 'bg-[#010736] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#010736] hover:bg-slate-200/60'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchDashboardData}
            title={L('Refresh Data', 'تحديث البيانات')}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-[#010736] shadow-xs transition"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* 1. Core KPIs Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales KPI */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 mb-1">{L('Total Revenue', 'إجمالي المبيعات')}</div>
            <div className="text-2xl font-black text-[#010736] tracking-tight">
              ${(sales.total_sales ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px]">
              <span className="text-slate-500">{L('Period:', 'خلال الفترة:')}</span>
              <strong className="text-emerald-700">${(sales.period_sales ?? 0).toLocaleString()}</strong>
              {sales.growth_rate !== undefined && (
                <span className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                  <ArrowUpRight size={12} />
                  {sales.growth_rate}%
                </span>
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
            <DollarSign size={22} />
          </div>
        </div>

        {/* Orders KPI */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 mb-1">{L('Total Orders', 'إجمالي الطلبات')}</div>
            <div className="text-2xl font-black text-[#010736] tracking-tight">
              {(orders.total ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
              <span className="text-amber-700 font-bold">{orders.pending ?? 0} {L('new', 'جديد')}</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">{orders.completed ?? 0} {L('done', 'مكتمل')}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#010736]/10 text-[#010736] flex items-center justify-center border border-[#010736]/20">
            <ShoppingCart size={22} />
          </div>
        </div>

        {/* Shops KPI */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 mb-1">{L('Merchant Shops', 'المتاجر والمحلات')}</div>
            <div className="text-2xl font-black text-[#010736] tracking-tight">
              {(shops.total ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
              <span className="text-emerald-700 font-bold">{shops.active ?? 0} {L('active', 'نشط')}</span>
              <span>•</span>
              <span className="text-amber-700 font-bold">{shops.pending ?? 0} {L('pending', 'معلق')}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center border border-sky-500/20">
            <Store size={22} />
          </div>
        </div>

        {/* Users KPI */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 mb-1">{L('Total Users', 'إجمالي المستخدمين')}</div>
            <div className="text-2xl font-black text-[#010736] tracking-tight">
              {(users.total ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
              <span className="text-emerald-700 font-bold">+{users.new ?? 0} {L('new in period', 'جديد بالفترة')}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center border border-purple-500/20">
            <Users size={22} />
          </div>
        </div>
      </div>

      {/* 2. Detailed Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Section 1: Users Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-[#010736]" />
              <h3 className="font-bold text-[#010736] text-sm">{L('1. Users Breakdown', '1. المستخدمون والأدوار')}</h3>
            </div>
            <Link to="/admin/users" className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1">
              <span>{L('Manage', 'إدارة')}</span>
              {isRtl ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="text-[10px] text-slate-500">{L('Total Users', 'الإجمالي')}</div>
              <div className="text-base font-extrabold text-[#010736]">{users.total ?? 0}</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="text-[10px] text-slate-500">{L('New in Period', 'المستخدمون الجدد')}</div>
              <div className="text-base font-extrabold text-emerald-600">+{users.new ?? 0}</div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase">{L('By Role', 'توزيع الأدوار')}</div>
            {Object.entries(users.by_role || {}).map(([role, cnt]) => (
              <div key={role} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="font-mono text-[11px] font-semibold text-slate-700">{role}</span>
                <span className="font-bold text-[#010736]">{cnt as number}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Shops Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Store size={16} className="text-[#010736]" />
              <h3 className="font-bold text-[#010736] text-sm">{L('2. Shops Status', '2. المتاجر والمحلات')}</h3>
            </div>
            <Link to="/admin/shops" className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1">
              <span>{L('Manage', 'إدارة')}</span>
              {isRtl ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">{L('Total Shops', 'إجمالي المتاجر المسجلة')}</span>
              <strong className="text-[#010736] font-mono text-sm">{shops.total ?? 0}</strong>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-emerald-800 font-semibold">{L('Active / Approved', 'المتاجر المعتمدة والنشطة')}</span>
              <strong className="text-emerald-700 font-mono text-sm">{shops.active ?? 0}</strong>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/70 border border-amber-100">
              <span className="text-amber-800 font-semibold">{L('Pending Approval', 'طلبات معلقة')}</span>
              <strong className="text-amber-700 font-mono text-sm">{shops.pending ?? 0}</strong>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">{L('New Submissions in Period', 'طلبات جديدة بالفترة')}</span>
              <strong className="text-slate-800 font-mono text-sm">+{shops.new_requests ?? 0}</strong>
            </div>
          </div>

          {(shops.pending ?? 0) > 0 && (
            <Link
              to="/admin/shops/approvals"
              className="block text-center py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-xs"
            >
              {L(`Review ${shops.pending} Pending Shops`, `مراجعة ${shops.pending} طلبات انضمام جديدة`)}
            </Link>
          )}
        </div>

        {/* Section 3: Products & Catalog */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-[#010736]" />
              <h3 className="font-bold text-[#010736] text-sm">{L('3. Products & Parts', '3. المنتجات والقطع')}</h3>
            </div>
            <Link to="/admin/catalog/products" className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1">
              <span>{L('Catalog', 'الكتالوج')}</span>
              {isRtl ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">{L('Total Products', 'إجمالي المنتجات')}</span>
              <strong className="text-[#010736] font-mono text-sm">{products.total ?? 0}</strong>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-emerald-800">{L('Published / Active', 'المنتجات المنشورة')}</span>
              <strong className="text-emerald-700 font-mono text-sm">{products.published ?? 0}</strong>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">{L('Inactive / Hidden', 'غير النشطة / المعطلة')}</span>
              <strong className="text-slate-700 font-mono text-sm">{products.inactive ?? 0}</strong>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50/70 border border-rose-100">
              <span className="text-rose-800 font-semibold">{L('Low Stock Alert', 'منتجات منخفضة المخزون')}</span>
              <strong className="text-rose-700 font-mono text-sm">{products.low_stock ?? 0}</strong>
            </div>
          </div>
        </div>

        {/* Section 4: Orders Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart size={16} className="text-[#010736]" />
              <h3 className="font-bold text-[#010736] text-sm">{L('4. Orders Pipeline', '4. دورة معالجة الطلبات')}</h3>
            </div>
            <Link to="/admin/orders" className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1">
              <span>{L('All Orders', 'كافة الطلبات')}</span>
              {isRtl ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
              <div className="text-[10px] text-amber-700">{L('New / Pending', 'طلبات جديدة')}</div>
              <div className="text-base font-extrabold text-amber-800">{orders.new ?? 0}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100">
              <div className="text-[10px] text-sky-700">{L('In Processing', 'قيد المعالجة')}</div>
              <div className="text-base font-extrabold text-sky-800">{orders.processing ?? 0}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <div className="text-[10px] text-emerald-700">{L('Completed', 'مكتملة')}</div>
              <div className="text-base font-extrabold text-emerald-800">{orders.completed ?? 0}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100">
              <div className="text-[10px] text-rose-700">{L('Cancelled', 'ملغاة')}</div>
              <div className="text-base font-extrabold text-rose-800">{orders.cancelled ?? 0}</div>
            </div>
          </div>
        </div>

        {/* Section 5: Payments Overview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-[#010736]" />
              <h3 className="font-bold text-[#010736] text-sm">{L('5. Payments Status', '5. المدفوعات والتحصيل')}</h3>
            </div>
            <Link to="/admin/payments" className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1">
              <span>{L('Details', 'التفاصيل')}</span>
              {isRtl ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-emerald-800 font-semibold">{L('Paid Total', 'إجمالي المدفوع')}</span>
              <strong className="text-emerald-700 font-mono text-sm">${(payments.paid ?? 0).toLocaleString()}</strong>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/70 border border-amber-100">
              <span className="text-amber-800 font-semibold">{L('Pending Settlement', 'مبالغ معلقة')}</span>
              <strong className="text-amber-700 font-mono text-sm">${(payments.pending ?? 0).toLocaleString()}</strong>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50/70 border border-rose-100">
              <span className="text-rose-800 font-semibold">{L('Refunded', 'المسترد')}</span>
              <strong className="text-rose-700 font-mono text-sm">${(payments.refunded ?? 0).toLocaleString()}</strong>
            </div>
          </div>

          <div className="pt-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">{L('Payment Methods', 'طرق الدفع')}</div>
            <div className="flex flex-wrap gap-1">
              {(payments.by_method || []).map((m: any) => (
                <span key={m.payment_method} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200">
                  {m.payment_method}: <strong>{m.count}</strong> (${Number(m.amount).toLocaleString()})
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Section 6: Inventory Status & Section 7: Reviews & Complaints */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Warehouse size={16} className="text-[#010736]" />
              <h3 className="font-bold text-[#010736] text-sm">{L('6. Inventory & Feedback', '6. المخزون والتقييمات')}</h3>
            </div>
            <Link to="/admin/inventory" className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1">
              <span>{L('Inventory', 'المخزون')}</span>
              {isRtl ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
              <div className="text-[10px] text-amber-700">{L('Low Stock Items', 'مخزون منخفض')}</div>
              <div className="text-base font-extrabold text-amber-800">{inventory.low_stock_count ?? 0}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100">
              <div className="text-[10px] text-rose-700">{L('Out of Stock', 'نفد المخزون')}</div>
              <div className="text-base font-extrabold text-rose-800">{inventory.out_of_stock_count ?? 0}</div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600 flex items-center gap-1">
                <Star size={13} className="text-amber-500 fill-amber-500" />
                {L('Avg Rating', 'متوسط التقييم')}
              </span>
              <strong className="text-[#010736] font-bold">
                {reviews_complaints.average_rating ?? 0} / 5 ({reviews_complaints.reviews_count ?? 0})
              </strong>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-600 flex items-center gap-1">
                <MessageSquareWarning size={13} className="text-rose-500" />
                {L('Open Complaints', 'شكاوى مفتوحة')}
              </span>
              <strong className="text-rose-600 font-bold">{reviews_complaints.complaints_open ?? 0}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Monthly Sales Analytics Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-[#010736]" />
            <h3 className="font-bold text-[#010736] text-base">{L('Sales Trend (Past 12 Months)', 'حركة المبيعات الشهرية الحقيقية')}</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Aggregation: PostgreSQL</span>
        </div>

        {(charts.monthly_sales || []).length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            {L('No sales data recorded yet in this timeline.', 'لا توجد بيانات مبيعات مسجلة في هذا النطاق.')}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={charts.monthly_sales}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#010736" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#010736" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#010736" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" name={L('Revenue ($)', 'الإيراد ($)')} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 4. Section 9: Recent Data Tables (Latest Records) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Orders */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h3 className="font-bold text-[#010736] text-sm">{L('Latest Orders', 'آخر الطلبات الواردة')}</h3>
            <Link to="/admin/orders" className="text-xs text-amber-600 font-bold hover:underline">
              {L('View All', 'عرض الكل')}
            </Link>
          </div>

          {(recent.orders || []).length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">{L('No recent orders.', 'لا توجد طلبات حديثة.')}</div>
          ) : (
            <div className="space-y-2">
              {recent.orders.map((ord: any) => (
                <div key={ord.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <div className="font-bold text-[#010736]">{ord.order_number}</div>
                    <div className="text-[11px] text-slate-500">{ord.customer_name || 'Customer'}</div>
                  </div>
                  <div className="text-end">
                    <div className="font-mono font-bold text-slate-900">${ord.total}</div>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Latest Products */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h3 className="font-bold text-[#010736] text-sm">{L('Latest Products', 'آخر المنتجات المضافة')}</h3>
            <Link to="/admin/catalog/products" className="text-xs text-amber-600 font-bold hover:underline">
              {L('View Catalog', 'الكتالوج')}
            </Link>
          </div>

          {(recent.products || []).length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">{L('No recent products.', 'لا توجد منتجات حديثة.')}</div>
          ) : (
            <div className="space-y-2">
              {recent.products.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-[#010736] truncate">{p.name_ar || p.name_en}</div>
                    <div className="text-[11px] text-slate-500 font-mono">PN: {p.part_number || '—'}</div>
                  </div>
                  <div className="text-end shrink-0">
                    <div className="font-mono font-bold text-slate-900">${p.price}</div>
                    <span className="text-[10px] text-slate-500">{p.shop_name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Latest Users */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h3 className="font-bold text-[#010736] text-sm">{L('Latest Users Registered', 'آخر المستخدمين المنضمين')}</h3>
            <Link to="/admin/users" className="text-xs text-amber-600 font-bold hover:underline">
              {L('View All', 'عرض الكل')}
            </Link>
          </div>

          {(recent.users || []).length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">{L('No recent users.', 'لا يوجد مستخدمون.')}</div>
          ) : (
            <div className="space-y-2">
              {recent.users.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <div className="font-bold text-[#010736]">{u.full_name || u.email}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md font-semibold">
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Latest Admin Activity / Audit Logs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h3 className="font-bold text-[#010736] text-sm">{L('Latest Administrative Activities', 'آخر الأنشطة والتدقيق الإداري')}</h3>
            <Link to="/admin/audit" className="text-xs text-amber-600 font-bold hover:underline">
              {L('Audit Log', 'سجل التدقيق')}
            </Link>
          </div>

          {(recent.audit_logs || []).length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">{L('No recent audit logs.', 'لا يوجد سجلات تدقيق حديثة.')}</div>
          ) : (
            <div className="space-y-2">
              {recent.audit_logs.map((log: any) => (
                <div key={log.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <div className="font-mono text-amber-700 font-bold">{log.action}</div>
                    <div className="text-[11px] text-slate-500">{log.entity_type} #{log.entity_id}</div>
                  </div>
                  <div className="text-end">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;