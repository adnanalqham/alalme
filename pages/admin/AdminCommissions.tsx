import React, { useState, useEffect } from 'react';
import {
  Percent, Plus, Edit2, Trash2, Store, Calendar, CheckCircle2,
  AlertCircle, RefreshCw, DollarSign
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useLanguage } from '../../context/LanguageContext';

const AdminCommissions: React.FC = () => {
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  const [commissions, setCommissions] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form
  const [selectedShopId, setSelectedShopId] = useState('');
  const [commissionType, setCommissionType] = useState('PERCENTAGE');
  const [commissionValue, setCommissionValue] = useState<number>(5);
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [effectiveTo, setEffectiveTo] = useState('');
  const [notes, setNotes] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, sRes] = await Promise.all([
        adminApi.getCommissions(),
        adminApi.getShops(),
      ]);
      setCommissions(cRes.commissions || []);
      setShops(sRes.shops || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShopId) return;

    try {
      setSaving(true);
      setStatusMsg(null);
      await adminApi.createCommission({
        shop_id: selectedShopId,
        type: commissionType,
        value: commissionValue,
        effective_from: effectiveFrom || null,
        effective_to: effectiveTo || null,
        notes: notes.trim(),
        status: 'ACTIVE',
      });
      setShowModal(false);
      setStatusMsg({ type: 'success', text: isRtl ? 'تم تحديد نسبة عمولة المتجر وتوثيقها بسجل التدقيق' : 'Shop commission rule saved successfully.' });
      fetchData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save commission' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm(isRtl ? 'هل أنت متأكد من حذف قاعدة العمولة؟' : 'Delete commission rule?')) return;
    try {
      await adminApi.deleteCommission(id);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#010736]/10 text-[#010736] rounded-xl border border-[#010736]/20">
            <Percent size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#010736] tracking-tight">
              {isRtl ? 'إدارة عمولات المتاجر (Shop Commissions)' : 'Shop Commission Management'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRtl
                ? 'تحديد وإدارة نسب ومبالغ عمولات المبيعات لكل متجر بشكل مخصص مع تاريخ الفعالية'
                : 'Configure platform commission models (percentage or fixed per order) per merchant with audit'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#010736] hover:bg-slate-50 shadow-xs transition"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#010736] hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-xs"
          >
            <Plus size={16} />
            <span>{isRtl ? 'إضافة قاعدة عمولة' : 'Add Commission Rule'}</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusMsg.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertCircle size={16} className="text-rose-600" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Commissions Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500 mb-3" />
          <p className="text-xs">{isRtl ? 'جاري تحميل العمولات...' : 'Loading commissions...'}</p>
        </div>
      ) : commissions.length === 0 ? (
        <div className="bg-white border border-slate-200 p-16 text-center rounded-2xl text-slate-500 shadow-xs">
          <Percent size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-semibold">{isRtl ? 'لم يتم تحديد أي قواعد عمولة خاصة حتى الآن' : 'No custom commission rules configured yet.'}</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4 text-start">{isRtl ? 'المتجر' : 'Shop'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'نوع العمولة' : 'Type'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'القيمة' : 'Value'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'الفترة الفعالة' : 'Effective Dates'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'الحالة' : 'Status'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'ملاحظات' : 'Notes'}</th>
                  <th className="py-3 px-4 text-end">{isRtl ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commissions.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#010736]">{c.shop?.name_ar || c.shop?.name_en || '—'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.shop_id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-amber-700 font-bold">
                        {c.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 text-sm">
                      {c.type === 'PERCENTAGE' ? `${c.value}%` : `$${c.value}`}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {c.effective_from || 'Always'} → {c.effective_to || 'Open'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                        {c.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {c.notes || '—'}
                    </td>
                    <td className="py-3 px-4 text-end">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Commission Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#010736]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-[#010736] text-base">
              {isRtl ? 'إضافة قاعدة عمولة لمتجر' : 'Add Shop Commission Rule'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'اختر المتجر:' : 'Select Shop:'} *
                </label>
                <select
                  required
                  value={selectedShopId}
                  onChange={e => setSelectedShopId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#010736]"
                >
                  <option value="">{isRtl ? '-- حدد المتجر --' : '-- Choose Shop --'}</option>
                  {shops.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name_ar || s.name_en} ({s.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'نوع العمولة:' : 'Commission Type:'}
                  </label>
                  <select
                    value={commissionType}
                    onChange={e => setCommissionType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#010736]"
                  >
                    <option value="PERCENTAGE">{isRtl ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
                    <option value="FIXED">{isRtl ? 'مبلغ ثابت (Fixed)' : 'Fixed Amount ($)'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'القيمة:' : 'Value:'} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={commissionType === 'PERCENTAGE' ? '100' : '10000'}
                    required
                    value={commissionValue}
                    onChange={e => setCommissionValue(parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#010736]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'ملاحظات:' : 'Notes:'}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={isRtl ? 'سبب أو تفاصيل الاتفاق...' : 'Details or reason...'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#010736]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-700 font-semibold"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#010736] hover:bg-slate-800 text-white font-bold text-xs transition disabled:opacity-50"
                >
                  {isRtl ? 'حفظ العمولة' : 'Save Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCommissions;
