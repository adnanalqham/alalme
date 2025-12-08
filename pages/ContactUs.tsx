
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { Upload, X, CheckCircle, Mail, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContactUs: React.FC = () => {
  const { t, language } = useLanguage();
  const { submitContactMessage, websiteSettings } = useData();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
    imageUrl: ''
  });
  const [success, setSuccess] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, imageUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitContactMessage({
      id: `cont_${Date.now()}`,
      ...form,
      createdAt: new Date().toISOString()
    });
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-10 rounded-lg shadow-xl text-center max-w-md w-full">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-green-600 mb-2">Message Sent!</h2>
          <p className="text-gray-500 mb-4">We will get back to you shortly.</p>
          <button onClick={() => navigate('/')} className="text-primary font-bold underline">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Info */}
        <div>
          <h1 className="text-4xl font-bold text-primary mb-6">{t('contactUs')}</h1>
          <p className="text-lg text-gray-600 mb-8">We are here to help. Reach out to us for any inquiries.</p>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
               <div className="bg-blue-100 p-3 rounded-full text-primary"><Phone size={24}/></div>
               <div>
                  <h3 className="font-bold text-gray-800">Phone</h3>
                  <p className="text-gray-600" dir="ltr">{websiteSettings.contactPhone}</p>
               </div>
            </div>
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
               <div className="bg-blue-100 p-3 rounded-full text-primary"><Mail size={24}/></div>
               <div>
                  <h3 className="font-bold text-gray-800">Email</h3>
                  <p className="text-gray-600">{websiteSettings.contactEmail}</p>
               </div>
            </div>
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
               <div className="bg-blue-100 p-3 rounded-full text-primary"><MapPin size={24}/></div>
               <div>
                  <h3 className="font-bold text-gray-800">Location</h3>
                  <p className="text-gray-600">{language === 'ar' ? websiteSettings.contactAddressAr : websiteSettings.contactAddressEn}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
          <div className="mb-4">
            <label className="block font-bold mb-1">{t('fullName')} *</label>
            <input required className="w-full p-3 border rounded-lg" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="mb-4">
            <label className="block font-bold mb-1">{t('email')} *</label>
            <input required type="email" className="w-full p-3 border rounded-lg" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="mb-4">
            <label className="block font-bold mb-1">{t('messageBody')} *</label>
            <textarea required rows={4} className="w-full p-3 border rounded-lg" value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
          </div>
          <div className="mb-6">
            <label className="block font-bold mb-2">{t('uploadImage')}</label>
            {form.imageUrl ? (
               <div className="relative w-24 h-24 border rounded overflow-hidden">
                  <img src={form.imageUrl} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setForm({...form, imageUrl: ''})} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl"><X size={12}/></button>
               </div>
            ) : (
               <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"/>
            )}
          </div>
          <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition">
            {t('submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
