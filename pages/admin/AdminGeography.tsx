import React, { useState, useEffect } from 'react';
import {
  Globe, MapPin, Plus, CheckCircle2, AlertCircle, RefreshCw,
  ToggleLeft, ToggleRight, Building2, Flag
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useLanguage } from '../../context/LanguageContext';

const AdminGeography: React.FC = () => {
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  const [activeTab, setActiveTab] = useState<'countries' | 'cities'>('countries');
  const [countries, setCountries] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountryFilter, setSelectedCountryFilter] = useState('');

  // Modals
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Country form
  const [newCountryId, setNewCountryId] = useState('');
  const [newCountryNameAr, setNewCountryNameAr] = useState('');
  const [newCountryNameEn, setNewCountryNameEn] = useState('');
  const [newCountryCode, setNewCountryCode] = useState('');
  const [newCountryPhone, setNewCountryPhone] = useState('');
  const [newCountryCurrency, setNewCountryCurrency] = useState('USD');

  // New City form
  const [newCityId, setNewCityId] = useState('');
  const [newCityCountryId, setNewCityCountryId] = useState('');
  const [newCityNameAr, setNewCityNameAr] = useState('');
  const [newCityNameEn, setNewCityNameEn] = useState('');

  const fetchGeography = async () => {
    try {
      setLoading(true);
      const [countriesRes, citiesRes] = await Promise.all([
        adminApi.getCountries(),
        adminApi.getCities({ country_id: selectedCountryFilter }),
      ]);
      setCountries(countriesRes.countries || []);
      setCities(citiesRes.cities || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeography();
  }, [selectedCountryFilter]);

  const handleToggleCountry = async (country: any) => {
    try {
      await adminApi.updateCountry(country.id, { is_active: !country.is_active });
      fetchGeography();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleCity = async (city: any) => {
    try {
      await adminApi.updateCity(city.id, { is_active: !city.is_active });
      fetchGeography();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setStatusMsg(null);
      await adminApi.createCountry({
        id: newCountryId.trim(),
        name_ar: newCountryNameAr.trim(),
        name_en: newCountryNameEn.trim(),
        code: newCountryCode.trim().toUpperCase(),
        phone_code: newCountryPhone.trim(),
        currency_code: newCountryCurrency.trim().toUpperCase(),
        is_active: true,
      });
      setShowCountryModal(false);
      setStatusMsg({ type: 'success', text: isRtl ? 'تم إضافة الدولة بنجاح' : 'Country created successfully.' });
      fetchGeography();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to create country' });
    }
  };

  const handleCreateCity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setStatusMsg(null);
      await adminApi.createCity({
        id: newCityId.trim(),
        country_id: newCityCountryId,
        name_ar: newCityNameAr.trim(),
        name_en: newCityNameEn.trim(),
        is_active: true,
      });
      setShowCityModal(false);
      setStatusMsg({ type: 'success', text: isRtl ? 'تم إضافة المدينة بنجاح' : 'City created successfully.' });
      fetchGeography();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to create city' });
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#010736]/10 text-[#010736] rounded-xl border border-[#010736]/20">
            <Globe size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#010736] tracking-tight">
              {isRtl ? 'النطاق الجغرافي والدول والمدن (Geography)' : 'Geography: Countries & Cities'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRtl
                ? 'إدارة الدول المدعومة، العملات، مفاتيح الاتصال الدولية، والمدن المتاحة للشحن والمتاجر'
                : 'Manage operating countries, currency codes, calling codes, and delivery serviceable cities'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchGeography}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#010736] hover:bg-slate-50 shadow-xs transition"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => (activeTab === 'countries' ? setShowCountryModal(true) : setShowCityModal(true))}
            className="flex items-center gap-1.5 bg-[#010736] hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-xs"
          >
            <Plus size={15} />
            <span>
              {activeTab === 'countries'
                ? isRtl ? 'إضافة دولة' : 'Add Country'
                : isRtl ? 'إضافة مدينة' : 'Add City'}
            </span>
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('countries')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'countries'
              ? 'bg-[#010736] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-[#010736] border border-slate-200'
          }`}
        >
          <Flag size={14} />
          <span>{isRtl ? 'الدول والعملات' : 'Countries'} ({countries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cities')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'cities'
              ? 'bg-[#010736] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-[#010736] border border-slate-200'
          }`}
        >
          <Building2 size={14} />
          <span>{isRtl ? 'المدن والمناطق' : 'Cities'} ({cities.length})</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500 mb-3" />
          <p className="text-xs">{isRtl ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      ) : activeTab === 'countries' ? (
        /* Countries Table */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4 text-start">{isRtl ? 'الدولة' : 'Country'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'رمز الدولة' : 'Code'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'مفتاح الاتصال' : 'Calling Code'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'العملة' : 'Currency'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'المدن المسجلة' : 'Cities Count'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'الحالة' : 'Status'}</th>
                  <th className="py-3 px-4 text-end">{isRtl ? 'التبديل' : 'Toggle'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {countries.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#010736]">{c.name_ar}</div>
                      <div className="text-[11px] text-slate-500">{c.name_en}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">{c.code}</td>
                    <td className="py-3 px-4 font-mono text-slate-700" dir="ltr">{c.phone_code || '—'}</td>
                    <td className="py-3 px-4 font-mono text-slate-800 font-semibold">{c.currency_code}</td>
                    <td className="py-3 px-4 font-bold text-sky-600">{c.cities_count || 0}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          c.is_active
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {c.is_active ? (isRtl ? 'نشط' : 'Active') : (isRtl ? 'معطل' : 'Disabled')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-end">
                      <button
                        onClick={() => handleToggleCountry(c)}
                        className="text-slate-400 hover:text-[#010736]"
                        title={c.is_active ? 'Disable' : 'Enable'}
                      >
                        {c.is_active ? <ToggleRight size={22} className="text-emerald-600" /> : <ToggleLeft size={22} className="text-slate-400" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cities Table */
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">{isRtl ? 'تصفية حسب الدولة:' : 'Filter by Country:'}</span>
            <select
              value={selectedCountryFilter}
              onChange={e => setSelectedCountryFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#010736]"
            >
              <option value="">{isRtl ? 'كافة الدول' : 'All Countries'}</option>
              {countries.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name_ar} ({c.name_en})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-3 px-4 text-start">{isRtl ? 'المدينة' : 'City'}</th>
                    <th className="py-3 px-4 text-start">{isRtl ? 'الدولة' : 'Country'}</th>
                    <th className="py-3 px-4 text-start">{isRtl ? 'معرف المدينة' : 'City ID'}</th>
                    <th className="py-3 px-4 text-start">{isRtl ? 'الحالة' : 'Status'}</th>
                    <th className="py-3 px-4 text-end">{isRtl ? 'التبديل' : 'Toggle'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cities.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#010736]">{c.name_ar}</div>
                        <div className="text-[11px] text-slate-500">{c.name_en}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {c.country?.name_ar || c.country?.name_en || c.country_id}
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-700 font-semibold">{c.id}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            c.is_active
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {c.is_active ? (isRtl ? 'نشط' : 'Active') : (isRtl ? 'معطل' : 'Disabled')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-end">
                        <button
                          onClick={() => handleToggleCity(c)}
                          className="text-slate-400 hover:text-[#010736]"
                        >
                          {c.is_active ? <ToggleRight size={22} className="text-emerald-600" /> : <ToggleLeft size={22} className="text-slate-400" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Country Modal */}
      {showCountryModal && (
        <div className="fixed inset-0 z-50 bg-[#010736]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-[#010736] text-base">
              {isRtl ? 'إضافة دولة جديدة' : 'Add New Country'}
            </h3>

            <form onSubmit={handleCreateCountry} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'المعرف الفريد (ID):' : 'Country ID:'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. c_qa"
                  value={newCountryId}
                  onChange={e => setNewCountryId(e.target.value.toLowerCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#010736]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'الاسم بالعربية:' : 'Name (Arabic):'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCountryNameAr}
                    onChange={e => setNewCountryNameAr(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#010736]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'الاسم بالإنجليزية:' : 'Name (English):'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCountryNameEn}
                    onChange={e => setNewCountryNameEn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#010736]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'الرمز (ISO):' : 'Code:'} *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="QA"
                    value={newCountryCode}
                    onChange={e => setNewCountryCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono text-center focus:outline-none focus:border-[#010736]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'مفتاح الهاتف:' : 'Phone Code:'}
                  </label>
                  <input
                    type="text"
                    placeholder="+974"
                    value={newCountryPhone}
                    onChange={e => setNewCountryPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono text-center focus:outline-none focus:border-[#010736]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'العملة:' : 'Currency:'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="QAR"
                    value={newCountryCurrency}
                    onChange={e => setNewCountryCurrency(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono text-center focus:outline-none focus:border-[#010736]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCountryModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-700 font-semibold"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#010736] hover:bg-slate-800 text-white font-bold text-xs transition"
                >
                  {isRtl ? 'إضافة الدولة' : 'Add Country'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* City Modal */}
      {showCityModal && (
        <div className="fixed inset-0 z-50 bg-[#010736]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-[#010736] text-base">
              {isRtl ? 'إضافة مدينة جديدة' : 'Add New City'}
            </h3>

            <form onSubmit={handleCreateCity} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'اختر الدولة:' : 'Country:'} *
                </label>
                <select
                  required
                  value={newCityCountryId}
                  onChange={e => setNewCityCountryId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#010736]"
                >
                  <option value="">{isRtl ? '-- حدد الدولة --' : '-- Select Country --'}</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name_ar} ({c.name_en})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'المعرف الفريد (ID):' : 'City ID:'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. city_doha"
                  value={newCityId}
                  onChange={e => setNewCityId(e.target.value.toLowerCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#010736]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'الاسم بالعربية:' : 'Name (Arabic):'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCityNameAr}
                    onChange={e => setNewCityNameAr(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#010736]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'الاسم بالإنجليزية:' : 'Name (English):'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCityNameEn}
                    onChange={e => setNewCityNameEn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#010736]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCityModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-700 font-semibold"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#010736] hover:bg-slate-800 text-white font-bold text-xs transition"
                >
                  {isRtl ? 'إضافة المدينة' : 'Add City'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGeography;
