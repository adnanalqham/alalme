import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Shield, KeyRound, Users, ArrowLeft, ArrowRight, Save, Check, Lock,
  Copy, Edit2, AlertCircle, CheckCircle2, Search, Sliders
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useLanguage } from '../../context/LanguageContext';

interface PermissionItem {
  id: number;
  name: string;
  display_name: string;
  description: string;
  module: string;
  action: string;
  scope: string;
}

const AdminRoleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  const [role, setRole] = useState<any>(null);
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, PermissionItem[]>>({});
  const [allPermissions, setAllPermissions] = useState<PermissionItem[]>([]);
  const [assignedKeys, setAssignedKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');

  // Edit Role Info Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const fetchRoleAndPermissions = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setErrorMsg(null);

      const [roleRes, permRes] = await Promise.all([
        adminApi.getRole(id),
        adminApi.getPermissions(),
      ]);

      setRole(roleRes.role);
      setEditDisplayName(roleRes.role.display_name || '');
      setEditDescription(roleRes.role.description || '');

      const currentPerms = new Set<string>(
        (roleRes.permissions || []).map((p: any) => p.name)
      );
      setAssignedKeys(currentPerms);

      setGroupedPermissions(permRes.grouped || {});
      setAllPermissions(permRes.permissions || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load role details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoleAndPermissions();
  }, [id]);

  const togglePermission = (permName: string) => {
    const next = new Set(assignedKeys);
    if (next.has(permName)) {
      next.delete(permName);
    } else {
      next.add(permName);
    }
    setAssignedKeys(next);
  };

  const toggleAllInModule = (moduleKey: string, select: boolean) => {
    const perms = groupedPermissions[moduleKey] || [];
    const next = new Set(assignedKeys);
    perms.forEach(p => {
      if (select) next.add(p.name);
      else next.delete(p.name);
    });
    setAssignedKeys(next);
  };

  const handleSavePermissions = async () => {
    if (!id) return;
    try {
      setSaving(true);
      setSuccessMsg(null);
      setErrorMsg(null);
      await adminApi.syncRolePermissions(id, Array.from(assignedKeys));
      setSuccessMsg(isRtl ? 'تم حفظ صلاحيات الدور بنجاح' : 'Permissions saved successfully');
      fetchRoleAndPermissions();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setSaving(true);
      await adminApi.updateRole(id, {
        display_name: editDisplayName,
        description: editDescription,
      });
      setShowEditModal(false);
      fetchRoleAndPermissions();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500 mb-3" />
        <p className="text-xs">{isRtl ? 'جاري تحميل تفاصيل الدور...' : 'Loading role...'}</p>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="p-12 text-center text-slate-500">
        <p>{isRtl ? 'الدور غير موجود' : 'Role not found'}</p>
        <Link to="/admin/access/roles" className="text-amber-400 text-xs mt-2 inline-block">
          {isRtl ? 'العودة لقائمة الأدوار' : 'Back to roles'}
        </Link>
      </div>
    );
  }

  const modules = Object.keys(groupedPermissions);

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/access/roles"
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-[#010736] font-medium transition"
        >
          {isRtl ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
          <span>{isRtl ? 'الرجوع إلى قائمة الأدوار' : 'Back to Roles'}</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <Edit2 size={13} />
            <span>{isRtl ? 'تعديل البيانات' : 'Edit Info'}</span>
          </button>
          <button
            onClick={handleSavePermissions}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#010736] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50"
          >
            <Save size={15} />
            <span>{saving ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ الصلاحيات' : 'Save Permissions')}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Role Overview Card */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-[#010736] tracking-tight">{role.display_name || role.name}</h1>
              <span className="font-mono text-xs bg-slate-100 border border-slate-200 text-amber-600 font-semibold px-2.5 py-0.5 rounded-full">
                {role.name}
              </span>
              {role.is_system && (
                <span className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold px-2 py-0.5 rounded-full">
                  <Lock size={11} />
                  {isRtl ? 'نظام محمي' : 'System Role'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">{role.description}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-center">
              <div className="text-[10px] text-slate-500 font-medium">{isRtl ? 'الصلاحيات النشطة' : 'Active Permissions'}</div>
              <div className="text-lg font-bold text-amber-600">{assignedKeys.size}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-center">
              <div className="text-[10px] text-slate-500 font-medium">{isRtl ? 'المستخدمون الحاليون' : 'Assigned Users'}</div>
              <div className="text-lg font-bold text-sky-600">{role.users_count || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Module Selector & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedModule('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedModule === 'all'
                ? 'bg-[#010736] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-[#010736] border border-slate-200'
            }`}
          >
            {isRtl ? 'كافة الوحدات' : 'All Modules'} ({allPermissions.length})
          </button>
          {modules.map(mod => (
            <button
              key={mod}
              onClick={() => setSelectedModule(mod)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap uppercase transition ${
                selectedModule === mod
                  ? 'bg-[#010736] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-[#010736] border border-slate-200'
              }`}
            >
              {mod} ({groupedPermissions[mod]?.length || 0})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} text-slate-400`} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isRtl ? 'بحث في الصلاحيات...' : 'Search permissions...'}
            className={`w-full bg-white border border-slate-200 rounded-xl py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#010736] shadow-xs ${
              isRtl ? 'pr-8 pl-3' : 'pl-8 pr-3'
            }`}
          />
        </div>
      </div>

      {/* Permissions List Grouped by Module */}
      <div className="space-y-4">
        {modules
          .filter(mod => selectedModule === 'all' || selectedModule === mod)
          .map(modKey => {
            const perms = (groupedPermissions[modKey] || []).filter(p =>
              p.name.toLowerCase().includes(search.toLowerCase()) ||
              (p.display_name && p.display_name.toLowerCase().includes(search.toLowerCase())) ||
              (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
            );

            if (perms.length === 0) return null;

            const allSelectedInMod = perms.every(p => assignedKeys.has(p.name));

            return (
              <div key={modKey} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                {/* Module Bar */}
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs uppercase font-bold text-[#010736] tracking-wider">
                      {modKey}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      ({perms.filter(p => assignedKeys.has(p.name)).length} / {perms.length} {isRtl ? 'مفعل' : 'enabled'})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleAllInModule(modKey, !allSelectedInMod)}
                      className="text-[11px] text-slate-500 hover:text-[#010736] font-semibold transition"
                    >
                      {allSelectedInMod ? (isRtl ? 'إلغاء تحديد الكل' : 'Deselect All') : (isRtl ? 'تحديد الكل' : 'Select All')}
                    </button>
                  </div>
                </div>

                {/* Permissions Grid */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {perms.map(p => {
                    const isChecked = assignedKeys.has(p.name);
                    return (
                      <div
                        key={p.id}
                        onClick={() => togglePermission(p.name)}
                        className={`cursor-pointer rounded-xl p-3 border transition flex items-start justify-between gap-3 ${
                          isChecked
                            ? 'bg-amber-500/10 border-amber-500/40 text-slate-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-[#010736]">
                              {p.display_name || p.name}
                            </span>
                            <span className="text-[9px] font-mono uppercase bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                              {p.scope || 'PLATFORM'}
                            </span>
                          </div>
                          <div className="font-mono text-[10px] text-slate-400 truncate mt-0.5">
                            {p.name}
                          </div>
                          {p.description && (
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{p.description}</p>
                          )}
                        </div>

                        <div
                          className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition shrink-0 ${
                            isChecked
                              ? 'bg-amber-500 border-amber-500 text-slate-950'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>

      {/* Edit Role Info Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-[#010736]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-[#010736] text-base">
              {isRtl ? 'تعديل معلومات الدور' : 'Edit Role Info'}
            </h3>

            <form onSubmit={handleUpdateInfo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'الاسم الظاهر' : 'Display Name'}
                </label>
                <input
                  type="text"
                  required
                  value={editDisplayName}
                  onChange={e => setEditDisplayName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#010736]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'الوصف' : 'Description'}
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#010736]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-700 font-semibold"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#010736] hover:bg-slate-800 text-white font-bold text-xs transition"
                >
                  {isRtl ? 'حفظ التعديل' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoleDetail;
