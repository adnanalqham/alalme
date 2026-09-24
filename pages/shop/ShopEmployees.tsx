import React, { useEffect, useState } from 'react';
import { Plus, ShieldCheck, UserPlus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { shopService } from '../../api';
import { PERMISSIONS, PermissionKey } from '../../types';
import { Badge, PageHeader, MobileTable, inputCls, labelCls } from '../../components/ui/Primitives';

const GROUPS = ['products', 'inventory', 'orders', 'branches'];
const GROUPS_AR: Record<string, string> = { products: 'المنتجات', inventory: 'المخزون', orders: 'الطلبات', branches: 'الفروع' };

const ShopEmployees: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [list, setList] = useState<Array<{ user: any; membership: any }>>([]);
  const [tick, setTick] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: '', fullName: '', password: '', email: '', phone: '' });
  const [perms, setPerms] = useState<PermissionKey[]>(['products.view', 'inventory.view', 'orders.view']);

  useEffect(() => {
    try { setList(shopService.employees()); } catch { /* */ }
  }, [tick]);

  const togglePerm = (k: PermissionKey) => setPerms(p => p.includes(k) ? p.filter(x => x !== k) : [...p, k]);

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      shopService.createEmployee({ ...form, permissions: perms });
      toast(language === 'ar' ? 'تمت إضافة الموظف' : 'Employee added', { kind: 'success' });
      setForm({ username: '', fullName: '', password: '', email: '', phone: '' });
      setShowForm(false); setTick(x => x + 1);
    } catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };

  const toggleActive = (u: any, m: any) => {
    try {
      shopService.updateEmployee(u.id, { isActive: !m.isActive });
      setTick(x => x + 1);
    } catch (err: any) { toast(err?.message, { kind: 'error' }); }
  };

  const label = (k: PermissionKey) => {
    const def = PERMISSIONS.find(p => p.key === k);
    return def ? (language === 'ar' ? def.labelAr : def.labelEn) : k;
  };

  return (
    <div>
      <PageHeader
        title={language === 'ar' ? 'الموظفون' : 'Employees'}
        subtitle={language === 'ar' ? 'صلاحيات مخصصة لكل موظف' : 'Custom permissions per employee'}
        action={<button onClick={() => setShowForm(v => !v)} className="rounded-xl bg-primary text-white px-4 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-navy"><UserPlus size={15} /> {language === 'ar' ? 'موظف جديد' : 'New employee'}</button>}
      />

      {showForm && (
        <form onSubmit={create} className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 mb-5">
          <h3 className="font-bold text-primary mb-1 flex items-center gap-2"><Plus size={15} /> {language === 'ar' ? 'إضافة موظف' : 'Add employee'}</h3>
          <p className="text-xs text-gray-400 mb-4">{language === 'ar' ? 'سيبحث الموظف بأسم المستخدم وكلمة المرور من صفحة تسجيل الدخول.' : 'The employee signs in with these credentials from the login page.'}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>Username *</label><input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required className={inputCls} /></div>
            <div><label className={labelCls}>{language === 'ar' ? 'الاسم الكامل *' : 'Full name *'}</label><input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required className={inputCls} /></div>
            <div><label className={labelCls}>{language === 'ar' ? 'كلمة المرور *' : 'Password *'}</label><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={3} className={inputCls} /></div>
            <div><label className={labelCls}>{language === 'ar' ? 'الهاتف' : 'Phone'}</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} /></div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm font-bold text-primary mb-2"><ShieldCheck size={15} /> {language === 'ar' ? 'الصلاحيات' : 'Permissions'}</div>
            <div className="grid sm:grid-cols-2 gap-3">
              {GROUPS.map(g => (
                <fieldset key={g} className="border border-gray-50 rounded-xl p-3">
                  <legend className="text-xs font-bold text-navy px-1">{language === 'ar' ? GROUPS_AR[g] : g}</legend>
                  {PERMISSIONS.filter(p => p.group === g).map(p => (
                    <label key={p.key} className="flex items-center gap-2 py-1 text-xs text-primary cursor-pointer">
                      <input type="checkbox" checked={perms.includes(p.key)} onChange={() => togglePerm(p.key)} className="accent-primary" />
                      {label(p.key)}
                    </label>
                  ))}
                </fieldset>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="rounded-xl bg-primary text-white px-5 py-2.5 text-sm font-bold hover:bg-navy">{language === 'ar' ? 'حفظ' : 'Save'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-gray-100 px-4 py-2.5 text-sm font-semibold text-primary">{language === 'ar' ? 'إلغاء' : 'Cancel'}</button>
          </div>
        </form>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <MobileTable
          headers={[language === 'ar' ? 'الموظف' : 'Employee', language === 'ar' ? 'الصلاحيات' : 'Permissions', language === 'ar' ? 'الحالة' : 'Status', '']}
          empty={language === 'ar' ? 'لا يوجد موظفون' : 'No employees'}
          rows={list.map(({ user: u, membership: m }) => [
            <div key="u">
              <div className="font-semibold text-primary">{u.fullName}</div>
              <div className="text-xs text-gray-400">@{u.username}</div>
            </div>,
            <div key="p" className="flex flex-wrap gap-1 max-w-xs">
              {(m.permissions ?? []).slice(0, 4).map((p: string) => <span key={p} className="rounded-full bg-navy/5 text-navy px-2 py-0.5 text-[10px] font-semibold">{label(p as PermissionKey)}</span>)}
              {(m.permissions ?? []).length > 4 && <span className="text-[10px] text-gray-400">+{(m.permissions ?? []).length - 4}</span>}
              {(m.permissions ?? []).length === 0 && <span className="text-[10px] text-gray-400">{language === 'ar' ? 'بدون صلاحيات' : 'No permissions'}</span>}
            </div>,
            <Badge key="s" tone={m.isActive ? 'success' : 'danger'}>{m.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'معطل' : 'Disabled')}</Badge>,
            <button key="a" onClick={() => toggleActive(u, m)} className="rounded-lg border border-gray-100 px-3 py-1 text-xs font-bold text-primary hover:bg-surface">
              {m.isActive ? (language === 'ar' ? 'تعطيل' : 'Disable') : (language === 'ar' ? 'تفعيل' : 'Enable')}
            </button>,
          ])}
        />
      </div>
    </div>
  );
};

export default ShopEmployees;