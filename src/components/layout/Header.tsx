'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setIsServicesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { href: '/', label: t.home.nav.home },
    { href: '/sobre', label: t.home.nav.about },
    { href: '/noticias', label: t.home.nav.news },
    { href: '/contato', label: t.home.nav.contact },
    { href: '/blog', label: t.home.nav.blog },
    { href: '/trabalhe-conosco', label: t.home.nav.careers },
  ];

  // Serviços do dropdown
  const services = t.servicesPages.services;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[rgba(0,61,125,0.19)] backdrop-blur-[7.1px] shadow-[0_4px_30px_rgba(0,0,0,0.1)]'
          : ''
      }`}
    >
      <nav className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logos/Logo Branca.svg"
              alt="Malaquias Contabilidade"
              width={180}
              height={50}
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Home */}
            <Link
              href="/"
              className="text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium"
            >
              {t.home.nav.home}
            </Link>

            {/* Sobre */}
            <Link
              href="/sobre"
              className="text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium"
            >
              {t.home.nav.about}
            </Link>

            {/* Serviços Dropdown */}
            <div
              ref={servicesRef}
              className="relative"
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <button
                className="flex items-center gap-1 text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium py-2"
                onClick={() => setIsServicesOpen(!isServicesOpen)}
              >
                {t.home.nav.services}
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isServicesOpen && (
                <>
                  {/* Ponte invisível entre o botão e o dropdown */}
                  <div className="absolute top-full left-0 w-full h-2" />
                  <div className="absolute top-full left-0 pt-2 w-72 z-50">
                    <div className="bg-[#1a1a2e]/95 backdrop-blur-md rounded-xl border border-white/10 shadow-xl overflow-hidden">
                      {services.map((service) => (
                        <Link
                          key={service.id}
                          href={`/servicos/${service.slug}`}
                          className="block px-4 py-3 text-white/80 hover:text-[#C9983A] hover:bg-white/5 transition-colors duration-200 text-sm border-b border-white/5 last:border-b-0"
                          onClick={() => setIsServicesOpen(false)}
                        >
                          {service.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Outros itens */}
            <Link
              href="/noticias"
              className="text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium"
            >
              {t.home.nav.news}
            </Link>
            <Link
              href="/contato"
              className="text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium"
            >
              {t.home.nav.contact}
            </Link>
            <Link
              href="/blog"
              className="text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium"
            >
              {t.home.nav.blog}
            </Link>
            <Link
              href="/trabalhe-conosco"
              className="text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium"
            >
              {t.home.nav.careers}
            </Link>

            {/* Language Selector */}
            <LanguageSelector />
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-4">
            <LanguageSelector />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white hover:text-[#C9983A]"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-white/10 pt-4">
            <div className="flex flex-col gap-4">
              {/* Home */}
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium"
              >
                {t.home.nav.home}
              </Link>

              {/* Sobre */}
              <Link
                href="/sobre"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium"
              >
                {t.home.nav.about}
              </Link>

              {/* Serviços Accordion Mobile */}
              <div>
                <button
                  onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                  className="flex items-center justify-between w-full text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium"
                >
                  {t.home.nav.services}
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isMobileServicesOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Submenu de serviços */}
                {isMobileServicesOpen && (
                  <div className="mt-2 ml-4 flex flex-col gap-2 border-l border-white/10 pl-4">
                    {services.map((service) => (
                      <Link
                        key={service.id}
                        href={`/servicos/${service.slug}`}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsMobileServicesOpen(false);
                        }}
                        className="text-white/70 hover:text-[#C9983A] transition-colors duration-200 text-sm"
                      >
                        {service.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Outros itens */}
              <Link
                href="/noticias"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium"
              >
                {t.home.nav.news}
              </Link>
              <Link
                href="/contato"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium"
              >
                {t.home.nav.contact}
              </Link>
              <Link
                href="/blog"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium"
              >
                {t.home.nav.blog}
              </Link>
              <Link
                href="/trabalhe-conosco"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium"
              >
                {t.home.nav.careers}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
