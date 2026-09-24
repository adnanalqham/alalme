import React, { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { adminService } from '../../api';
import { Badge, PageHeader, MobileTable } from '../../components/ui/Primitives';

const AdminAudit: React.FC = () => {
  const { language } = useLanguage();
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    try { setList(adminService.auditLog()); } catch { /* */ }
  }, []);

  const L = (en: string, ar: string) => language === 'ar' ? ar : en;

  return (
    <div>
      <PageHeader title={L('Audit log', 'سجل التدقيق')} subtitle={L('Platform-wide activity trail', 'سجل نشاط المنصة')} />

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <MobileTable
          headers={[L('Time', 'الوقت'), L('User', 'المستخدم'), L('Action', 'الإجراء'), L('Target', 'الهدف'), L('Detail', 'التفاصيل')]}
          empty={L('No activity', 'لا يوجد نشاط')}
          rows={list.map((a, i) => [
            <span key="t" className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleString(language === 'ar' ? 'ar' : 'en')}</span>,
            <span key="u" className="text-sm font-bold text-primary">{a.userId || 'system'}</span>,
            <div key="a"><Badge tone="info">{a.action}</Badge></div>,
            <span key="o" className="text-xs text-gray-500" dir="ltr">{a.targetType}<span className="text-gray-300">:#{a.targetId}</span></span>,
            <span key="d" className="text-xs text-gray-500 truncate max-w-48">{a.detail ? JSON.stringify(a.detail) : '—'}</span>,
          ])}
        />
      </div>
    </div>
  );
};

export default AdminAudit;