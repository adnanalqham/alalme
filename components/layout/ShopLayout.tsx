import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Boxes, ShoppingCart, Users, MapPin, BarChart3, Settings, Store, ChevronDown, LogOut, Menu, X, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { shopService } from '../../api';
import Logo from '../brand/Logo';
import { PermissionKey } from '../../types';

const PANEL_ITEMS: { to: string; labelEn: string; labelAr: string; icon: React.ReactNode; perm?: PermissionKey }[] = [
  { to: '/shop/dashboard', labelEn: 'Dashboard', labelAr: 'الرئيسية', icon: <LayoutDashboard size={16} /> },
  { to: '/shop/products', labelEn: 'Products', labelAr: 'المنتجات', icon: <Package size={16} />, perm: 'products.view' },
  { to: '/shop/inventory', labelEn: 'Inventory', labelAr: 'المخزون', icon: <Boxes size={16} />, perm: 'inventory.view' },
  { to: '/shop/orders', labelEn: 'Orders', labelAr: 'الطلبات', icon: <ShoppingCart size={16} />, perm: 'orders.view' },
  { to: '/shop/employees', labelEn: 'Team', labelAr: 'الفريق', icon: <Users size={16} />, perm: 'employees.view' },
  { to: '/shop/branches', labelEn: 'Branches', labelAr: 'الفروع', icon: <MapPin size={16} />, perm: 'branches.view' },
  { to: '/shop/reports', labelEn: 'Reports', labelAr: 'التقارير', icon: <BarChart3 size={16} />, perm: 'reports.view' },
  { to: '/shop/settings', labelEn: 'Settings', labelAr: 'الإعدادات', icon: <Settings size={16} />, perm: 'settings.manage' },
];

const ShopLayout: React.FC = () => {
  const { user, permissions, activeShopId, setActiveShop, logout } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [shops, setShops] = useState<any[]>([]);
  const [switchOpen, setSwitchOpen] = useState(false);

  useEffect(() => {
    try { setShops(shopService.myShops()); } catch { /* */ }
  }, [activeShopId]);

  const items = PANEL_ITEMS.filter(i => !i.perm || permissions.includes(i.perm));

  const onLogout = () => { logout(); navigate('/'); };

  const shopName = shops.find(s => s.id === activeShopId);

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 start-0 z-40 w-64 bg-primary text-white flex flex-col transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><Logo white size={30} /><span className="font-extrabold tracking-tight text-lg">ALA</span></Link>
          <button onClick={() => setOpen(false)} className="lg:hidden text-white/70"><X size={18} /></button>
        </div>

        <div className="px-4 mb-2">
          {shops.length > 1 ? (
            <button onClick={() => setSwitchOpen(v => !v)} className="w-full flex items-center justify-between rounded-xl bg-white/10 px-3 py-2.5 text-sm font-bold hover:bg-white/15">
              <span className="truncate">{language === 'ar' ? (shopName?.nameAr ?? shopName?.nameEn ?? '') : (shopName?.nameEn ?? '')}</span>
              <ChevronDown size={14} className={`transition ${switchOpen ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <div className="rounded-xl bg-white/10 px-3 py-2.5 text-sm font-bold truncate">{language === 'ar' ? (shopName?.nameAr ?? shopName?.nameEn ?? '') : (shopName?.nameEn ?? '')}</div>
          )}
          {switchOpen && shops.length > 1 && (
            <div className="mt-1 rounded-xl bg-white/10 overflow-hidden text-sm">
              {shops.map(s => (
                <button key={s.id} onClick={() => { setActiveShop(s.id); setSwitchOpen(false); }} className={`w-full text-start px-3 py-2 hover:bg-white/15 ${s.id === activeShopId ? 'font-bold text-secondary' : 'text-white/80'}`}>
                  {language === 'ar' ? (s.nameAr ?? s.nameEn) : s.nameEn}
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {items.map(i => (
            <NavLink key={i.to} to={i.to} onClick={() => setOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${isActive ? 'bg-secondary font-bold text-primary' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
              {i.icon} {language === 'ar' ? i.labelAr : i.labelEn}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <Link to={activeShopId ? `/#/shop/${activeShopId}` : '/'} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/10">
            <ExternalLink size={15} /> {language === 'ar' ? 'عرض المتجر' : 'View storefront'}
          </Link>
          <button onClick={onLogout} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-300 hover:bg-white/10 w-full text-start">
            <LogOut size={15} /> {language === 'ar' ? 'تسجيل الخروج' : 'Log out'}
          </button>
          <div className="px-3 pt-1 text-[10px] text-white/40" dir="ltr">@{user?.username}</div>
        </div>
      </aside>

      {/* overlay mobile */}
      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 bg-black/40 z-30 lg:hidden" />}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setOpen(true)} className="rounded-xl border border-gray-100 p-2 text-primary"><Menu size={18} /></button>
          <Link to="/" className="flex items-center gap-2"><Logo size={24} /><span className="font-extrabold text-primary text-lg">ALA</span></Link>
          <Link to="/" className="rounded-xl border border-gray-100 p-2 text-primary"><ExternalLink size={16} /></Link>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ShopLayout;