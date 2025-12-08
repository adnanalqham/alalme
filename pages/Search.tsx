
import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import PartCard from '../components/PartCard';

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const categoryIdFilter = searchParams.get('catId') || '';
  const { parts, shops, categories } = useData();
  const { t, language } = useLanguage();

  const filteredParts = useMemo(() => {
    return parts.filter(part => {
      const matchesQuery = 
        part.nameEn.toLowerCase().includes(query.toLowerCase()) || 
        part.nameAr.includes(query) ||
        part.carBrand.toLowerCase().includes(query.toLowerCase()) ||
        part.carModel.toLowerCase().includes(query.toLowerCase());
      
      const matchesCategory = categoryIdFilter ? part.categoryId === categoryIdFilter : true;
      
      return matchesQuery && matchesCategory;
    });
  }, [parts, query, categoryIdFilter]);

  const categoryName = categories.find(c => c.id === categoryIdFilter);
  const displayCategory = categoryName ? (language === 'ar' ? categoryName.nameAr : categoryName.nameEn) : '';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">
          {t('search')}: "{query || displayCategory || t('all')}"
        </h1>
        <p className="text-gray-600">{filteredParts.length} results found</p>
      </div>

      {filteredParts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 text-lg">No parts found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredParts.map(part => (
            <PartCard 
              key={part.id} 
              part={part} 
              shop={shops.find(s => s.id === part.shopId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
