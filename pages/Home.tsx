
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { Search, Car } from 'lucide-react';
import PartCard from '../components/PartCard';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const { parts, shops, brands, categories } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const featuredParts = parts.slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-primary relative overflow-hidden text-white py-20 px-4">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-4xl mx-auto text-center z-10">
          <h1 className="text-4xl md:text-6xl font-bold font-cairo mb-6 leading-tight">
            {t('welcome')}
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
             The largest network of spare parts sellers. Compare prices, check conditions, and buy with confidence.
          </p>
          
          <form onSubmit={handleSearch} className="flex max-w-2xl mx-auto shadow-2xl rounded-lg overflow-hidden">
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-6 py-4 text-gray-800 outline-none border-none ${isRTL ? 'text-right' : 'text-left'}`}
            />
            <button type="submit" className="bg-secondary text-primary font-bold px-8 py-4 hover:bg-yellow-200 transition flex items-center gap-2">
              <Search size={20} />
              <span className="hidden sm:inline">{t('search')}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Brands Ticker (Dynamic) */}
      <div className="bg-white py-6 border-b">
         <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-gray-400 overflow-x-auto gap-8 no-scrollbar">
            {brands.map(brand => (
               <div key={brand.id} className="flex items-center gap-2 opacity-60 hover:opacity-100 transition cursor-pointer" onClick={() => navigate(`/search?q=${brand.nameEn}`)}>
                  {brand.logoUrl && <img src={brand.logoUrl} alt={brand.nameEn} className="h-8 w-auto" />}
                  <span className="text-xl font-bold whitespace-nowrap">{brand.nameEn}</span>
               </div>
            ))}
         </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
          <Car /> {t('search')} by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.filter(c => c.isActive).map(cat => (
            <div 
              key={cat.id} 
              onClick={() => navigate(`/search?catId=${cat.id}`)}
              className="bg-white p-4 rounded shadow hover:shadow-md cursor-pointer text-center hover:bg-blue-50 transition border border-gray-100"
            >
              <span className="font-semibold text-gray-700">{language === 'ar' ? cat.nameAr : cat.nameEn}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Parts */}
      <div className="bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-primary">{t('new')} Arrivals</h2>
            <button onClick={() => navigate('/search')} className="text-primary hover:underline">{t('viewDetails')}</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredParts.map(part => (
              <PartCard 
                key={part.id} 
                part={part} 
                shop={shops.find(s => s.id === part.shopId)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
