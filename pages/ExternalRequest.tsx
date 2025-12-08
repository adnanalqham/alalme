
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { Upload, X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ExternalRequest: React.FC = () => {
  const { t, language } = useLanguage();
  const { brands, submitExternalRequest } = useData();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    carBrandId: '',
    carModel: '',
    modelYear: '',
    description: '',
    notes: '',
    imageUrl: ''
  });
  const [success, setSuccess] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 3 * 1024 * 1024) {
        alert("File too large. Max 3MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl) {
      alert(t('uploadImage'));
      return;
    }
    
    submitExternalRequest({
      id: `req_${Date.now()}`,
      ...form,
      createdAt: new Date().toISOString()
    });

    setSuccess(true);
    setTimeout(() => navigate('/'), 3000);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-10 rounded-lg shadow-xl text-center max-w-md w-full">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-green-600 mb-2">{t('requestSubmitted')}</h2>
          <p className="text-gray-500 text-sm">You will be redirected shortly...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-2 text-center">{t('externalRequest')}</h1>
      <p className="text-center text-gray-600 mb-8">Can't find what you need? Tell us, and we will find it for you.</p>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-primary">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
               <label className="block font-bold mb-1">{t('fullName')} *</label>
               <input required className="w-full p-3 border rounded-lg bg-gray-50" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} />
            </div>
            <div>
               <label className="block font-bold mb-1">{t('phone')} *</label>
               <input required type="tel" className="w-full p-3 border rounded-lg bg-gray-50" value={form.customerPhone} onChange={e => setForm({...form, customerPhone: e.target.value})} />
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
               <label className="block font-bold mb-1">{t('carBrand')} *</label>
               <select required className="w-full p-3 border rounded-lg bg-gray-50" value={form.carBrandId} onChange={e => setForm({...form, carBrandId: e.target.value})}>
                  <option value="">Select</option>
                  {brands.map(b => (
                     <option key={b.id} value={b.id}>{language === 'ar' ? b.nameAr : b.nameEn}</option>
                  ))}
               </select>
            </div>
            <div>
               <label className="block font-bold mb-1">{t('carModel')} *</label>
               <input required className="w-full p-3 border rounded-lg bg-gray-50" value={form.carModel} onChange={e => setForm({...form, carModel: e.target.value})} />
            </div>
            <div>
               <label className="block font-bold mb-1">{t('modelYear')} *</label>
               <input required className="w-full p-3 border rounded-lg bg-gray-50" placeholder="e.g. 2018" value={form.modelYear} onChange={e => setForm({...form, modelYear: e.target.value})} />
            </div>
         </div>

         <div className="mb-6">
            <label className="block font-bold mb-1">{t('partDesc')} *</label>
            <textarea required rows={3} className="w-full p-3 border rounded-lg bg-gray-50" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
         </div>

         <div className="mb-6">
            <label className="block font-bold mb-1">{t('notes')}</label>
            <textarea rows={2} className="w-full p-3 border rounded-lg bg-gray-50" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
         </div>

         <div className="mb-8">
            <label className="block font-bold mb-2">{t('uploadImage')} *</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer relative">
               {form.imageUrl ? (
                  <div className="relative w-full h-48">
                     <img src={form.imageUrl} className="w-full h-full object-contain" />
                     <button type="button" onClick={() => setForm({...form, imageUrl: ''})} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full">
                        <X size={16} />
                     </button>
                  </div>
               ) : (
                  <>
                     <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                     <Upload size={32} className="text-gray-400 mb-2" />
                     <span className="text-primary font-bold">{t('browse')}</span>
                  </>
               )}
            </div>
         </div>

         <button type="submit" className="w-full bg-primary text-white py-4 rounded-lg font-bold text-xl hover:bg-blue-800 transition">
            {t('submit')}
         </button>
      </form>
    </div>
  );
};

export default ExternalRequest;
