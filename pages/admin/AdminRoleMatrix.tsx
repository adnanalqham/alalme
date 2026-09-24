import React, { useState, useEffect } from 'react';
import {
  Grid, Check, CheckSquare, Square, Save, RefreshCw, Shield,
  Search, Sliders, CheckCircle2, AlertCircle, Lock
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useLanguage } from '../../context/LanguageContext';

const AdminRoleMatrix: React.FC = () => {
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  const [matrix, setMatrix] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | string>('');
  const [assignedPerms, setAssignedPerms] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const [matrixRes, rolesRes] = await Promise.all([
        adminApi.getPermissionMatrix(),
        adminApi.getRoles(),
      ]);

      setMatrix(matrixRes);
      setRoles(rolesRes.roles || []);

      if (rolesRes.roles && rolesRes.roles.length > 0 && !selectedRoleId) {
        const firstRole = rolesRes.roles[0];
        setSelectedRoleId(firstRole.id);
        loadRolePermissions(firstRole.id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load matrix');
    } finally {
      setLoading(false);
    }
  };

  const loadRolePermissions = async (roleId: number | string) => {
    try {
      const res = await adminApi.getRolePermissions(roleId);
      const perms = new Set<string>((res.permissions || []).map((p: any) => p.name));
      setAssignedPerms(perms);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = (newRoleId: string | number) => {
    setSelectedRoleId(newRoleId);
    loadRolePermissions(newRoleId);
    setSuccessMsg(null);
  };

  const togglePermission = (permName: string) => {
    const next = new Set(assignedPerms);
    if (next.has(permName)) next.delete(permName);
    else next.add(permName);
    setAssignedPerms(next);
  };

  const toggleModule = (moduleKey: string, select: boolean) => {
    if (!matrix?.matrix?.[moduleKey]) return;
    const actionsObj = matrix.matrix[moduleKey];
    const next = new Set(assignedPerms);

    Object.values(actionsObj).forEach((perm: any) => {
      if (select) next.add(perm.name);
      else next.delete(perm.name);
    });

    setAssignedPerms(next);
  };

  const toggleActionAcrossAll = (actionName: string, select: boolean) => {
    if (!matrix?.matrix) return;
    const next = new Set(assignedPerms);

    Object.keys(matrix.matrix).forEach(modKey => {
      const perm = matrix.matrix[modKey]?.[actionName];
      if (perm) {
        if (select) next.add(perm.name);
        else next.delete(perm.name);
      }
    });

    setAssignedPerms(next);
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    try {
      setSaving(true);
      setSuccessMsg(null);
      setErrorMsg(null);
      await adminApi.syncRolePermissions(selectedRoleId, Array.from(assignedPerms));
      setSuccessMsg(isRtl ? 'تم تحديث مصفوفة الصلاحيات للدور بنجاح' : 'Permission matrix updated successfully');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500 mb-3" />
        <p className="text-xs">{isRtl ? 'جاري تحميل مصفوفة الصلاحيات...' : 'Loading matrix...'}</p>
      </div>
    );
  }

  const modules: string[] = matrix?.modules || [];
  const actions: string[] = matrix?.actions || [];
  const currentRole = roles.find(r => String(r.id) === String(selectedRoleId));

  const filteredModules = modules.filter(m =>
    m.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#010736]/10 text-[#010736] rounded-xl border border-[#010736]/20">
            <Grid size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#010736] tracking-tight">
              {isRtl ? 'مصفوفة الصلاحيات التفاعلية (Role Permission Matrix)' : 'Role Permission Matrix'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRtl
                ? 'عرض وتعديل التقاطعات بين الوحدات (Modules) والإجراءات (Actions) وحفظها فورياً في PostgreSQL'
                : 'Interactive grid: Modules vs. Actions with live role assignment and instant backend synchronization'}
            </p>
          </div>
        </div>

        {/* Role Switcher & Save */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="text-xs text-slate-500 font-semibold">{isRtl ? 'الدور المختار:' : 'Role:'}</span>
            <select
              value={selectedRoleId}
              onChange={e => handleRoleChange(e.target.value)}
              className="bg-transparent text-[#010736] font-bold text-xs focus:outline-none"
            >
              {roles.map(r => (
                <option key={r.id} value={r.id} className="bg-white text-slate-900">
                  {r.display_name || r.name} {r.is_system ? '🔒' : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#010736] hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-xs disabled:opacity-50"
          >
            <Save size={15} />
            <span>{saving ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ التعديلات' : 'Save Changes')}</span>
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

      {/* Filter and stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search size={14} className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} text-slate-400`} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isRtl ? 'تصفية أسماء الموديولات...' : 'Filter modules...'}
            className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#010736] ${
              isRtl ? 'pr-8 pl-3' : 'pl-8 pr-3'
            }`}
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          <span>
            {isRtl ? 'الصلاحيات المحددة:' : 'Assigned:'}{' '}
            <strong className="text-amber-600 font-mono">{assignedPerms.size}</strong>
          </span>
          <span>•</span>
          <span>
            {isRtl ? 'إجمالي الموديولات:' : 'Modules:'}{' '}
            <strong className="text-[#010736]">{modules.length}</strong>
          </span>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-h-[650px] scrollbar-thin scrollbar-thumb-slate-200">
          <table className="w-full text-center border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-50 z-20 shadow-xs">
              <tr className="border-b border-slate-200 text-slate-600 font-bold">
                <th className={`py-3.5 px-4 text-start font-bold uppercase tracking-wider text-[#010736] min-w-[180px] sticky ${isRtl ? 'right-0' : 'left-0'} bg-slate-50 z-30 border-e border-slate-200`}>
                  {isRtl ? 'الموديول / الإجراء' : 'Module / Action'}
                </th>
                {actions.map(act => (
                  <th key={act} className="py-3.5 px-2 font-mono uppercase text-[11px] min-w-[70px]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-slate-700">{act}</span>
                      <button
                        type="button"
                        onClick={() => toggleActionAcrossAll(act, true)}
                        className="text-[9px] text-slate-400 hover:text-[#010736] font-semibold"
                        title={isRtl ? `تحديد كافة صلاحيات ${act}` : `Select all ${act}`}
                      >
                        {isRtl ? 'تحديد' : 'All'}
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredModules.map(modKey => {
                const actionsMap = matrix?.matrix?.[modKey] || {};
                const modPermCount = Object.keys(actionsMap).length;
                const modAssignedCount = Object.values(actionsMap).filter((p: any) => assignedPerms.has(p.name)).length;
                const allSelected = modPermCount > 0 && modAssignedCount === modPermCount;

                return (
                  <tr key={modKey} className="hover:bg-slate-50/70 transition">
                    {/* Row header: Module name and row selectors */}
                    <td className={`py-3 px-4 text-start font-bold text-slate-800 sticky ${isRtl ? 'right-0' : 'left-0'} bg-white hover:bg-slate-50 z-10 border-e border-slate-200`}>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="font-mono text-[#010736] uppercase text-xs font-bold">{modKey}</span>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {modAssignedCount}/{modPermCount}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <button
                            type="button"
                            onClick={() => toggleModule(modKey, !allSelected)}
                            className="text-slate-400 hover:text-[#010736] p-1"
                            title={allSelected ? (isRtl ? 'إلغاء تحديد الصف' : 'Deselect row') : (isRtl ? 'تحديد كافة الصف' : 'Select all row')}
                          >
                            {allSelected ? <CheckSquare size={13} className="text-amber-500" /> : <Square size={13} />}
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Action columns */}
                    {actions.map(act => {
                      const perm = actionsMap[act];
                      if (!perm) {
                        return (
                          <td key={act} className="py-2.5 px-2 text-slate-300 select-none">
                            —
                          </td>
                        );
                      }

                      const isChecked = assignedPerms.has(perm.name);

                      return (
                        <td key={act} className="py-2.5 px-2">
                          <button
                            type="button"
                            onClick={() => togglePermission(perm.name)}
                            title={`${perm.display_name || perm.name} (${perm.scope})`}
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center mx-auto transition ${
                              isChecked
                                ? 'bg-amber-500 border-amber-500 text-slate-950 font-bold shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                            }`}
                          >
                            {isChecked ? <Check size={14} strokeWidth={3} /> : null}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminRoleMatrix;
