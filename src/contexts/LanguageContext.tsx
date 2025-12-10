'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Importa os arquivos de tradução
import ptHome from '@/locales/pt/home.json';
import enHome from '@/locales/en/home.json';
import esHome from '@/locales/es/home.json';
import ptServices from '@/locales/pt/services.json';
import enServices from '@/locales/en/services.json';
import esServices from '@/locales/es/services.json';
import ptFaq from '@/locales/pt/faq.json';
import enFaq from '@/locales/en/faq.json';
import esFaq from '@/locales/es/faq.json';

type Locale = 'pt' | 'en'| 'es';

interface Translations {
  home: typeof ptHome;
  services: typeof ptServices;
  faq: typeof ptFaq;
}

const translations: Record<Locale, Translations> = {
  pt: { home: ptHome, services: ptServices, faq: ptFaq },
  en: { home: enHome, services: enServices, faq: enFaq },
  es: { home: esHome, services: esServices, faq: esFaq },
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('pt');

  useEffect(() => {
    // Recupera o idioma salvo no localStorage
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && (savedLocale === 'pt' || savedLocale === 'en')) {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = translations[locale];

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
