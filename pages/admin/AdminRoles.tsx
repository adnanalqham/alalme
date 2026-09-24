import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, Plus, Copy, Trash2, Edit3, KeyRound, Users, CheckCircle,
  AlertCircle, Search, ShieldCheck, Lock, ExternalLink, RefreshCw
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useLanguage } from '../../context/LanguageContext';

interface RoleItem {
  id: number | string;
  name: string;
  display_name: string;
  description: string;
  status: string;
  is_system: boolean;
  users_count: number;
  permissions_count: number;
  created_at: string;
  updated_at: string;
}

const AdminRoles: React.FC = () => {
  const { language } = useLanguage();
  const isRtl = language === 'ar';
  const navigate = useNavigate();

  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Create role modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getRoles();
      setRoles(res.roles || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDuplicate = async (id: string | number) => {
    try {
      setActionSuccess(null);
      const res = await adminApi.duplicateRole(id);
      setActionSuccess(isRtl ? 'تم نسخ الدور بنجاح' : 'Role duplicated successfully');
      fetchRoles();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (role: RoleItem) => {
    if (role.is_system) {
      alert(isRtl ? 'لا يمكن حذف الأدوار الأساسية للنظام' : 'System roles cannot be deleted');
      return;
    }
    if (!window.confirm(isRtl ? `هل أنت متأكد من حذف الدور ${role.display_name}؟` : `Delete role ${role.display_name}?`)) {
      return;
    }
    try {
      await adminApi.deleteRole(role.id);
      fetchRoles();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDisplayName.trim()) return;

    try {
      setCreating(true);
      const res = await adminApi.createRole({
        name: newName.trim(),
        display_name: newDisplayName.trim(),
        description: newDescription.trim(),
        status: 'ACTIVE',
      });
      setShowCreateModal(false);
      setNewName('');
      setNewDisplayName('');
      setNewDescription('');
      fetchRoles();
      navigate(`/admin/access/roles/${res.role.id}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  const filteredRoles = roles.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.display_name && r.display_name.toLowerCase().includes(search.toLowerCase())) ||
    (r.description && r.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-slate-800">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#010736]/10 text-[#010736] rounded-xl border border-[#010736]/20">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#010736] tracking-tight">
                {isRtl ? 'إدارة الأدوار والصلاحيات (Roles)' : 'Roles & Access Control'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRtl ? 'تعريف الأدوار، تعيين الصلاحيات، وحماية أدوار النظام المحمية' : 'Define platform roles, map granular permissions, and safeguard protected roles'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRoles}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#010736] hover:bg-slate-50 shadow-xs transition"
            title={isRtl ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-[#010736] hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl transition shadow-xs text-sm"
          >
            <Plus size={16} />
            <span>{isRtl ? 'إنشاء دور جديد' : 'Create Role'}</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} text-slate-400`} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isRtl ? 'بحث باسم الدور أو الوصف...' : 'Search role name or description...'}
            className={`w-full bg-white border border-slate-200 rounded-xl py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#010736] shadow-xs transition ${
              isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
            }`}
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          {isRtl ? `إجمالي الأدوار: ${roles.length}` : `Total roles: ${roles.length}`}
        </div>
      </div>

      {/* Roles Grid / Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500 mb-3" />
          <p className="text-xs">{isRtl ? 'جاري تحميل الأدوار...' : 'Loading roles...'}</p>
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 text-center rounded-2xl text-slate-500 shadow-xs">
          <p className="text-sm">{isRtl ? 'لم يتم العثور على أي دور' : 'No roles found.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoles.map(role => (
            <div
              key={role.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-300 shadow-xs transition"
            >
              <div>
                {/* Header badges */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-[#010736] text-base">
                      {role.display_name || role.name}
                    </h3>
                    <div className="font-mono text-xs text-amber-600 font-semibold mt-0.5">{role.name}</div>
                  </div>
                  {role.is_system ? (
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                      <Lock size={10} />
                      {isRtl ? 'نظام محمي' : 'System'}
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-full">
                      {isRtl ? 'مخصص' : 'Custom'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px] mb-4">
                  {role.description || (isRtl ? 'لا يوجد وصف محدد لهذا الدور' : 'No description provided.')}
                </p>

                {/* Counters */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-sky-600" />
                    <div>
                      <div className="text-[10px] text-slate-500">{isRtl ? 'المستخدمون' : 'Users'}</div>
                      <div className="text-xs font-bold text-[#010736]">{role.users_count || 0}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <KeyRound size={14} className="text-amber-600" />
                    <div>
                      <div className="text-[10px] text-slate-500">{isRtl ? 'الصلاحيات' : 'Permissions'}</div>
                      <div className="text-xs font-bold text-[#010736]">{role.permissions_count || 0}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  to={`/admin/access/roles/${role.id}`}
                  className="flex-1 text-center bg-slate-50 hover:bg-slate-100 text-[#010736] text-xs font-bold py-2 rounded-xl border border-slate-200 transition"
                >
                  {isRtl ? 'إدارة الصلاحيات' : 'Manage Permissions'}
                </Link>

                <button
                  onClick={() => handleDuplicate(role.id)}
                  title={isRtl ? 'نسخ الدور' : 'Duplicate Role'}
                  className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:text-[#010736] hover:bg-slate-100 border border-slate-200 transition"
                >
                  <Copy size={14} />
                </button>

                {!role.is_system && (
                  <button
                    onClick={() => handleDelete(role)}
                    title={isRtl ? 'حذف الدور' : 'Delete Role'}
                    className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:text-rose-700 hover:bg-rose-100 border border-rose-100 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#010736]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-[#010736] text-base">
                {isRtl ? 'إنشاء دور جديد (New Role)' : 'Create New Role'}
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <AlertCircle size={18} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'الرمز البرمجي للدور (Machine Name)' : 'Machine Name'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. inventory_manager"
                  value={newName}
                  onChange={e => setNewName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-[#010736]"
                />
                <span className="text-[10px] text-slate-400">
                  {isRtl ? 'حروف إنجليزية صغيرة مع شرطات سفلية فقط' : 'Lowercase letters and underscores only'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'الاسم الظاهر (Display Name)' : 'Display Name'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={isRtl ? 'مثال: مدير المخزون' : 'e.g. Inventory Manager'}
                  value={newDisplayName}
                  onChange={e => setNewDisplayName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#010736]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'الوصف' : 'Description'}
                </label>
                <textarea
                  rows={3}
                  placeholder={isRtl ? 'مسؤول عن إدارة المخزون وحركات المخزون والتحويلات...' : 'Responsible for inventory oversight and stock adjustments...'}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#010736]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-700 font-semibold"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-[#010736] hover:bg-slate-800 text-white font-bold text-xs transition disabled:opacity-50"
                >
                  {creating ? (isRtl ? 'جاري الحفظ...' : 'Creating...') : (isRtl ? 'إنشاء ومتابعة الصلاحيات' : 'Create & Assign Permissions')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoles;
