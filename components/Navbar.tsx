import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useCart } from '../context/CartContext';
import { UserRole } from '../types';
import {
  Menu, X, Globe, LogOut, User as UserIcon, LogIn, LayoutDashboard,
  ShoppingCart, Bell, Store, Package, ChevronDown, Sparkles
} from 'lucide-react';
import Logo from './brand/Logo';

/**
 * Navbar — Official ALA Header Component
 * Redesigned for a clean, premium automotive marketplace experience:
 * - Official brand logo lockup (44px)
 * - Spacious main navigation (الرئيسية، المحلات، اطلب قطعة، تواصل معنا)
 * - Active route state with elegant cream accent indicators
 * - Cart and Notifications with dynamic badges
 * - Streamlined Account Dropdown containing Profile, Orders, Role-based Dashboard, Language, and Logout
 * - Fully responsive with clean mobile slide-out drawer
 */
const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated, effectiveRole } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { notifications } = useData();
  const { count: cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifyRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifyRef.current && !notifyRef.current.contains(event.target as Node)) {
        setNotifyOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    logout();
    navigate('/');
  };

  // Role authorization checks (Section 4)
  const canAccessDashboard =
    effectiveRole === UserRole.SUPER_ADMIN ||
    effectiveRole === UserRole.ADMIN ||
    effectiveRole === UserRole.SHOP_OWNER ||
    effectiveRole === UserRole.SHOP_EMPLOYEE ||
    effectiveRole === UserRole.SELLER;

  const getDashboardLink = () => {
    if (effectiveRole === UserRole.ADMIN || effectiveRole === UserRole.SUPER_ADMIN) return '/admin';
    if (effectiveRole === UserRole.SHOP_OWNER || effectiveRole === UserRole.SELLER || effectiveRole === UserRole.SHOP_EMPLOYEE) return '/shop';
    return '/profile';
  };

  const getRoleLabel = () => {
    switch (effectiveRole) {
      case UserRole.SUPER_ADMIN:
      case UserRole.ADMIN:
        return language === 'ar' ? 'مشرف المنصة' : 'Admin';
      case UserRole.SHOP_OWNER:
      case UserRole.SELLER:
        return language === 'ar' ? 'مالك محل' : 'Shop Owner';
      case UserRole.SHOP_EMPLOYEE:
        return language === 'ar' ? 'موظف محل' : 'Employee';
      default:
        return language === 'ar' ? 'عميل' : 'Customer';
    }
  };

  const unreadNotifications = notifications.filter(n => n.userId === user?.id && !n.isRead).length;

  const navLinks = [
    { to: '/', label: t('home') },
    { to: '/shops', label: t('shops') },
    { to: '/external-request', label: t('requestPart') },
    { to: '/contact', label: t('contactUs') },
  ];

  const isLinkActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-primary text-white sticky top-0 z-50 border-b border-navy/40 shadow-sm select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[74px]">

          {/* RIGHT SIDE (in RTL): Official Brand Logo & Main Navigation */}
          <div className="flex items-center gap-6 lg:gap-8">
            {/* 1. Official Logo Lockup */}
            <Link
              to="/"
              className="flex-shrink-0 flex items-center hover:opacity-95 transition-opacity"
              aria-label="ALALAMI Home"
            >
              <Logo light size={44} showName />
            </Link>

            {/* 2. Desktop Navigation Links (Section 3 & 12) */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map(link => {
                const active = isLinkActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'text-secondary font-bold'
                        : 'text-white/80 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute bottom-0 inset-x-3.5 h-0.5 bg-secondary rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* LEFT SIDE (in RTL): Utilities (Cart, Notifications, Language, Account Dropdown) */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Language Switcher Button (Section 16: subtle secondary item) */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 transition"
              title={language === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
              aria-label="Change Language"
            >
              <Globe size={15} className="text-secondary" />
              <span>{language === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            {/* Shopping Cart Icon (Section 14) */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition"
              aria-label={t('cart')}
              title={t('cart')}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -end-1 bg-secondary text-primary text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Notifications Popover (Section 15) */}
            {isAuthenticated && (
              <div className="relative" ref={notifyRef}>
                <button
                  onClick={() => setNotifyOpen(v => !v)}
                  className="relative p-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition"
                  aria-label={t('notifications')}
                  title={t('notifications')}
                >
                  <Bell size={20} />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -end-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                      {unreadNotifications > 99 ? '99+' : unreadNotifications}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {notifyOpen && (
                  <div className="absolute end-0 mt-2 w-80 bg-white text-primary rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 bg-surface border-b border-gray-100 flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">{t('notifications')}</span>
                      <Link
                        to="/notifications"
                        onClick={() => setNotifyOpen(false)}
                        className="text-xs font-semibold text-navy hover:underline"
                      >
                        {t('viewAll')}
                      </Link>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                      {notifications.filter(n => n.userId === user?.id).slice(0, 5).map(n => (
                        <Link
                          key={n.id}
                          to={n.link || '/notifications'}
                          onClick={() => setNotifyOpen(false)}
                          className={`block px-4 py-3 hover:bg-surface transition ${!n.isRead ? 'bg-navy/5' : ''}`}
                        >
                          <div className="text-sm font-semibold text-primary">{language === 'ar' ? n.titleAr : n.titleEn}</div>
                          <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">{language === 'ar' ? n.bodyAr : n.bodyEn}</div>
                        </Link>
                      ))}
                      {notifications.filter(n => n.userId === user?.id).length === 0 && (
                        <div className="px-4 py-8 text-sm text-gray-400 text-center">{t('noNotifications')}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Account / User Menu (Section 5 & 6) */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition"
                  aria-label="User Menu"
                >
                  <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center text-secondary font-bold text-xs">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex flex-col text-start">
                    <span className="text-xs font-semibold text-white max-w-[110px] truncate leading-tight">
                      {user?.name || t('profile')}
                    </span>
                    <span className="text-[10px] text-secondary/80 leading-tight">
                      {getRoleLabel()}
                    </span>
                  </div>
                  <ChevronDown size={14} className={`text-white/60 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Account Dropdown (Section 6) */}
                {userMenuOpen && (
                  <div className="absolute end-0 mt-2 w-60 bg-white text-primary rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-gray-100 bg-surface">
                      <div className="text-xs font-bold text-primary truncate">{user?.name}</div>
                      <div className="text-[11px] text-gray-500 truncate">{user?.email}</div>
                    </div>

                    <div className="py-1">
                      {/* Role-based Dashboard (Section 4: ONLY shown if user has access) */}
                      {canAccessDashboard && (
                        <Link
                          to={getDashboardLink()}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-surface transition"
                        >
                          <LayoutDashboard size={16} className="text-navy" />
                          <span>{t('dashboard')}</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-surface transition"
                      >
                        <UserIcon size={16} className="text-navy" />
                        <span>{t('profile')}</span>
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-surface transition"
                      >
                        <Package size={16} className="text-navy" />
                        <span>{t('myOrders') || 'طلباتي'}</span>
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 my-1 pt-1">
                      {/* Logout at bottom of menu (Section 5) */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition text-start"
                      >
                        <LogOut size={16} />
                        <span>{t('logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white/90 hover:text-white hover:bg-white/5 transition flex items-center gap-1.5"
                >
                  <LogIn size={15} />
                  <span>{t('login')}</span>
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-secondary text-primary hover:brightness-95 active:scale-95 transition shadow-sm"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE CONTROLS (Cart + Hamburger Menu) */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <Link
              to="/cart"
              className="relative p-2 text-white/80 hover:text-white"
              aria-label={t('cart')}
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -end-1 bg-secondary text-primary text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(v => !v)}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE DRAWER / SHEET (Section 11) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-primary border-t border-navy/50 shadow-2xl px-4 pt-3 pb-6 animate-in slide-in-from-top duration-200">
          {/* Navigation Links */}
          <div className="space-y-1 py-2">
            {navLinks.map(link => {
              const active = isLinkActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                    active
                      ? 'bg-secondary text-primary'
                      : 'text-white/80 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile User Section */}
          <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
            {isAuthenticated ? (
              <>
                <div className="px-4 py-2 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{user?.name}</div>
                    <div className="text-xs text-secondary">{getRoleLabel()}</div>
                  </div>
                  <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-1 text-xs text-white/70 bg-white/5 px-2.5 py-1.5 rounded-lg"
                  >
                    <Globe size={14} className="text-secondary" />
                    {language === 'ar' ? 'English' : 'عربي'}
                  </button>
                </div>

                {canAccessDashboard && (
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/80 hover:bg-white/5 font-medium"
                  >
                    <LayoutDashboard size={18} className="text-secondary" />
                    {t('dashboard')}
                  </Link>
                )}

                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/80 hover:bg-white/5 font-medium"
                >
                  <UserIcon size={18} className="text-secondary" />
                  {t('profile')}
                </Link>

                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/80 hover:bg-white/5 font-medium"
                >
                  <Package size={18} className="text-secondary" />
                  {t('myOrders') || 'طلباتي'}
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 font-semibold mt-2"
                >
                  <LogOut size={18} />
                  {t('logout')}
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-white/10 text-white hover:bg-white/15"
                  >
                    <LogIn size={16} />
                    {t('login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center py-2.5 rounded-xl text-sm font-bold bg-secondary text-primary hover:brightness-95"
                  >
                    {t('register')}
                  </Link>
                </div>
                <button
                  onClick={toggleLanguage}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-white/70 py-2"
                >
                  <Globe size={14} className="text-secondary" />
                  {language === 'ar' ? 'English' : 'عربي'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;