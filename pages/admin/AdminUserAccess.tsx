import React, { useState, useEffect } from 'react';
import {
  Users, ShieldAlert, KeyRound, Check, X, Plus, Trash2, Ban, RotateCcw,
  Search, AlertCircle, CheckCircle2, ShieldCheck, ChevronRight, User as UserIcon,
  Store, Building2, Lock, Save, RefreshCw
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useLanguage } from '../../context/LanguageContext';

const AdminUserAccess: React.FC = () => {
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userAccess, setUserAccess] = useState<any>(null);
  const [accessLoading, setAccessLoading] = useState(false);

  // Override modification state
  const [additionalPerms, setAdditionalPerms] = useState<string[]>([]);
  const [deniedPerms, setDeniedPerms] = useState<string[]>([]);
  const [newSelectedRole, setNewSelectedRole] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [savingOverrides, setSavingOverrides] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Permission selector dropdown for adding grant/deny
  const [selectedPermToAdd, setSelectedPermToAdd] = useState<string>('');
  const [addMode, setAddMode] = useState<'GRANT' | 'DENY'>('GRANT');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [uRes, rRes, pRes] = await Promise.all([
        adminApi.getUsers({ search }),
        adminApi.getRoles(),
        adminApi.getPermissions(),
      ]);
      setUsers(uRes.users || []);
      setRoles(rRes.roles || []);
      setAllPermissions(pRes.permissions || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const loadUserDetails = async (user: any) => {
    setSelectedUser(user);
    setNewSelectedRole(user.role);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      setAccessLoading(true);
      const res = await adminApi.getUserAccess(user.id);
      setUserAccess(res);
      setAdditionalPerms(res.additional_permissions || []);
      setDeniedPerms(res.denied_permissions || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch user access details');
    } finally {
      setAccessLoading(false);
    }
  };

  const handleGrantPermission = (permName: string) => {
    if (!permName) return;
    // Remove from denied if present
    setDeniedPerms(prev => prev.filter(p => p !== permName));
    if (!additionalPerms.includes(permName)) {
      setAdditionalPerms(prev => [...prev, permName]);
    }
    setSelectedPermToAdd('');
  };

  const handleDenyPermission = (permName: string) => {
    if (!permName) return;
    // Remove from additional if present
    setAdditionalPerms(prev => prev.filter(p => p !== permName));
    if (!deniedPerms.includes(permName)) {
      setDeniedPerms(prev => [...prev, permName]);
    }
    setSelectedPermToAdd('');
  };

  const handleRestorePermission = (permName: string) => {
    setAdditionalPerms(prev => prev.filter(p => p !== permName));
    setDeniedPerms(prev => prev.filter(p => p !== permName));
  };

  const handleSaveAccess = async () => {
    if (!selectedUser) return;
    try {
      setSavingOverrides(true);
      setSuccessMsg(null);
      setErrorMsg(null);

      // 1. Update role if changed
      if (newSelectedRole !== selectedUser.role) {
        await adminApi.updateUserRole(selectedUser.id, newSelectedRole);
      }

      // 2. Update permission overrides
      const res = await adminApi.updateUserPermissions(selectedUser.id, {
        additional_permissions: additionalPerms,
        denied_permissions: deniedPerms,
        reason: overrideReason || 'Admin control center manual adjustment',
      });

      setSuccessMsg(isRtl ? 'تم حفظ التعديلات وحساب الصلاحيات الفعلية بنجاح' : 'User overrides saved and effective permissions recomputed');
      loadUserDetails({ ...selectedUser, role: newSelectedRole });
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save access changes');
    } finally {
      setSavingOverrides(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#010736]/10 text-[#010736] rounded-xl border border-[#010736]/20">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#010736] tracking-tight">
              {isRtl ? 'إدارة استثناءات وصول المستخدمين (User Access Overrides)' : 'User Access & Overrides'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRtl
                ? 'فحص وحساب الصلاحيات الفعلية: صلاحيات الدور + الإضافية الممنوحة - المحظورة والمستثناة'
                : 'Authoritative server resolution: Effective = Role + Additional (Granted) - Denied Overrides'}
            </p>
          </div>
        </div>

        <button
          onClick={fetchUsers}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#010736] hover:bg-slate-50 shadow-xs transition"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: User Directory list (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="relative">
              <Search size={14} className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} text-slate-400`} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={isRtl ? 'بحث باسم المستخدم أو البريد...' : 'Search user or email...'}
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-xs text-slate-800 focus:outline-none focus:border-[#010736] ${
                  isRtl ? 'pr-8 pl-3' : 'pl-8 pr-3'
                }`}
              />
            </div>

            {loading ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                {isRtl ? 'جاري التحميل...' : 'Loading users...'}
              </div>
            ) : users.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                {isRtl ? 'لا يوجد مستخدمون' : 'No users found'}
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                {users.map(u => {
                  const isSelected = selectedUser?.id === u.id;
                  return (
                    <div
                      key={u.id}
                      onClick={() => loadUserDetails(u)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/50 text-[#010736]'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-xs truncate text-[#010736]">{u.full_name || u.email}</div>
                        <div className="text-[11px] text-slate-500 font-mono truncate">{u.email}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-mono uppercase bg-slate-100 text-amber-700 font-semibold px-1.5 py-0.5 rounded border border-slate-200">
                            {u.role}
                          </span>
                          {u.status === 'SUSPENDED' && (
                            <span className="text-[9px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">
                              SUSPENDED
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight size={14} className={`text-slate-400 ${isRtl ? 'rotate-180' : ''}`} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Detailed User Access Inspector (8 cols) */}
        <div className="lg:col-span-8">
          {!selectedUser ? (
            <div className="bg-white border border-slate-200 p-16 text-center rounded-2xl text-slate-400 shadow-xs">
              <UserIcon size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-600">{isRtl ? 'اختر مستخدماً من القائمة لفحص الصلاحيات والاستثناءات' : 'Select a user from the directory to inspect and manage permissions'}</p>
            </div>
          ) : accessLoading ? (
            <div className="bg-white border border-slate-200 p-16 text-center rounded-2xl text-slate-500 shadow-xs">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500 mb-3" />
              <p className="text-xs font-semibold text-[#010736]">{isRtl ? 'جاري استرداد بيانات صلاحيات المستخدم...' : 'Resolving effective permissions...'}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* User Identity Card */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-[#010736]">{selectedUser.full_name}</h2>
                      <span className="text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono text-slate-500">
                        {selectedUser.id}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{selectedUser.email}</div>
                  </div>

                  {/* Role Assignment Switcher */}
                  <div className="flex items-center gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                        {isRtl ? 'تعيين الدور:' : 'Assigned Role:'}
                      </label>
                      <select
                        value={newSelectedRole}
                        onChange={e => setNewSelectedRole(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-[#010736] font-bold rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#010736]"
                      >
                        {roles.map(r => (
                          <option key={r.id} value={r.name} className="bg-white text-slate-900">
                            {r.display_name || r.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleSaveAccess}
                      disabled={savingOverrides}
                      className="flex items-center gap-1.5 bg-[#010736] hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-xs self-end disabled:opacity-50"
                    >
                      <Save size={14} />
                      <span>{savingOverrides ? (isRtl ? 'حفظ...' : 'Saving...') : (isRtl ? 'حفظ الصلاحيات' : 'Save Overrides')}</span>
                    </button>
                  </div>
                </div>

                {successMsg && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle size={14} className="text-rose-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              {/* Effective Resolution Formula Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* 1. Base Role */}
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    1. {isRtl ? 'صلاحيات الدور' : 'Role Base'}
                  </div>
                  <div className="text-xl font-bold text-sky-600 mt-1">
                    {userAccess?.role_permissions?.length || 0}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                    {isRtl ? 'موروثة من الدور' : 'Inherited from role'}
                  </div>
                </div>

                {/* 2. Additional (Granted) */}
                <div className="bg-white border border-emerald-200 p-4 rounded-xl shadow-xs">
                  <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                    2. {isRtl ? 'إضافية ممنوحة' : '+ Additional'}
                  </div>
                  <div className="text-xl font-bold text-emerald-600 mt-1">
                    {additionalPerms.length}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                    {isRtl ? 'استثناءات منح' : 'User-specific grants'}
                  </div>
                </div>

                {/* 3. Denied */}
                <div className="bg-white border border-rose-200 p-4 rounded-xl shadow-xs">
                  <div className="text-[10px] text-rose-700 font-bold uppercase tracking-wider">
                    3. {isRtl ? 'صلاحيات محظورة' : '- Denied'}
                  </div>
                  <div className="text-xl font-bold text-rose-600 mt-1">
                    {deniedPerms.length}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                    {isRtl ? 'استثناءات حظر' : 'Explicit denials'}
                  </div>
                </div>

                {/* 4. Effective */}
                <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl shadow-xs">
                  <div className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">
                    = {isRtl ? 'الصلاحيات الفعلية' : 'Effective'}
                  </div>
                  <div className="text-xl font-bold text-amber-600 mt-1">
                    {userAccess?.effective_permissions?.length || 0}
                  </div>
                  <div className="text-[10px] text-amber-700 mt-0.5 font-medium">
                    {isRtl ? 'المعتمدة بالخادم' : 'Server authoritative'}
                  </div>
                </div>
              </div>

              {/* Add Override Form */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3 shadow-xs">
                <div className="font-bold text-xs text-[#010736]">
                  {isRtl ? 'إضافة استثناء لصلاحية محددة:' : 'Add Permission Override:'}
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <select
                    value={selectedPermToAdd}
                    onChange={e => setSelectedPermToAdd(e.target.value)}
                    className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#010736]"
                  >
                    <option value="">{isRtl ? '-- اختر الصلاحية من قاعدة البيانات --' : '-- Select permission --'}</option>
                    {allPermissions.map(p => (
                      <option key={p.id} value={p.name}>
                        {p.name} ({p.display_name}) - [{p.scope}]
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleGrantPermission(selectedPermToAdd)}
                      disabled={!selectedPermToAdd}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition disabled:opacity-40"
                    >
                      <Plus size={13} />
                      <span>{isRtl ? 'منح إضافي' : 'Grant (+)'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDenyPermission(selectedPermToAdd)}
                      disabled={!selectedPermToAdd}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold transition disabled:opacity-40"
                    >
                      <Ban size={13} />
                      <span>{isRtl ? 'حظر واستثناء' : 'Deny (-)'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Overrides Table: Additional & Denied */}
              {(additionalPerms.length > 0 || deniedPerms.length > 0) && (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden p-4 space-y-3 shadow-xs">
                  <div className="text-xs font-bold text-[#010736]">
                    {isRtl ? 'قائمة الاستثناءات المخصصة لهذا المستخدم:' : 'Current User Overrides:'}
                  </div>

                  <div className="space-y-2">
                    {additionalPerms.map(perm => (
                      <div
                        key={perm}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                            {isRtl ? 'ممنوحة' : 'GRANTED (+)'}
                          </span>
                          <span className="font-mono text-slate-800 font-semibold">{perm}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRestorePermission(perm)}
                          className="text-slate-500 hover:text-slate-700 p-1 text-[11px] flex items-center gap-1 font-semibold"
                        >
                          <RotateCcw size={12} />
                          <span>{isRtl ? 'إلغاء الاستثناء' : 'Restore'}</span>
                        </button>
                      </div>
                    ))}

                    {deniedPerms.map(perm => (
                      <div
                        key={perm}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded text-[10px]">
                            {isRtl ? 'محظورة' : 'DENIED (-)'}
                          </span>
                          <span className="font-mono text-slate-800 font-semibold">{perm}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRestorePermission(perm)}
                          className="text-slate-500 hover:text-slate-700 p-1 text-[11px] flex items-center gap-1 font-semibold"
                        >
                          <RotateCcw size={12} />
                          <span>{isRtl ? 'إلغاء الاستثناء' : 'Restore'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Effective Permissions Pill Grid */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#010736] flex items-center gap-2">
                    <ShieldCheck size={16} className="text-amber-500" />
                    <span>{isRtl ? 'الصلاحيات الفعلية المعتمدة لهذا المستخدم (Effective Permissions)' : 'Computed Effective Permissions'}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {userAccess?.effective_permissions?.length || 0}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 p-1">
                  {(userAccess?.effective_permissions || []).map((perm: string) => {
                    const isAdditional = additionalPerms.includes(perm);
                    return (
                      <span
                        key={perm}
                        className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${
                          isAdditional
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
                            : 'bg-slate-50 text-slate-700 border-slate-200 font-medium'
                        }`}
                      >
                        {perm} {isAdditional ? '★' : ''}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserAccess;
