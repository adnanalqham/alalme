import React, { useState, useEffect } from 'react';
import {
  UserCheck, Store, Building2, Search, RefreshCw, Mail, Phone,
  Shield, CheckCircle2, AlertCircle
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useLanguage } from '../../context/LanguageContext';

const AdminEmployees: React.FC = () => {
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getEmployees({ search });
      setEmployees(res.employees || []);
    } catch (err: any) {
      setStatusMsg(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search]);

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#010736]/10 text-[#010736] rounded-xl border border-[#010736]/20">
            <UserCheck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#010736] tracking-tight">
              {isRtl ? 'سجل موظفي المتاجر (Global Staff Registry)' : 'Shop Employees Registry'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRtl
                ? 'فحص موظفي المتاجر والفروع في المنصة، الصلاحيات الممنوحة لهم، وحالة الحسابات'
                : 'Platform-wide shop staff oversight, role delegation, assigned branches, and active status'}
            </p>
          </div>
        </div>

        <button
          onClick={fetchEmployees}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#010736] hover:bg-slate-50 shadow-xs transition"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} text-slate-400`} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isRtl ? 'بحث باسم الموظف أو البريد أو المتجر...' : 'Search employee, email or shop...'}
            className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-xs text-slate-800 focus:outline-none focus:border-[#010736] ${
              isRtl ? 'pr-8 pl-3' : 'pl-8 pr-3'
            }`}
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          {isRtl ? `إجمالي الموظفين: ${employees.length}` : `Total staff: ${employees.length}`}
        </div>
      </div>

      {/* Employees Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500 mb-3" />
          <p className="text-xs">{isRtl ? 'جاري تحميل الموظفين...' : 'Loading staff directory...'}</p>
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-white border border-slate-200 p-16 text-center rounded-2xl text-slate-500 shadow-xs">
          <UserCheck size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-semibold">{isRtl ? 'لم يتم العثور على أي موظف مطابق' : 'No employees found.'}</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4 text-start">{isRtl ? 'الموظف' : 'Employee'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'المتجر التابع له' : 'Shop'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'الفرع' : 'Branch'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'الدور' : 'Role'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'الصلاحيات الممنوحة' : 'Permissions'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'الحالة' : 'Status'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'تاريخ الانضمام' : 'Joined'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#010736]">{emp.user?.full_name || emp.user?.email || '—'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{emp.user?.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Store size={12} className="text-amber-600" />
                        <span>{emp.shop?.name_ar || emp.shop?.name_en || '—'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={12} className="text-slate-400" />
                        <span>{emp.branch?.name_ar || emp.branch?.name_en || (isRtl ? 'المركز الرئيسي' : 'Main Branch')}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] bg-sky-50 border border-sky-200 text-sky-800 font-semibold px-2 py-0.5 rounded">
                        {emp.role || 'EMPLOYEE'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(emp.permissions || []).slice(0, 3).map((p: string) => (
                          <span key={p} className="text-[9px] font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded border border-slate-200">
                            {p}
                          </span>
                        ))}
                        {(emp.permissions || []).length > 3 && (
                          <span className="text-[9px] text-amber-700 font-bold bg-amber-50 px-1 py-0.5 rounded border border-amber-200">
                            +{(emp.permissions || []).length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          emp.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(emp.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployees;
