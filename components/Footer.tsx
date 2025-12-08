import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, Video } from 'lucide-react';

const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const { websiteSettings } = useData();

  const appName = language === 'ar' ? websiteSettings.appNameAr : websiteSettings.appNameEn;
  const address = language === 'ar' ? websiteSettings.contactAddressAr : websiteSettings.contactAddressEn;
  const footerText = language === 'ar' ? websiteSettings.footerTextAr : websiteSettings.footerTextEn;
  const workingHours = language === 'ar' ? websiteSettings.workingHoursAr : websiteSettings.workingHoursEn;

  return (
    <footer className="bg-slate-900 text-slate-300 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {websiteSettings.logoUrl && <img src={websiteSettings.logoUrl} className="h-8 w-8" />}
              <h3 className="text-2xl font-bold text-secondary font-cairo">{appName}</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">{footerText}</p>
            <div className="flex gap-4 mt-4">
              {websiteSettings.facebookUrl && <a href={websiteSettings.facebookUrl} target="_blank" rel="noreferrer" className="hover:text-secondary"><Facebook size={20}/></a>}
              {websiteSettings.instagramUrl && <a href={websiteSettings.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-secondary"><Instagram size={20}/></a>}
              {websiteSettings.youtubeUrl && <a href={websiteSettings.youtubeUrl} target="_blank" rel="noreferrer" className="hover:text-secondary"><Youtube size={20}/></a>}
              {websiteSettings.tiktokUrl && <a href={websiteSettings.tiktokUrl} target="_blank" rel="noreferrer" className="hover:text-secondary"><Video size={20}/></a>}
            </div>
          </div>

          {/* Contact */}
          <div className="md:col-span-2">
             <h4 className="text-lg font-bold text-white mb-4">{t('contactSettings')}</h4>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Phone size={16} className="text-secondary" />
                    <span dir="ltr">{websiteSettings.contactPhone}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail size={16} className="text-secondary" />
                    <span>{websiteSettings.contactEmail}</span>
                  </li>
                </ul>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <MapPin size={16} className="text-secondary" />
                    <span>{address}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-secondary font-bold text-xs">{t('workingHours')}:</span>
                    <span>{workingHours}</span>
                  </li>
                </ul>
             </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-secondary">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-secondary">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-700 text-center text-sm">
          &copy; {new Date().getFullYear()} {appName}. All rights reserved.
        </div>
      </div>

      {/* WhatsApp Sticky Button */}
      <a 
        href={`https://wa.me/${websiteSettings.whatsappNumber}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition transform hover:scale-110 z-50 flex items-center justify-center"
        aria-label="Chat on WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
      </a>
    </footer>
  );
};

export default Footer;