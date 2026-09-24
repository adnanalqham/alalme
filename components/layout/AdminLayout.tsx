import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Store, Users, ShoppingCart, CreditCard, Star, MessageSquareWarning, Megaphone,
  Image, BarChart3, ShieldCheck, Settings2, LayoutDashboard, LogOut, Menu, X,
  ExternalLink, ChevronDown, ChevronRight, CheckCircle2, UserCheck, Layers,
  KeyRound, Grid, ShieldAlert, Package, Tags, Factory, Car, Percent, Globe,
  Warehouse, Ticket
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Logo from '../brand/Logo';

interface NavItem {
  to: string;
  labelEn: string;
  labelAr: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface NavGroup {
  labelEn: string;
  labelAr: string;
  icon: React.ReactNode;
  items: NavItem[];
}

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Group accordion state
  const isAccessControlActive = location.pathname.startsWith('/admin/access');
  const isCatalogActive = location.pathname.startsWith('/admin/catalog') || location.pathname.startsWith('/admin/products');
  const isOrdersActive = location.pathname.startsWith('/admin/orders');
  const isGeographyActive = location.pathname.startsWith('/admin/geography');

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    access: isAccessControlActive,
    catalog: isCatalogActive,
    orders: isOrdersActive,
    geography: isGeographyActive,
  });

  const toggleGroup = (key: string) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const onLogout = async () => {
    await logout();
    navigate('/');
  };

  const singleItemsTop: NavItem[] = [
    { to: '/admin', labelEn: 'Dashboard', labelAr: 'لوحة التحكم', icon: <LayoutDashboard size={18} /> },
    { to: '/admin/users', labelEn: 'Users', labelAr: 'المستخدمون', icon: <Users size={18} /> },
    { to: '/admin/shops', labelEn: 'Shops', labelAr: 'المحلات والمتاجر', icon: <Store size={18} /> },
    { to: '/admin/shops/approvals', labelEn: 'Shop Approvals', labelAr: 'طلبات الانضمام', icon: <CheckCircle2 size={18} /> },
    { to: '/admin/employees', labelEn: 'Employees', labelAr: 'موظفو المنصة والمتاجر', icon: <UserCheck size={18} /> },
  ];

  const accessControlGroup: NavGroup = {
    labelEn: 'Access Control',
    labelAr: 'التحكم في الوصول والصلاحيات',
    icon: <ShieldCheck size={18} />,
    items: [
      { to: '/admin/access/roles', labelEn: 'Roles', labelAr: 'إدارة الأدوار', icon: <Layers size={16} /> },
      { to: '/admin/access/permissions', labelEn: 'Permissions', labelAr: 'دليل الصلاحيات', icon: <KeyRound size={16} /> },
      { to: '/admin/access/matrix', labelEn: 'Role Matrix', labelAr: 'مصفوفة الصلاحيات', icon: <Grid size={16} /> },
      { to: '/admin/access/users', labelEn: 'User Access', labelAr: 'استثناءات وصول المستخدمين', icon: <ShieldAlert size={16} /> },
    ],
  };

  const catalogGroup: NavGroup = {
    labelEn: 'Catalog',
    labelAr: 'الكتالوج وقطع الغيار',
    icon: <Package size={18} />,
    items: [
      { to: '/admin/catalog/products', labelEn: 'Products', labelAr: 'المنتجات وقطع الغيار', icon: <Package size={16} /> },
      { to: '/admin/catalog/categories', labelEn: 'Categories', labelAr: 'أقسام الكتالوج', icon: <Tags size={16} /> },
      { to: '/admin/catalog/manufacturers', labelEn: 'Manufacturers', labelAr: 'المصنعون والموردون', icon: <Factory size={16} /> },
      { to: '/admin/catalog/vehicles', labelEn: 'Vehicle Compatibility', labelAr: 'توافق السيارات', icon: <Car size={16} /> },
    ],
  };

  const ordersGroup: NavGroup = {
    labelEn: 'Orders',
    labelAr: 'إدارة الطلبات',
    icon: <ShoppingCart size={18} />,
    items: [
      { to: '/admin/orders', labelEn: 'All Orders', labelAr: 'كافة الطلبات', icon: <ShoppingCart size={16} /> },
      { to: '/admin/orders?status=PENDING', labelEn: 'Pending', labelAr: 'قيد الانتظار', icon: <ShoppingCart size={16} /> },
      { to: '/admin/orders?status=PROCESSING', labelEn: 'Processing', labelAr: 'قيد التنفيذ', icon: <ShoppingCart size={16} /> },
      { to: '/admin/orders?status=COMPLETED', labelEn: 'Completed', labelAr: 'المكتملة', icon: <ShoppingCart size={16} /> },
      { to: '/admin/orders?status=CANCELLED', labelEn: 'Cancelled', labelAr: 'الملغاة', icon: <ShoppingCart size={16} /> },
    ],
  };

  const singleItemsMiddle: NavItem[] = [
    { to: '/admin/inventory', labelEn: 'Inventory', labelAr: 'المخزون المركزي', icon: <Warehouse size={18} /> },
    { to: '/admin/payments', labelEn: 'Payments', labelAr: 'المدفوعات والتحويلات', icon: <CreditCard size={18} /> },
    { to: '/admin/reviews', labelEn: 'Reviews', labelAr: 'التقييمات والمراجعات', icon: <Star size={18} /> },
    { to: '/admin/complaints', labelEn: 'Complaints', labelAr: 'الشكاوى والنزاعات', icon: <MessageSquareWarning size={18} /> },
    { to: '/admin/coupons', labelEn: 'Coupons', labelAr: 'كوبونات الخصم', icon: <Ticket size={18} /> },
    { to: '/admin/banners', labelEn: 'Banners', labelAr: 'البانرات الإعلانية', icon: <Image size={18} /> },
    { to: '/admin/notifications', labelEn: 'Notifications', labelAr: 'الإشعارات العامة', icon: <Megaphone size={18} /> },
    { to: '/admin/reports', labelEn: 'Reports', labelAr: 'التقارير والإحصائيات', icon: <BarChart3 size={18} /> },
    { to: '/admin/commissions', labelEn: 'Commissions', labelAr: 'إدارة العمولات', icon: <Percent size={18} /> },
    { to: '/admin/audit', labelEn: 'Audit Logs', labelAr: 'سجل التدقيق الأمني', icon: <ShieldCheck size={18} /> },
  ];

  const geographyGroup: NavGroup = {
    labelEn: 'Geography',
    labelAr: 'النطاق الجغرافي',
    icon: <Globe size={18} />,
    items: [
      { to: '/admin/geography/countries', labelEn: 'Countries', labelAr: 'الدول والعملات', icon: <Globe size={16} /> },
      { to: '/admin/geography/cities', labelEn: 'Cities', labelAr: 'المدن والمناطق', icon: <Globe size={16} /> },
    ],
  };

  const isRtl = language === 'ar';

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex ${isRtl ? 'font-cairo' : 'font-sans'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Sidebar - Preserved Dark Navy for high contrast and control center authority */}
      <aside
        className={`fixed lg:static inset-y-0 ${isRtl ? 'right-0' : 'left-0'} z-50 w-72 bg-slate-950 border-e border-slate-800 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : isRtl ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-3">
            <Logo white size={32} />
            <div>
              <div className="font-extrabold tracking-tight text-white text-base">ALA CONTROL</div>
              <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                {user?.role === 'SUPER_ADMIN' ? (isRtl ? 'مدير عام النظام' : 'Super Admin') : (isRtl ? 'إدارة المنصة' : 'Admin')}
              </div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Top Singles */}
          {singleItemsTop.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{isRtl ? item.labelAr : item.labelEn}</span>
              </div>
            </NavLink>
          ))}

          {/* Access Control Accordion */}
          <div className="pt-2">
            <button
              onClick={() => toggleGroup('access')}
              className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
                isAccessControlActive ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {accessControlGroup.icon}
                <span>{isRtl ? accessControlGroup.labelAr : accessControlGroup.labelEn}</span>
              </div>
              {openGroups.access ? <ChevronDown size={14} /> : <ChevronRight size={14} className={isRtl ? 'rotate-180' : ''} />}
            </button>
            {openGroups.access && (
              <div className={`mt-1 space-y-1 ${isRtl ? 'pr-6 border-r' : 'pl-6 border-l'} border-slate-800/80`}>
                {accessControlGroup.items.map(sub => (
                  <NavLink
                    key={sub.to}
                    to={sub.to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-400 font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`
                    }
                  >
                    {sub.icon}
                    <span>{isRtl ? sub.labelAr : sub.labelEn}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Catalog Accordion */}
          <div className="pt-1">
            <button
              onClick={() => toggleGroup('catalog')}
              className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
                isCatalogActive ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {catalogGroup.icon}
                <span>{isRtl ? catalogGroup.labelAr : catalogGroup.labelEn}</span>
              </div>
              {openGroups.catalog ? <ChevronDown size={14} /> : <ChevronRight size={14} className={isRtl ? 'rotate-180' : ''} />}
            </button>
            {openGroups.catalog && (
              <div className={`mt-1 space-y-1 ${isRtl ? 'pr-6 border-r' : 'pl-6 border-l'} border-slate-800/80`}>
                {catalogGroup.items.map(sub => (
                  <NavLink
                    key={sub.to}
                    to={sub.to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-400 font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`
                    }
                  >
                    {sub.icon}
                    <span>{isRtl ? sub.labelAr : sub.labelEn}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Orders Accordion */}
          <div className="pt-1">
            <button
              onClick={() => toggleGroup('orders')}
              className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
                isOrdersActive ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {ordersGroup.icon}
                <span>{isRtl ? ordersGroup.labelAr : ordersGroup.labelEn}</span>
              </div>
              {openGroups.orders ? <ChevronDown size={14} /> : <ChevronRight size={14} className={isRtl ? 'rotate-180' : ''} />}
            </button>
            {openGroups.orders && (
              <div className={`mt-1 space-y-1 ${isRtl ? 'pr-6 border-r' : 'pl-6 border-l'} border-slate-800/80`}>
                {ordersGroup.items.map(sub => (
                  <NavLink
                    key={sub.to}
                    to={sub.to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-400 font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`
                    }
                  >
                    {sub.icon}
                    <span>{isRtl ? sub.labelAr : sub.labelEn}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Middle Singles */}
          {singleItemsMiddle.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{isRtl ? item.labelAr : item.labelEn}</span>
              </div>
            </NavLink>
          ))}

          {/* Geography Accordion */}
          <div className="pt-1">
            <button
              onClick={() => toggleGroup('geography')}
              className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
                isGeographyActive ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {geographyGroup.icon}
                <span>{isRtl ? geographyGroup.labelAr : geographyGroup.labelEn}</span>
              </div>
              {openGroups.geography ? <ChevronDown size={14} /> : <ChevronRight size={14} className={isRtl ? 'rotate-180' : ''} />}
            </button>
            {openGroups.geography && (
              <div className={`mt-1 space-y-1 ${isRtl ? 'pr-6 border-r' : 'pl-6 border-l'} border-slate-800/80`}>
                {geographyGroup.items.map(sub => (
                  <NavLink
                    key={sub.to}
                    to={sub.to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-400 font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`
                    }
                  >
                    {sub.icon}
                    <span>{isRtl ? sub.labelAr : sub.labelEn}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Settings Single */}
          <NavLink
            to="/admin/settings"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <Settings2 size={18} />
              <span>{isRtl ? 'إعدادات المنصة' : 'Settings'}</span>
            </div>
          </NavLink>
        </nav>

        {/* Footer profile & actions */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-900 transition"
          >
            <ExternalLink size={14} />
            <span>{isRtl ? 'الواجهة الرئيسية للسوق' : 'Public Marketplace'}</span>
          </Link>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition"
          >
            <LogOut size={14} />
            <span>{isRtl ? 'تسجيل الخروج' : 'Log out'}</span>
          </button>
          <div className="px-3 pt-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="truncate max-w-[140px]">{user?.email || user?.fullName}</span>
            <span className="font-mono text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-amber-400">
              {user?.role}
            </span>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Main Content Area - Clean White / Slate-50 background with #010736 Navy text */}
      <div className="flex-1 min-w-0 flex flex-col bg-slate-50/80">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-[#010736]">
                {isRtl ? 'مركز إدارة وتحكم منصة آلا لقطع غيار السيارات' : 'ALA Automotive Spare Parts Control Center'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[#010736] font-semibold">
                {user?.role === 'SUPER_ADMIN' ? (isRtl ? 'مدير عام النظام' : 'Super Admin') : (user?.role || 'Admin')}
              </span>
            </div>
            <Link
              to="/"
              className="p-2 rounded-xl text-slate-500 hover:text-[#010736] hover:bg-slate-100 border border-slate-200 transition"
              title={isRtl ? 'زيارة الموقع الرئيسي' : 'Visit Marketplace'}
            >
              <ExternalLink size={18} />
            </Link>
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;