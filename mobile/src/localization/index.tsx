import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { I18nManager, Platform, TextStyle, ViewStyle } from 'react-native';
import { AR } from './ar';
import { EN } from './en';

// Enable RTL globally in React Native
try {
  I18nManager.allowRTL(true);
} catch (e) {
  // Ignored in environments where I18nManager is restricted
}

export type Language = 'ar' | 'en';
export type TranslationKey = keyof typeof AR;

interface LocalizationContextType {
  language: Language;
  setLanguage: (l: Language) => void;
  isRTL: boolean;
  t: (key: TranslationKey, fallback?: string) => string;

  // Centralized RTL Alignment & Flex Direction Helpers (Aoun Architecture)
  textAlign: TextStyle['textAlign'];
  textAlignOpposite: TextStyle['textAlign'];
  rowDirection: ViewStyle['flexDirection'];
  rowReverse: ViewStyle['flexDirection'];
  writingDirection: TextStyle['writingDirection'];

  // Safe technical LTR style for part numbers, OEM codes, phones, URLs
  technicalText: TextStyle;
  technicalContainer: ViewStyle;
}

const LocalizationContext = createContext<LocalizationContextType>({} as any);

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');

  const isRTL = language === 'ar';

  // Synchronize document direction for Web & React Native
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
    try {
      I18nManager.allowRTL(true);
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.forceRTL(isRTL);
      }
    } catch (e) {
      // Ignore
    }
  }, [isRTL, language]);

  const t = (key: TranslationKey, fallback?: string): string => {
    const dict = language === 'ar' ? AR : EN;
    return dict[key] ?? fallback ?? String(key);
  };

  // Centralized direction helpers requested in project requirements:
  // "textAlign: isRTL ? 'left' : 'right'" and "textAlignOpposite: isRTL ? 'right' : 'left'"
  // Under React Native / iOS Native RTL, 'left' maps to the leading edge (the right in RTL)
  const textAlign: TextStyle['textAlign'] = isRTL ? 'left' : 'right';
  const textAlignOpposite: TextStyle['textAlign'] = isRTL ? 'right' : 'left';

  // React Native's Native RTL automatically places the first child of 'row' at the leading edge (RIGHT in RTL)
  const rowDirection: ViewStyle['flexDirection'] = 'row';
  const rowReverse: ViewStyle['flexDirection'] = 'row-reverse';
  const writingDirection: TextStyle['writingDirection'] = isRTL ? 'rtl' : 'ltr';

  // Safe technical styles ensuring part numbers & OEM codes never invert
  const technicalText: TextStyle = {
    writingDirection: 'ltr',
    textAlign: 'left',
  };

  const technicalContainer: ViewStyle = {
    direction: 'ltr' as any,
    flexDirection: 'row',
    alignItems: 'center',
  };

  const value = useMemo(() => ({
    language,
    setLanguage,
    isRTL,
    t,
    textAlign,
    textAlignOpposite,
    rowDirection,
    rowReverse,
    writingDirection,
    technicalText,
    technicalContainer,
  }), [language, isRTL]);

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => useContext(LocalizationContext);
