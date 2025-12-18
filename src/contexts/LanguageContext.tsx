'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Importa os arquivos de tradução
import ptCommon from '@/locales/pt/common.json';
import enCommon from '@/locales/en/common.json';
import esCommon from '@/locales/es/common.json';
import ptHome from '@/locales/pt/home.json';
import enHome from '@/locales/en/home.json';
import esHome from '@/locales/es/home.json';
import ptServices from '@/locales/pt/services.json';
import enServices from '@/locales/en/services.json';
import esServices from '@/locales/es/services.json';
import ptFaq from '@/locales/pt/faq.json';
import enFaq from '@/locales/en/faq.json';
import esFaq from '@/locales/es/faq.json';
import ptContact from '@/locales/pt/contact.json';
import enContact from '@/locales/en/contact.json';
import esContact from '@/locales/es/contact.json';
import ptAbout from '@/locales/pt/about.json';
import enAbout from '@/locales/en/about.json';
import esAbout from '@/locales/es/about.json';
import ptNews from '@/locales/pt/news.json';
import enNews from '@/locales/en/news.json';
import esNews from '@/locales/es/news.json';
import ptSegments from '@/locales/pt/segments.json';
import enSegments from '@/locales/en/segments.json';
import esSegments from '@/locales/es/segments.json';

type Locale = 'pt' | 'en'| 'es';

interface Translations {
  common: typeof ptCommon;
  home: typeof ptHome;
  services: typeof ptServices;
  faq: typeof ptFaq;
  contact: typeof ptContact;
  about: typeof ptAbout;
  news: typeof ptNews;
  segments: typeof ptSegments;
}

const translations: Record<Locale, Translations> = {
  pt: { common: ptCommon, home: ptHome, services: ptServices, faq: ptFaq, contact: ptContact, about: ptAbout, news: ptNews, segments: ptSegments },
  en: { common: enCommon, home: enHome, services: enServices, faq: enFaq, contact: enContact, about: enAbout, news: enNews, segments: enSegments },
  es: { common: esCommon, home: esHome, services: esServices, faq: esFaq, contact: esContact, about: esAbout, news: esNews, segments: esSegments },
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
    if (savedLocale && (savedLocale === 'pt' || savedLocale === 'en' || savedLocale === 'es')) {
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
