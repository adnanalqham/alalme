import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, XCircle, Store, Phone, MapPin, Calendar, User,
  FileText, AlertCircle, RefreshCw, Eye, Check, X
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useLanguage } from '../../context/LanguageContext';

const AdminShopApprovals: React.FC = () => {
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  const [pendingShops, setPendingShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getShopApprovals();
      setPendingShops(res.shops || []);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to load approvals' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (shop: any) => {
    if (!window.confirm(isRtl ? `هل أنت متأكد من اعتماد متجر ${shop.name_ar || shop.name_en}؟` : `Approve shop ${shop.name_en}?`)) {
      return;
    }
    try {
      setActionLoading(true);
      setStatusMsg(null);
      await adminApi.approveShop(shop.id);
      setStatusMsg({ type: 'success', text: isRtl ? 'تمت الموافقة على المتجر وتفعيل الحساب بنجاح' : 'Shop approved and account activated.' });
      fetchPending();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Approval failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShop || !rejectReason.trim()) return;

    try {
      setActionLoading(true);
      setStatusMsg(null);
      await adminApi.rejectShop(selectedShop.id, rejectReason.trim());
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedShop(null);
      setStatusMsg({ type: 'success', text: isRtl ? 'تم رفض طلب انضمام المتجر وإشعار المالك' : 'Shop registration rejected with audit log.' });
      fetchPending();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Rejection failed' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#010736]/10 text-[#010736] rounded-xl border border-[#010736]/20">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#010736] tracking-tight">
              {isRtl ? 'مركز اعتماد المتاجر (Shop Approvals Queue)' : 'Shop Approvals Queue'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRtl
                ? 'مراجعة بيانات المتاجر المتقدمة، التحقق من السجل التجاري، والاعتماد أو الرفض مع سبب محدد'
                : 'Review merchant applications, verify commercial registration, approve or reject with audit trail'}
            </p>
          </div>
        </div>

        <button
          onClick={fetchPending}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#010736] hover:bg-slate-50 shadow-xs transition"
        >
          <RefreshCw size={16} />
        </button>
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

      {/* Approvals List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500 mb-3" />
          <p className="text-xs">{isRtl ? 'جاري فحص الطلبات قيد الانتظار...' : 'Loading pending approvals...'}</p>
        </div>
      ) : pendingShops.length === 0 ? (
        <div className="bg-white border border-slate-200 p-16 text-center rounded-2xl text-slate-500 shadow-xs">
          <Store size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-bold text-[#010736]">{isRtl ? 'لا توجد طلبات انضمام جديدة قيد الانتظار حالياً' : 'No pending shop applications at this time.'}</p>
          <p className="text-xs text-slate-500 mt-1">{isRtl ? 'كافة طلبات المتاجر معتمدة أو تمت معالجتها' : 'All applications have been reviewed.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingShops.map(shop => (
            <div
              key={shop.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-300 shadow-xs transition"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-[#010736] text-base">
                      {shop.name_ar || shop.name_en}
                    </h3>
                    <div className="font-mono text-xs text-slate-400">{shop.name_en}</div>
                  </div>
                  <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    PENDING APPROVAL
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2 text-slate-500">
                    <User size={13} className="text-sky-600 shrink-0" />
                    <span>{isRtl ? 'المالك:' : 'Owner:'}</span>
                    <strong className="text-slate-800">{shop.owner?.full_name || shop.owner?.email || '—'}</strong>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500">
                    <Phone size={13} className="text-emerald-600 shrink-0" />
                    <span>{isRtl ? 'الهاتف:' : 'Phone:'}</span>
                    <strong className="text-slate-800" dir="ltr">{shop.phone || shop.owner?.phone || '—'}</strong>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin size={13} className="text-amber-600 shrink-0" />
                    <span>{isRtl ? 'المدينة:' : 'City:'}</span>
                    <strong className="text-slate-800">{shop.city?.name_ar || shop.city?.name_en || shop.city_id || '—'}</strong>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500">
                    <FileText size={13} className="text-purple-600 shrink-0" />
                    <span>{isRtl ? 'السجل التجاري:' : 'CR Number:'}</span>
                    <strong className="text-slate-800 font-mono">{shop.cr_number || '—'}</strong>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar size={13} className="text-slate-400 shrink-0" />
                    <span>{isRtl ? 'تاريخ التقديم:' : 'Submitted:'}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{new Date(shop.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setSelectedShop(shop);
                    setShowRejectModal(true);
                  }}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  <XCircle size={14} />
                  <span>{isRtl ? 'رفض الطلب' : 'Reject'}</span>
                </button>

                <button
                  onClick={() => handleApprove(shop)}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-xs disabled:opacity-50"
                >
                  <CheckCircle2 size={14} />
                  <span>{isRtl ? 'موافقة واعتماد' : 'Approve'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedShop && (
        <div className="fixed inset-0 z-50 bg-[#010736]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-[#010736] text-base">
              {isRtl ? `رفض طلب متجر: ${selectedShop.name_ar || selectedShop.name_en}` : `Reject Shop Application`}
            </h3>

            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'سبب الرفض (إلزامي للتدقيق وإشعار المالك):' : 'Rejection Reason (Required):'} *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={isRtl ? 'مثال: السجل التجاري منتهي الصلاحية أو بيانات الموقع غير دقيقة...' : 'e.g. Expired commercial registration or incomplete documents...'}
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-700 font-semibold"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !rejectReason.trim()}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition disabled:opacity-50"
                >
                  {isRtl ? 'تأكيد الرفض' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShopApprovals;
