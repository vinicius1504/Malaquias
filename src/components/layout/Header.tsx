'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';

interface ServiceItem {
  slug: string;
  title: string;
}

interface SegmentItem {
  slug: string;
  title: string;
}

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isSegmentsOpen, setIsSegmentsOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isMobileSegmentsOpen, setIsMobileSegmentsOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const segmentsRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const { nav } = t.common;
  const services = t.services;
  const segments = t.segments;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fecha dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setIsServicesOpen(false);
      }
      if (segmentsRef.current && !segmentsRef.current.contains(event.target as Node)) {
        setIsSegmentsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
              {nav.home}
            </Link>

            {/* Quem Somos */}
            <Link
              href="/sobre"
              className="text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium"
            >
              {nav.about}
            </Link>

            {/* Dropdown de Serviços */}
            <div className="relative" ref={servicesRef}>
              <button
                onClick={() => {
                  setIsServicesOpen(!isServicesOpen);
                  setIsSegmentsOpen(false);
                }}
                className="flex items-center gap-1 text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium"
              >
                {nav.services}
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isServicesOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-[#1a1a2e]/95 backdrop-blur-md border border-white/10 rounded-lg shadow-xl overflow-hidden">
                  <div className="py-2">
                    {services.items.map((service: ServiceItem) => (
                      <Link
                        key={service.slug}
                        href={`/servicos/${service.slug}`}
                        onClick={() => setIsServicesOpen(false)}
                        className="block px-4 py-3 text-white/80 hover:text-white hover:bg-gold-500/20 transition-colors text-sm border-b border-white/5 last:border-b-0"
                      >
                        {service.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown de Segmentos */}
            <div className="relative" ref={segmentsRef}>
              <button
                onClick={() => {
                  setIsSegmentsOpen(!isSegmentsOpen);
                  setIsServicesOpen(false);
                }}
                className="flex items-center gap-1 text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium"
              >
                {nav.segments}
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${isSegmentsOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isSegmentsOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-[#1a1a2e]/95 backdrop-blur-md border border-white/10 rounded-lg shadow-xl overflow-hidden">
                  <div className="py-2">
                    {segments.items.map((segment: SegmentItem) => (
                      <Link
                        key={segment.slug}
                        href={`/segmentos/${segment.slug}`}
                        onClick={() => setIsSegmentsOpen(false)}
                        className="block px-4 py-3 text-white/80 hover:text-white hover:bg-gold-500/20 transition-colors text-sm border-b border-white/5 last:border-b-0"
                      >
                        {segment.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notícias */}
            <Link
              href="/noticias"
              className="text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium"
            >
              {nav.news}
            </Link>

            {/* Contato */}
            <Link
              href="/contato"
              className="text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium"
            >
              {nav.contact}
            </Link>

            {/* Clientes */}
            <Link
              href="https://onvio.com.br/login/#/"
              className="text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium"
            >
              {nav.clients}
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
          <div className="lg:hidden mt-4 pb-4 pt-4 px-4 rounded-lg bg-[rgba(0,61,125,0.19)] backdrop-blur-[7.1px] shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-white/10">
            <div className="flex flex-col gap-4">
              {/* Home */}
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium"
              >
                {nav.home}
              </Link>

              {/* Quem Somos */}
              <Link
                href="/sobre"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium"
              >
                {nav.about}
              </Link>

              {/* Mobile Dropdown de Serviços */}
              <div className="flex flex-col">
                <button
                  onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                  className="flex items-center justify-between text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium"
                >
                  {nav.services}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isMobileServicesOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isMobileServicesOpen && (
                  <div className="mt-2 ml-4 flex flex-col gap-2 pl-4 py-3 pr-3 rounded-lg bg-[rgba(0,61,125,0.19)] backdrop-blur-[7.1px] shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-white/10">
                    {services.items.map((service: ServiceItem) => (
                      <Link
                        key={service.slug}
                        href={`/servicos/${service.slug}`}
                        onClick={() => {
                          setIsMobileServicesOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                        className="text-white/70 hover:text-gold-500 transition-colors text-sm py-1"
                      >
                        {service.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Dropdown de Segmentos */}
              <div className="flex flex-col">
                <button
                  onClick={() => setIsMobileSegmentsOpen(!isMobileSegmentsOpen)}
                  className="flex items-center justify-between text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium"
                >
                  {nav.segments}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isMobileSegmentsOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isMobileSegmentsOpen && (
                  <div className="mt-2 ml-4 flex flex-col gap-2 pl-4 py-3 pr-3 rounded-lg bg-[rgba(0,61,125,0.19)] backdrop-blur-[7.1px] shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-white/10">
                    {segments.items.map((segment: SegmentItem) => (
                      <Link
                        key={segment.slug}
                        href={`/segmentos/${segment.slug}`}
                        onClick={() => {
                          setIsMobileSegmentsOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                        className="text-white/70 hover:text-gold-500 transition-colors text-sm py-1"
                      >
                        {segment.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Notícias */}
              <Link
                href="/noticias"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium"
              >
                {nav.news}
              </Link>

              {/* Contato */}
              <Link
                href="/contato"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium"
              >
                {nav.contact}
              </Link>

              {/* Clientes */}
              <Link
                href="https://onvio.com.br/login/#/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white/90 hover:text-[#C9983A] transition-colors duration-200 text-sm font-medium"
              >
                {nav.clients}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
