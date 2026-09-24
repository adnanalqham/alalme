import React, { useMemo } from 'react';
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Boxes, ClipboardList, Users, MapPin, Settings, BarChart3,
  LogOut, ChevronRight, Banknote, ArrowUpDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import Logo from '../components/brand/Logo';
import { UserRole } from '../types';

const LINKS: { to: string; key: string; icon: React.ReactNode; perm?: string }[] = [
  { to: '/shop', key: 'dashboard', icon: <LayoutDashboard size={18} />, perm: 'reports.view' },
  { to: '/shop/products', key: 'products', icon: <Package size={18} />, perm: 'products.view' },
  { to: '/shop/inventory', key: 'inventory', icon: <Boxes size={18} />, perm: 'inventory.view' },
  { to: '/shop/movements', key: 'movements', icon: <ArrowUpDown size={18} />, perm: 'inventory.view' },
  { to: '/shop/orders', key: 'orders', icon: <ClipboardList size={18} />, perm: 'orders.view' },
  { to: '/shop/employees', key: 'employees', icon: <Users size={18} />, perm: 'employees.view' },
  { to: '/shop/branches', key: 'branches', icon: <MapPin size={18} />, perm: 'branches.view' },
  { to: '/shop/reports', key: 'reports', icon: <BarChart3 size={18} />, perm: 'reports.view' },
  { to: '/shop/settings', key: 'shopSettings', icon: <Settings size={18} />, perm: 'settings.manage' },
];

export const ShopLayout: React.FC = () => {
  const { user, logout, hasPermission, activeShopId } = useAuth();
  const { t, language } = useLanguage();
  const { shops, orders, products } = useData();
  const navigate = useNavigate();

  const shop = useMemo(() => {
    if (!user) return undefined;
    const membership = user.shopMemberships?.find(m => m.shopId === activeShopId || (activeShopId && m.shopId === activeShopId)) || user.shopMemberships?.[0];
    const sid = membership?.shopId ?? user.shopId;
    return shops.find(s => s.id === sid);
  }, [shops, user, activeShopId]);

  const visibleLinks = LINKS.filter(l => !l.perm || hasPermission(l.perm as any));

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-primary text-white hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-4 border-b border-white/10">
          <Logo light size={34} onClick={() => navigate('/')} />
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {visibleLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/shop'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-white/10 text-secondary border-s-4 border-secondary' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {l.icon}
              {t(l.key)}
              <ChevronRight size={14} className="ms-auto opacity-50" />
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          {shop && (
            <div className="text-xs text-white/60 mb-3">
              <div className="font-semibold text-white/90">{language === 'ar' ? shop.nameAr : shop.nameEn}</div>
              <div>{user?.role === UserRole.SHOP_OWNER || user?.role === UserRole.SELLER ? t('shopOwner') : t('shopEmployee')}</div>
            </div>
          )}
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 text-sm text-red-200 hover:text-white px-1"
          >
            <LogOut size={16} /> {t('logout')}
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden bg-primary text-white flex items-center gap-3 px-4 py-3 sticky top-0 z-40 w-full shadow">
        <Logo light size={28} showName={false} onClick={() => navigate('/')} />
        <div className="flex-1 overflow-x-auto pb-1">
          {visibleLinks.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/shop'} className="text-xs text-white/80 bg-white/10 rounded px-2 py-1 ms-2 whitespace-nowrap">
              {t(l.key)}
            </NavLink>
          ))}
        </div>
        <button onClick={() => { logout(); navigate('/'); }}><LogOut size={18} /></button>
      </div>

      {/* Content */}
      <main className="flex-1 min-w-0 p-4 md:p-8 max-w-[1400px]">
        <div className="md:hidden mb-3 text-primary text-sm font-semibold">
          {language === 'ar' ? shop?.nameAr : shop?.nameEn}
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default ShopLayout;