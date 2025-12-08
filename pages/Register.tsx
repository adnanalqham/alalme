
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { UserRole, UserStatus } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Register: React.FC = () => {
  const { register } = useAuth();
  const { t, language } = useLanguage();
  const { brands, categories } = useData();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    address: '',
    ownedCarBrands: [] as string[],
    preferredCategories: [] as string[]
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    try {
      await register({
        id: `u_${Date.now()}`,
        role: UserRole.CUSTOMER,
        fullName: formData.fullName,
        username: formData.username,
        email: '', // Optional in customer form
        phone: formData.phone,
        city: formData.city,
        passwordHash: formData.password,
        status: UserStatus.ACTIVE,
        ownedCarBrands: formData.ownedCarBrands,
        preferredCategories: formData.preferredCategories
      });
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setError(err.message || t('usernameTaken'));
    }
  };

  const toggleSelection = (list: string[], item: string, field: 'ownedCarBrands' | 'preferredCategories') => {
    if (list.includes(item)) {
      setFormData({ ...formData, [field]: list.filter(i => i !== item) });
    } else {
      setFormData({ ...formData, [field]: [...list, item] });
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-10 rounded-lg shadow-xl text-center max-w-md w-full">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-600 mb-2">{t('registerSuccess')}</h2>
          <p className="text-gray-600">{t('welcome')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-slate-100 px-4 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white p-8 rounded-lg shadow-xl border-t-8 border-primary">
        <h2 className="text-3xl font-bold mb-8 text-primary text-center font-cairo">{t('register')}</h2>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-3 border border-red-200">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Info */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t('fullName')} *</label>
                <input 
                  type="text" 
                  required 
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary outline-none transition"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t('username')} *</label>
                <input 
                  type="text" 
                  required 
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary outline-none transition"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t('password')} *</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary outline-none transition pr-10"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t('confirmPassword')} *</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    required 
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary outline-none transition pr-10"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Contact Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t('phone')} *</label>
                <input 
                  type="tel" 
                  required 
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary outline-none transition"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t('city')} *</label>
                <input 
                  type="text" 
                  required 
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary outline-none transition"
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white border border-gray-200 p-6 rounded-lg">
            <label className="block text-base font-bold text-gray-800 mb-3">{t('ownedCars')} (Optional)</label>
            <div className="flex flex-wrap gap-2 mb-6">
              {brands.map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => toggleSelection(formData.ownedCarBrands, b.id, 'ownedCarBrands')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                    formData.ownedCarBrands.includes(b.id) 
                      ? 'bg-primary text-white border-primary shadow-md' 
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {language === 'ar' ? b.nameAr : b.nameEn}
                </button>
              ))}
            </div>

             <label className="block text-base font-bold text-gray-800 mb-3">{t('preferredCats')} (Optional)</label>
             <div className="flex flex-wrap gap-2">
              {categories.filter(c => c.isActive).map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleSelection(formData.preferredCategories, cat.id, 'preferredCategories')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                    formData.preferredCategories.includes(cat.id) 
                      ? 'bg-secondary text-primary border-secondary font-bold shadow-md' 
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {language === 'ar' ? cat.nameAr : cat.nameEn}
                </button>
              ))}
             </div>
          </div>

          <button type="submit" className="w-full bg-primary text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-800 transition shadow-lg transform hover:-translate-y-1">
            {t('register')}
          </button>
          
          <p className="text-center text-sm text-gray-600 mt-4">
             Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">{t('login')}</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
