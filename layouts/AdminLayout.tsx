import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Store, ListTree, Factory, Car, ClipboardList, Banknote, Star,
  MessageSquareWarning, Bell, Image as ImageIcon, BarChart3, ScrollText, LogOut, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import Logo from '../components/brand/Logo';

const LINKS = [
  { to: '/admin', key: 'adminOverview', icon: <LayoutDashboard size={18} /> },
  { to: '/admin/users', key: 'users', icon: <Users size={18} /> },
  { to: '/admin/shops', key: 'shops', icon: <Store size={18} /> },
  { to: '/admin/categories', key: 'categories', icon: <ListTree size={18} /> },
  { to: '/admin/manufacturers', key: 'manufacturers', icon: <Factory size={18} /> },
  { to: '/admin/vehicles', key: 'vehicles', icon: <Car size={18} /> },
  { to: '/admin/orders', key: 'orders', icon: <ClipboardList size={18} /> },
  { to: '/admin/payments', key: 'payments', icon: <Banknote size={18} /> },
  { to: '/admin/reviews', key: 'reviews', icon: <Star size={18} /> },
  { to: '/admin/complaints', key: 'complaints', icon: <MessageSquareWarning size={18} /> },
  { to: '/admin/notifications', key: 'notifications', icon: <Bell size={18} /> },
  { to: '/admin/banners', key: 'banners', icon: <ImageIcon size={18} /> },
  { to: '/admin/reports', key: 'reports', icon: <BarChart3 size={18} /> },
  { to: '/admin/audit', key: 'auditLog', icon: <ScrollText size={18} /> },
];

export const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const { t } = useLanguage();
  const { unreadComplaints, unreadOrders } = useData();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex">
      <aside className="w-64 shrink-0 bg-navy text-white hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-4 border-b border-white/10">
          <Logo light size={34} onClick={() => navigate('/')} />
        </div>
        <div className="px-5 py-2 text-[11px] uppercase tracking-widest text-white/50 flex items-center gap-1.5">
          <ShieldCheck size={13} /> Admin Console
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          {LINKS.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-white/10 text-secondary border-s-4 border-secondary' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {l.icon}
              {t(l.key)}
              {l.to === '/admin/complaints' && unreadComplaints > 0 && (
                <span className="ms-auto text-xs bg-red-500 text-white rounded-full px-1.5">{unreadComplaints}</span>
              )}
              {l.to === '/admin/orders' && unreadOrders > 0 && (
                <span className="ms-auto text-xs bg-secondary text-primary rounded-full px-1.5">{unreadOrders}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 text-sm text-red-200 hover:text-white px-1">
            <LogOut size={16} /> {t('logout')}
          </button>
        </div>
      </aside>

      <div className="md:hidden bg-navy text-white flex items-center gap-3 px-4 py-3 sticky top-0 z-40 w-full shadow">
        <Logo light size={28} showName={false} onClick={() => navigate('/')} />
        <span className="text-xs text-white/70">Admin Console</span>
        <button onClick={() => { logout(); navigate('/'); }} className="ms-auto"><LogOut size={18} /></button>
      </div>

      <main className="flex-1 min-w-0 p-4 md:p-8 max-w-[1400px]">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;