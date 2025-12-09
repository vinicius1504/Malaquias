'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Importa os arquivos de tradução
import ptHome from '@/locales/pt/home.json';
import enHome from '@/locales/en/home.json';
import esHome from '@/locales/es/home.json';

type Locale = 'pt' | 'en'| 'es';

interface Translations {
  home: typeof ptHome;
}

const translations: Record<Locale, Translations> = {
  pt: { home: ptHome },
  en: { home: enHome },
  es: { home: esHome },
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
