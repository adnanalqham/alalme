import React, { useEffect, useState } from 'react';
import { Search, Ban, CheckCircle, KeyRound } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { adminService } from '../../api';
import { UserRole, UserStatus } from '../../types';
import { Badge, PageHeader, MobileTable, inputCls } from '../../components/ui/Primitives';

const ROLE_AR: Record<string, string> = { SUPER_ADMIN: 'مدير عام', ADMIN: 'إدارة', SHOP_OWNER: 'مالك محل', SHOP_EMPLOYEE: 'موظف محل', CUSTOMER: 'عميل', SELLER: 'بائع (قديم)' };

const AdminUsers: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [list, setList] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    try { setList(adminService.users({ role: role || undefined, search: q || undefined }).users); } catch { /* */ }
  }, [tick, role, q]);

  const setStatus = (u: any, status: UserStatus) => {
    try { adminService.setUserStatus(u.id, status); setTick(x => x + 1); toast(status, { kind: 'success' }); }
    catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };

  const resetPw = (u: any) => {
    try {
      const temp = adminService.resetPassword(u.id);
      toast(`@${u.username} → ${temp}`, { kind: 'info' });
    } catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };

  return (
    <div>
      <PageHeader title={language === 'ar' ? 'المستخدمون' : 'Users'} subtitle={`${list.length} ${language === 'ar' ? 'معروض' : 'shown'}`} />

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3">
          <Search size={16} className="text-gray-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={language === 'ar' ? 'بحث بالاسم أو البريد…' : 'Search…'} className="w-full py-2.5 outline-none text-sm bg-transparent text-primary" />
        </div>
        <select value={role} onChange={e => setRole(e.target.value)} className="rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-sm text-primary outline-none">
          <option value="">{language === 'ar' ? 'كل الأدوار' : 'All roles'}</option>
          {(Object.keys(ROLE_AR) as string[]).map(r => <option key={r} value={r}>{language === 'ar' ? ROLE_AR[r] : r}</option>)}
        </select>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <MobileTable
          headers={[language === 'ar' ? 'المستخدم' : 'User', language === 'ar' ? 'الدور' : 'Role', language === 'ar' ? 'الحالة' : 'Status', language === 'ar' ? 'إجراءات' : 'Actions']}
          empty={language === 'ar' ? 'لا يوجد مستخدمون' : 'No users'}
          rows={list.map(u => [
            <div key="u">
              <div className="font-semibold text-primary">{u.fullName}</div>
              <div className="text-xs text-gray-400" dir="ltr">@{u.username} · {u.email}</div>
            </div>,
            <Badge key="r" tone={u.role === UserRole.SUPER_ADMIN || u.role === UserRole.ADMIN ? 'danger' : u.role === UserRole.SHOP_OWNER ? 'cream' : u.role === UserRole.SHOP_EMPLOYEE ? 'info' : 'neutral'}>
              {language === 'ar' ? ROLE_AR[u.role] ?? u.role : u.role}
            </Badge>,
            <Badge key="s" tone={u.status === UserStatus.ACTIVE ? 'success' : u.status === UserStatus.SUSPENDED ? 'warning' : 'danger'}>{u.status}</Badge>,
            <div key="a" className="flex gap-1">
              {u.status === UserStatus.ACTIVE
                ? <button onClick={() => setStatus(u, UserStatus.SUSPENDED)} className="flex items-center gap-1 rounded-lg bg-amber-100 text-amber-700 px-2.5 py-1.5 text-xs font-bold hover:bg-amber-200"><Ban size={12} /> {language === 'ar' ? 'تعليق' : 'Suspend'}</button>
                : <button onClick={() => setStatus(u, UserStatus.ACTIVE)} className="flex items-center gap-1 rounded-lg bg-green-100 text-green-700 px-2.5 py-1.5 text-xs font-bold hover:bg-green-200"><CheckCircle size={12} /> {language === 'ar' ? 'تفعيل' : 'Activate'}</button>}
              <button onClick={() => resetPw(u)} className="flex items-center gap-1 rounded-lg border border-gray-100 px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-surface"><KeyRound size={12} /> {language === 'ar' ? 'إعادة تعيين' : 'Reset'}</button>
            </div>,
          ])}
        />
      </div>
    </div>
  );
};

export default AdminUsers;