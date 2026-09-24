import React, { useState, useEffect } from 'react';
import { KeyRound, Search, Filter, Shield, Globe, Store, Building2, User, Layers, RefreshCw } from 'lucide-react';
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
  is_system: boolean;
}

const SCOPE_BADGES: Record<string, { labelAr: string; labelEn: string; color: string; icon: any }> = {
  PLATFORM: { labelAr: 'المنصة كاملة', labelEn: 'Platform', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', icon: Globe },
  SHOP: { labelAr: 'المتجر', labelEn: 'Shop', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: Store },
  BRANCH: { labelAr: 'الفرع', labelEn: 'Branch', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: Building2 },
  OWN: { labelAr: 'الخاص فقط', labelEn: 'Own Resources', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: User },
  ASSIGNED: { labelAr: 'المعين له', labelEn: 'Assigned', color: 'bg-slate-800 text-slate-300 border-slate-700', icon: Layers },
};

const AdminPermissions: React.FC = () => {
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [grouped, setGrouped] = useState<Record<string, PermissionItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedScope, setSelectedScope] = useState<string>('all');

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getPermissions();
      setPermissions(res.permissions || []);
      setGrouped(res.grouped || {});
    } catch (err: any) {
      console.error('Failed to load permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const modules = Object.keys(grouped);

  const filteredPermissions = permissions.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.display_name && p.display_name.toLowerCase().includes(search.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));

    const matchesModule = selectedModule === 'all' || p.module === selectedModule;
    const matchesScope = selectedScope === 'all' || p.scope === selectedScope;

    return matchesSearch && matchesModule && matchesScope;
  });

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#010736]/10 text-[#010736] rounded-xl border border-[#010736]/20">
            <KeyRound size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#010736] tracking-tight">
              {isRtl ? 'دليل صلاحيات النظام (System Permissions)' : 'Permission Registry'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRtl
                ? 'كافة الصلاحيات المعرفة في قاعدة بيانات PostgreSQL مع النطاق والموديول المعني'
                : 'All PostgreSQL-backed system permissions with strict resource scoping and actions'}
            </p>
          </div>
        </div>

        <button
          onClick={fetchPermissions}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#010736] hover:bg-slate-50 shadow-xs transition self-start sm:self-auto"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} text-slate-400`} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isRtl ? 'بحث باسم الصلاحية أو الوصف...' : 'Search permission name or description...'}
            className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-xs text-slate-800 focus:outline-none focus:border-[#010736] ${
              isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
            }`}
          />
        </div>

        {/* Module Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{isRtl ? 'الموديول:' : 'Module:'}</span>
          <select
            value={selectedModule}
            onChange={e => setSelectedModule(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 uppercase focus:outline-none focus:border-[#010736]"
          >
            <option value="all">{isRtl ? 'الكل' : 'All Modules'}</option>
            {modules.map(m => (
              <option key={m} value={m}>
                {m} ({grouped[m]?.length})
              </option>
            ))}
          </select>
        </div>

        {/* Scope Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{isRtl ? 'النطاق:' : 'Scope:'}</span>
          <select
            value={selectedScope}
            onChange={e => setSelectedScope(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#010736]"
          >
            <option value="all">{isRtl ? 'كافة النطاقات' : 'All Scopes'}</option>
            <option value="PLATFORM">PLATFORM</option>
            <option value="SHOP">SHOP</option>
            <option value="BRANCH">BRANCH</option>
            <option value="OWN">OWN</option>
            <option value="ASSIGNED">ASSIGNED</option>
          </select>
        </div>
      </div>

      {/* Permissions Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500 mb-3" />
          <p className="text-xs">{isRtl ? 'جاري تحميل الصلاحيات...' : 'Loading permissions...'}</p>
        </div>
      ) : filteredPermissions.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 text-center rounded-2xl text-slate-500 shadow-xs">
          <p className="text-sm">{isRtl ? 'لم يتم العثور على أي صلاحيات مطابقة' : 'No matching permissions found.'}</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4 text-start">#</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'الصلاحية (Name)' : 'Name'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'الاسم الظاهر' : 'Display Name'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'الوحدة (Module)' : 'Module'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'الإجراء (Action)' : 'Action'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'النطاق (Scope)' : 'Scope'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'الوصف' : 'Description'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPermissions.map(p => {
                  const scopeMeta = SCOPE_BADGES[p.scope] || SCOPE_BADGES.PLATFORM;
                  const ScopeIcon = scopeMeta.icon;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 text-slate-400 font-mono">{p.id}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-amber-700 font-semibold">{p.name}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#010736]">{p.display_name}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono uppercase text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
                          {p.module}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono uppercase text-[10px] bg-sky-50 px-2 py-0.5 rounded text-sky-800 border border-sky-200 font-semibold">
                          {p.action}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${scopeMeta.color}`}>
                          <ScopeIcon size={10} />
                          {p.scope}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={p.description}>
                        {p.description || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex justify-between font-medium">
            <span>{isRtl ? `عرض ${filteredPermissions.length} من إجمالي ${permissions.length}` : `Showing ${filteredPermissions.length} of ${permissions.length}`}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPermissions;
