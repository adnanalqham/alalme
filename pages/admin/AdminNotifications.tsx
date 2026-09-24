import React, { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { notificationService } from '../../api';
import { NotificationType } from '../../types';
import { PageHeader, inputCls } from '../../components/ui/Primitives';

const AdminNotifications: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [bodyAr, setBodyAr] = useState('');
  const [type, setType] = useState<NotificationType>(NotificationType.SYSTEM);

  const send = () => {
    if (!titleEn && !titleAr) { toast(language === 'ar' ? 'أدخل عنواناً' : 'Enter a title', { kind: 'warning' }); return; }
    try {
      const n = notificationService.sendToAll({
        type,
        titleEn: titleEn || titleAr,
        titleAr: titleAr || titleEn,
        bodyEn: bodyEn || titleEn,
        bodyAr: bodyAr || titleAr || titleEn,
      });
      toast(`${language === 'ar' ? 'أُرسل إلى' : 'Sent to'} ${n} ${language === 'ar' ? 'مستخدم' : 'users'}`, { kind: 'success' });
      setTitleEn(''); setTitleAr(''); setBodyEn(''); setBodyAr('');
    } catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };

  return (
    <div>
      <PageHeader title={language === 'ar' ? 'الإشعارات الجماعية' : 'Broadcast notifications'} subtitle={language === 'ar' ? 'إرسال إشعار لجميع المستخدمين النشطين' : 'Send a notification to all active users'} />

      <div className="max-w-xl rounded-2xl border border-gray-100 bg-white shadow-sm p-5 space-y-3">
        <select value={type} onChange={e => setType(e.target.value as NotificationType)} className={inputCls}>
          {Object.values(NotificationType).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="Title (EN)" className={inputCls} />
        <input value={titleAr} onChange={e => setTitleAr(e.target.value)} placeholder="العنوان (عربي)" className={inputCls} />
        <textarea value={bodyEn} onChange={e => setBodyEn(e.target.value)} placeholder="Message (EN)" rows={3} className={inputCls} />
        <textarea value={bodyAr} onChange={e => setBodyAr(e.target.value)} placeholder="النص (عربي)" rows={3} className={inputCls} />
        <button onClick={send} className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-white py-3 font-bold hover:bg-navy">
          <Megaphone size={16} /> {language === 'ar' ? 'إرسال للجميع' : 'Send to all'}
        </button>
      </div>
    </div>
  );
};

export default AdminNotifications;