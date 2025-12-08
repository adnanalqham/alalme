import React from 'react';
import { Part, Shop } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Star, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PartCardProps {
  part: Part;
  shop?: Shop;
}

const PartCard: React.FC<PartCardProps> = ({ part, shop }) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
      <div className="relative h-48 bg-gray-200">
        <img 
          src={part.imageUrl} 
          alt={language === 'ar' ? part.nameAr : part.nameEn} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-primary text-secondary text-xs font-bold px-2 py-1 rounded">
          {part.condition === 'New' ? t('new') : t('used')}
        </div>
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2">
          {language === 'ar' ? part.nameAr : part.nameEn}
        </h3>
        <p className="text-sm text-gray-500 mb-2">{part.carBrand} {part.carModel} ({part.yearRange})</p>
        
        <div className="flex items-center gap-1 text-yellow-500 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} fill={i < part.rating ? "currentColor" : "none"} />
          ))}
          <span className="text-xs text-gray-400">({part.rating})</span>
        </div>

        {shop && (
          <div className="text-xs text-gray-600 mb-3 flex items-center gap-1">
             <User size={12} /> 
             <span className="font-semibold">{shop.name}</span>
             <span className="mx-1">•</span>
             <MapPin size={12} />
             <span>{shop.city}</span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t pt-3">
          <div className="font-bold text-xl text-primary font-mono">
            {part.price.toLocaleString()} <span className="text-xs text-gray-500">{part.currency}</span>
          </div>
          <button 
            onClick={() => navigate(`/part/${part.id}`)}
            className="bg-primary text-white text-sm px-4 py-2 rounded hover:bg-blue-800 transition"
          >
            {t('viewDetails')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartCard;