import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';

import { DEFAULT_SETTINGS } from '../../constants';

export const Logo: React.FC<{ size?: number; showName?: boolean; light?: boolean; white?: boolean; onClick?: () => void }> = ({
  size = 44,
  showName = true,
  light = true,
  white,
  onClick,
}) => {
  const { language } = useLanguage();
  let websiteSettings = DEFAULT_SETTINGS;
  try {
    const data = useData();
    if (data?.websiteSettings) {
      websiteSettings = data.websiteSettings;
    }
  } catch {
    // fallback to DEFAULT_SETTINGS if useData fails or is outside provider
  }

  const isLight = white !== undefined ? white : light;
  const name = language === 'ar' ? (websiteSettings?.appNameAr || 'العالمي') : (websiteSettings?.appNameEn || 'ALALAMI');
  const sub = language === 'ar' ? 'لقطع غيار السيارات' : 'Auto Spare Parts';

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer' : ''}`}
    >
      <img
        src="/logo.png"
        alt="Alalami Auto Spare Parts"
        width={size}
        height={size}
        className="object-contain flex-shrink-0"
        style={{ width: size, height: size, aspectRatio: '1/1' }}
      />
      {showName && (
        <div className="flex flex-col justify-center leading-none">
          <span
            className="text-lg md:text-xl font-bold tracking-tight"
            style={{ color: isLight ? '#FCF1D0' : '#010736', fontFamily: 'Thmanyah Sans, sans-serif' }}
          >
            {name}
          </span>
          <span
            className="text-[10px] md:text-xs font-normal tracking-wide opacity-80 mt-1"
            style={{ color: isLight ? '#FFFFFF' : '#22396F' }}
          >
            {sub}
          </span>
        </div>
      )}
    </span>
  );
};

export default Logo;