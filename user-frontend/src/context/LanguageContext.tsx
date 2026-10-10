import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TranslationDictionary, translations } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dict: TranslationDictionary;
  t: (path: string, fallback?: string) => string;
  formatPrice: (price: number | string | null | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'tradex_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Gujarati as requested: "Gujarati (ગુજરાતી) — Default language."
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'gu' || saved === 'en') {
      return saved;
    }
    return 'gu';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      console.warn('Could not save language to localStorage', e);
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const dict = translations[language] || translations.gu;

  // Dot-notation translation helper: e.g. t('nav.home')
  const t = (path: string, fallback?: string): string => {
    const parts = path.split('.');
    let current: any = dict;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return fallback || path;
      }
    }

    if (typeof current === 'string') {
      return current;
    }
    return fallback || path;
  };

  // Indian Rupee (₹) price formatter
  const formatPrice = (price: number | string | null | undefined): string => {
    const num = Number(price || 0);
    if (num <= 0) {
      return language === 'gu' ? 'મફત (₹૦)' : 'Free (₹0)';
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dict, t, formatPrice }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
