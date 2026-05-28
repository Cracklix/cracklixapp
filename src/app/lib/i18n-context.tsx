'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../../../messages/en.json';
import pa from '../../../messages/pa.json';

type Locale = 'en' | 'pa';
type Translations = typeof en;

interface i18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof Translations) => string;
}

const translations: Record<Locale, Translations> = { en, pa };

const i18nContext = createContext<i18nContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const saved = document.cookie.split('; ').find(row => row.startsWith('NEXT_LOCALE='))?.split('=')[1];
      if (saved === 'pa' || saved === 'en') {
        setLocaleState(saved as Locale);
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof document !== 'undefined') {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    }
  };

  const t = (key: keyof Translations) => {
    return translations[locale][key as keyof Translations] || key;
  };

  return (
    <i18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </i18nContext.Provider>
  );
}

export const useI18n = () => {
  const context = useContext(i18nContext);
  if (!context) throw new Error('useI18n must be used within LocaleProvider');
  return context;
};
