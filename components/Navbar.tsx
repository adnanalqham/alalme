
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { UserRole } from '../types';
import { Menu, X, Globe, LogOut, User as UserIcon, LogIn, LayoutDashboard } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { websiteSettings } = useData();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === UserRole.ADMIN) return '/admin';
    if (user.role === UserRole.SELLER) return '/seller';
    return '/profile';
  };

  const appName = language === 'ar' ? websiteSettings.appNameAr : websiteSettings.appNameEn;

  return (
    <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer gap-3" onClick={() => navigate('/')}>
            {websiteSettings.logoUrl && (
              <img src={websiteSettings.logoUrl} alt="Logo" className="h-8 w-8 object-contain" />
            )}
            <span className="text-2xl font-bold font-cairo text-secondary">
              {appName}
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4 rtl:space-x-reverse">
              <Link to="/" className="hover:bg-blue-800 px-3 py-2 rounded-md text-sm font-medium transition">
                {t('home')}
              </Link>
              <Link to="/external-request" className="hover:bg-blue-800 px-3 py-2 rounded-md text-sm font-medium transition">
                {t('requestPart')}
              </Link>
              <Link to="/contact" className="hover:bg-blue-800 px-3 py-2 rounded-md text-sm font-medium transition">
                {t('contactUs')}
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link to={getDashboardLink()} className="hover:bg-blue-800 px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-1">
                    <LayoutDashboard size={16} />
                    {user?.role === UserRole.CUSTOMER ? t('profile') : t('dashboard')}
                  </Link>
                  <button onClick={handleLogout} className="hover:bg-red-700 bg-red-800 px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-1">
                    <LogOut size={16} />
                    {t('logout')}
                  </button>
                </>
              ) : (
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <Link to="/login" className="hover:bg-blue-800 px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-1">
                    <LogIn size={16} />
                    {t('login')}
                  </Link>
                  <Link to="/register" className="bg-secondary text-primary hover:bg-yellow-200 px-3 py-2 rounded-md text-sm font-bold transition">
                    {t('register')}
                  </Link>
                </div>
              )}

              <button 
                onClick={toggleLanguage} 
                className="hover:bg-blue-800 p-2 rounded-full transition flex items-center gap-1 text-xs"
              >
                <Globe size={18} />
                {language === 'ar' ? 'English' : 'عربي'}
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-primary inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-blue-800 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-900 pb-4">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" onClick={() => setIsOpen(false)} className="block hover:bg-blue-800 px-3 py-2 rounded-md text-base font-medium">
              {t('home')}
            </Link>
            <Link to="/external-request" onClick={() => setIsOpen(false)} className="block hover:bg-blue-800 px-3 py-2 rounded-md text-base font-medium">
              {t('requestPart')}
            </Link>
            <Link to="/contact" onClick={() => setIsOpen(false)} className="block hover:bg-blue-800 px-3 py-2 rounded-md text-base font-medium">
              {t('contactUs')}
            </Link>
            {isAuthenticated ? (
               <>
                <Link to={getDashboardLink()} onClick={() => setIsOpen(false)} className="block hover:bg-blue-800 px-3 py-2 rounded-md text-base font-medium">
                   {user?.role === UserRole.CUSTOMER ? t('profile') : t('dashboard')}
                </Link>
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full text-left block hover:bg-red-700 px-3 py-2 rounded-md text-base font-medium">
                  {t('logout')}
                </button>
               </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="block hover:bg-blue-800 px-3 py-2 rounded-md text-base font-medium">
                  {t('login')}
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="block hover:bg-blue-800 px-3 py-2 rounded-md text-base font-medium text-secondary">
                  {t('register')}
                </Link>
              </>
            )}
            <button onClick={() => { toggleLanguage(); setIsOpen(false); }} className="w-full text-left block hover:bg-blue-800 px-3 py-2 rounded-md text-base font-medium">
               {language === 'ar' ? 'English' : 'عربي'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
