import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Package, Star, BadgeAlert, Megaphone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { notificationService } from '../api';
import { Notification } from '../types';
import { EmptyState } from '../components/ui/Primitives';

const ICONS: Record<string, React.ReactNode> = {
  ORDER: <Package size={16} />,
  REVIEW: <Star size={16} />,
  SYSTEM: <BadgeAlert size={16} />,
  PROMO: <Megaphone size={16} />,
};

const TONES: Record<string, string> = {
  ORDER: 'bg-navy/10 text-navy',
  REVIEW: 'bg-amber-100 text-amber-600',
  SYSTEM: 'bg-red-50 text-red-500',
  PROMO: 'bg-purple-50 text-purple-500',
};

const Notifications: React.FC = () => {
  const { t, language } = useLanguage();
  const [list, setList] = useState<Notification[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    try { setList(notificationService.listMine()); } catch { /* not authed */ }
  }, [tick]);

  const markAll = () => {
    try { notificationService.markAllRead(); setTick(t => t + 1); } catch { /* noop */ }
  };

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-extrabold text-primary flex items-center gap-2"><Bell size={22} /> {t('notifications')}</h1>
          {list.some(n => !n.isRead) && (
            <button onClick={markAll} className="text-sm text-navy font-semibold hover:underline flex items-center gap-1">
              <CheckCheck size={16} /> {t('markAllRead')}
            </button>
          )}
        </div>

        {list.length === 0 ? (
          <EmptyState title={t('noNotifications')} icon={<Bell size={30} />} />
        ) : (
          <div className="space-y-2">
            {list.map(n => (
              <div key={n.id} className={`bg-white rounded-2xl border p-4 flex gap-3 transition ${n.isRead ? 'border-gray-50 opacity-70' : 'border-gray-100 shadow-sm'}`}>
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${TONES[n.type] ?? 'bg-surface text-primary'}`}>{ICONS[n.type] ?? <Bell size={16} />}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-primary">{language === 'ar' ? n.titleAr : n.titleEn}</div>
                  <p className="text-xs text-gray-500 mt-0.5">{language === 'ar' ? n.bodyAr : n.bodyEn}</p>
                  <div className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString(language === 'ar' ? 'ar' : 'en')}</div>
                </div>
                {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />}
              </div>
            ))}
          </div>
        )}

        <Link to="/profile" className="inline-block text-xs text-gray-400 hover:text-primary mt-4">{t('backToProfile')}</Link>
      </div>
    </div>
  );
};

export default Notifications;