'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';

const languages = [
  { code: 'pt' as const, flag: '/images/brasil.png' },
  { code: 'en' as const, flag: '/images/estados-unidos-da-america.png' },
  { code: 'es' as const, flag: '/images/espanha.png' },
];

export default function LanguageSelector() {
  const { locale, setLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded border border-white/20 hover:border-gold-500 transition-colors"
        aria-label="Selecionar idioma"
      >
        <Image
          src={currentLang.flag}
          alt=""
          width={24}
          height={24}
          className="rounded-sm"
        />
        <svg
          className={`w-4 h-4 text-white/90 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-dark-900 border border-white/10 rounded-lg shadow-xl overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLocale(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-center px-4 py-2.5 transition-colors ${
                locale === lang.code
                  ? 'bg-gold-500/10'
                  : 'hover:bg-white/5'
              }`}
            >
              <Image
                src={lang.flag}
                alt={lang.code === 'pt' ? 'Português' : 'English'}
                width={28}
                height={28}
                className="rounded-sm"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
