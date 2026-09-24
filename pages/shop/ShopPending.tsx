import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Store, ShieldAlert, CheckCircle2, Phone, MessageSquare, ArrowRight, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../api/db';
import { Shop, ShopStatus } from '../../types';
import Logo from '../../components/brand/Logo';

export const ShopPending: React.FC = () => {
  const { user, logout, refresh } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [shop, setShop] = useState<Shop | null>(null);

  useEffect(() => {
    if (user) {
      const shopId = user.shopMemberships?.find(m => m.role === 'OWNER')?.shopId ?? user.shopId;
      const found = db.shops.find(s => s.id === shopId);
      setShop(found ?? null);

      if (found?.status === ShopStatus.APPROVED) {
        navigate('/shop/dashboard');
      }
    }
  }, [user, navigate]);

  const onLogout = () => {
    logout();
    navigate('/');
  };

  const isAr = language === 'ar';

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size={40} />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refresh()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-navy hover:bg-navy/5 rounded-xl transition"
          >
            <RefreshCw size={14} /> {isAr ? 'تحديث الحالة' : 'Refresh status'}
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition"
          >
            <LogOut size={14} /> {isAr ? 'تسجيل الخروج' : 'Log out'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-gray-100 shadow-xl p-8 text-center">
          {/* Status Badge Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
            <Clock size={40} className="animate-pulse" />
          </div>

          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full mb-3">
            {isAr ? 'طلب قيد المراجعة والاعتماد' : 'Pending Admin Verification'}
          </span>

          <h1 className="text-2xl font-extrabold text-primary mb-2">
            {isAr ? 'طلب إنشاء متجرك قيد المراجعة' : 'Your Shop is Awaiting Approval'}
          </h1>

          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            {isAr
              ? `أهلاً بك ${user?.fullName || ''}. تم استلام طلب تسجيل متجرك بنجاح، ويقوم فريق إدارة منصة العالمي بمراجعة البيانات وتفعيل الحساب خلال وقت وجيز.`
              : `Welcome ${user?.fullName || ''}. Your shop registration has been received and is currently under review by the ALALAMI platform administration.`}
          </p>

          {/* Shop Card */}
          {shop && (
            <div className="bg-surface rounded-2xl p-4 mb-6 text-start border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm flex-shrink-0">
                <Store size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-primary text-base truncate">
                  {isAr ? shop.nameAr || shop.nameEn : shop.nameEn || shop.nameAr}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {isAr ? 'رقم الهاتف:' : 'Phone:'} {shop.phone}
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700">
                {shop.status}
              </span>
            </div>
          )}

          {/* Review Steps */}
          <div className="space-y-3 mb-8 text-start text-xs text-gray-600 border-t border-gray-100 pt-5">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
              <span>{isAr ? 'تم إرسال بيانات المتجر بنجاح' : 'Shop details submitted successfully'}</span>
            </div>
            <div className="flex items-center gap-2.5 font-bold text-primary">
              <div className="w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin flex-shrink-0" />
              <span>{isAr ? 'جاري فحص النشاط التجاري وتحديد فئة العمولة' : 'Verification of commercial details & commission setting'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-400">
              <div className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" />
              <span>{isAr ? 'تفعيل المتجر وإتاحة إضافة المنتجات وإدارة الطلبات' : 'Shop activation & catalog management unlocked'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-primary hover:bg-gray-50 flex items-center justify-center gap-2 transition"
            >
              {isAr ? 'تصفح السوق كزائر' : 'Browse Marketplace as Guest'}
            </Link>
            <a
              href="https://wa.me/967771603365"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 flex items-center justify-center gap-2 shadow-sm transition"
            >
              <MessageSquare size={16} /> {isAr ? 'تواصل مع الدعم الفني' : 'Contact Support'}
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-400">
        &copy; {new Date().getFullYear()} ALALAMI · {isAr ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
      </footer>
    </div>
  );
};

export default ShopPending;
