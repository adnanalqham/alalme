import React from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { GOOGLE_MAPS_API_KEY } from '../constants';
import { Phone, MessageCircle, MapPin, Clock, ShieldCheck } from 'lucide-react';

const PartDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { parts, shops, brands } = useData();
  const { t, language } = useLanguage();
  
  const part = parts.find(p => p.id === id);
  const shop = shops.find(s => s.id === part?.shopId);
  const brand = brands.find(b => b.id === part?.brandId);

  if (!part || !shop) {
    return <div className="p-8 text-center">Part not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          
          {/* Image Side */}
          <div className="bg-gray-100 h-full relative min-h-[400px]">
            <img 
              src={part.imageUrl} 
              alt={part.nameEn} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details Side */}
          <div className="p-8 flex flex-col">
            <div className="mb-4">
               <div className="flex items-center gap-2 mb-2">
                 {brand && <img src={brand.logoUrl} alt={brand.nameEn} className="w-8 h-8 object-contain" />}
                 <span className="inline-block px-3 py-1 bg-blue-100 text-primary rounded-full text-xs font-bold">
                   {part.carBrand} {part.carModel} {part.yearRange}
                 </span>
               </div>
               
               <h1 className="text-3xl font-bold text-gray-900 mb-2">
                 {language === 'ar' ? part.nameAr : part.nameEn}
               </h1>
               <div className="flex items-center gap-2 text-sm text-gray-500">
                 <span className="font-semibold text-primary">{t('condition')}:</span> 
                 {part.condition === 'New' ? t('new') : t('used')}
               </div>
            </div>

            <div className="text-3xl font-bold text-primary mb-6 border-b pb-6">
              {part.price.toLocaleString()} <span className="text-lg">{part.currency}</span>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <ShieldCheck className="text-green-500 mt-1" />
                <div>
                   <h3 className="font-bold">{t('availability')}</h3>
                   <p className={part.stockQuantity > 0 ? "text-green-600" : "text-red-600"}>
                     {part.stockQuantity > 0 ? t('inStock') : t('outOfStock')} ({part.stockQuantity} items)
                   </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                 <Clock className="text-gray-400 mt-1" />
                 <div>
                    <h3 className="font-bold text-gray-700">{t('workingHours')}</h3>
                    <p className="text-gray-600">{shop.workingHours}</p>
                 </div>
              </div>

              <div className="flex items-start gap-3 w-full">
                 <MapPin className="text-gray-400 mt-1" />
                 <div className="w-full">
                    <h3 className="font-bold text-gray-700">{t('location')}</h3>
                    <p className="text-gray-600 mb-2">{shop.city}, {shop.addressDetails}</p>
                    {/* Google Maps Embed */}
                    <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden border">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${shop.latitude},${shop.longitude}`}
                        title="Shop Location"
                      >
                      </iframe>
                    </div>
                 </div>
              </div>
            </div>

            <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
               <a href={`https://wa.me/${shop.whatsappNumber || shop.phone}`} target="_blank" rel="noreferrer" className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-bold transition">
                 <MessageCircle /> {t('contactViaWhatsapp')}
               </a>
               <a href={`tel:${shop.phone}`} className="bg-primary hover:bg-blue-800 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-bold transition">
                 <Phone /> {t('callShop')}
               </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartDetails;