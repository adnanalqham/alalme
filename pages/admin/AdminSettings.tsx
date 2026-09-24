import React, { useState, useEffect } from 'react';
import {
  Settings2, Save, RefreshCw, CheckCircle2, AlertCircle, Shield,
  Globe, ShoppingBag, CreditCard, Truck, Bell, Percent, Lock
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useLanguage } from '../../context/LanguageContext';

const SETTINGS_SECTIONS = [
  { id: 'general', labelAr: 'الإعدادات العامة', labelEn: 'General', icon: Settings2 },
  { id: 'localization', labelAr: 'اللغة والموقع', labelEn: 'Localization', icon: Globe },
  { id: 'marketplace', labelAr: 'السوق والمتاجر', labelEn: 'Marketplace', icon: ShoppingBag },
  { id: 'orders', labelAr: 'الطلبات والمبيعات', labelEn: 'Orders', icon: ShoppingBag },
  { id: 'payments', labelAr: 'المدفوعات والتحصيل', labelEn: 'Payments', icon: CreditCard },
  { id: 'delivery', labelAr: 'الشحن والتوصيل', labelEn: 'Delivery', icon: Truck },
  { id: 'notifications', labelAr: 'الإشعارات والتنبيهات', labelEn: 'Notifications', icon: Bell },
  { id: 'commission', labelAr: 'العمولات الافتراضية', labelEn: 'Commission', icon: Percent },
  { id: 'security', labelAr: 'الأمان والتحكم', labelEn: 'Security', icon: Lock },
];

const AdminSettings: React.FC = () => {
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState<any[]>([]);
  const [groupedSettings, setGroupedSettings] = useState<Record<string, any[]>>({});
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getSettings();
      setSettings(res.settings || []);
      setGroupedSettings(res.grouped || {});

      const initialVals: Record<string, any> = {};
      (res.settings || []).forEach((s: any) => {
        initialVals[s.key] = s.value;
      });
      setFormValues(initialVals);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: any) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setStatusMsg(null);

      const itemsToUpdate = (groupedSettings[activeSection] || []).map((s: any) => ({
        key: s.key,
        value: formValues[s.key],
        group: activeSection,
      }));

      await adminApi.updateSettings(itemsToUpdate);
      setStatusMsg({
        type: 'success',
        text: isRtl ? 'تم حفظ إعدادات النظام وتوثيقها بسجل التدقيق بنجاح' : 'Platform settings updated successfully with audit trail.',
      });
      fetchSettings();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const currentSectionSettings = groupedSettings[activeSection] || [];

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#010736]/10 text-[#010736] rounded-xl border border-[#010736]/20">
            <Settings2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#010736] tracking-tight">
              {isRtl ? 'إعدادات المنصة المركزية (Platform Settings)' : 'Platform System Settings'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRtl
                ? 'تهيئة المعلمات العامة، سياسات الإرجاع، بوابات الدفع، وإعدادات الأمان مع توثيق التدقيق'
                : 'Centralized settings for marketplace operations, commissions, and security'}
            </p>
          </div>
        </div>

        <button
          onClick={fetchSettings}
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

      {/* Grid: Navigation Sidebar (left) + Settings Form (right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sections menu */}
        <div className="md:col-span-4 space-y-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-2 space-y-1 shadow-xs">
            {SETTINGS_SECTIONS.map(sec => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              const count = groupedSettings[sec.id]?.length || 0;

              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    setActiveSection(sec.id);
                    setStatusMsg(null);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#010736] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-[#010736]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} />
                    <span>{isRtl ? sec.labelAr : sec.labelEn}</span>
                  </div>
                  {count > 0 && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Form */}
        <div className="md:col-span-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h2 className="font-bold text-[#010736] text-base">
                  {isRtl
                    ? SETTINGS_SECTIONS.find(s => s.id === activeSection)?.labelAr
                    : SETTINGS_SECTIONS.find(s => s.id === activeSection)?.labelEn}
                </h2>
                <span className="text-[11px] text-slate-400 font-mono">group: {activeSection}</span>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500 mb-3" />
                <p className="text-xs">{isRtl ? 'جاري تحميل الإعدادات...' : 'Loading settings...'}</p>
              </div>
            ) : currentSectionSettings.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                {isRtl ? 'لا توجد إعدادات مخصصة في هذا القسم حالياً' : 'No settings in this group.'}
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-5">
                {currentSectionSettings.map(s => {
                  const val = formValues[s.key] ?? s.value;
                  const isBoolean = typeof val === 'boolean' || val === 'true' || val === 'false';

                  return (
                    <div key={s.key} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#010736] font-mono">
                          {s.key}
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {s.is_public ? 'Public' : 'Protected'}
                        </span>
                      </div>

                      {isBoolean ? (
                        <select
                          value={String(val)}
                          onChange={e => handleChange(s.key, e.target.value === 'true')}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#010736]"
                        >
                          <option value="true">{isRtl ? 'مفعل (True)' : 'True / Enabled'}</option>
                          <option value="false">{isRtl ? 'معطل (False)' : 'False / Disabled'}</option>
                        </select>
                      ) : typeof val === 'object' && val !== null ? (
                        <textarea
                          rows={3}
                          value={typeof val === 'string' ? val : JSON.stringify(val, null, 2)}
                          onChange={e => {
                            try {
                              const parsed = JSON.parse(e.target.value);
                              handleChange(s.key, parsed);
                            } catch {
                              handleChange(s.key, e.target.value);
                            }
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#010736]"
                        />
                      ) : (
                        <input
                          type={typeof val === 'number' ? 'number' : 'text'}
                          value={val ?? ''}
                          onChange={e =>
                            handleChange(
                              s.key,
                              typeof val === 'number' ? parseFloat(e.target.value) : e.target.value
                            )
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#010736]"
                        />
                      )}
                    </div>
                  );
                })}

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-[#010736] hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-xs disabled:opacity-50"
                  >
                    <Save size={15} />
                    <span>{saving ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ إعدادات القسم' : 'Save Section Settings')}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
