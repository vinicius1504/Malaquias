'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Phone, Mail, MapPin, LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  phone: Phone,
  mail: Mail,
  mapPin: MapPin,
};

interface ContactInfo {
  icon: string;
  text: string;
}

export default function Footer() {
  const { t } = useLanguage();
  const { footer } = t.home;

  const renderContactItem = (info: ContactInfo, isAddress = false) => {
    const Icon = iconMap[info.icon];
    return (
      <p className={`flex ${isAddress ? 'items-start' : 'items-center'} gap-3`}>
        {Icon && <Icon className={`w-4 h-4 text-gold-500 flex-shrink-0 ${isAddress ? 'mt-0.5' : ''}`} />}
        {info.text}
      </p>
    );
  };

  return (
    <footer className="relative pt-24 z-10">
      {/* Glassmorphism container - Logo 3D aparece atrás como marca d'água */}
      <div className="bg-[#1a1a2e]/70 backdrop-blur-md border-t border-white/10 rounded-t-2xl mx-6">
        {/* CTA Section */}
        <div className="container mx-auto px-6 md:px-12 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left - CTA Text */}
            <div className="flex items-center gap-6">
              <div className="w-1 h-14 bg-gold-500" />
              <p className="text-white text-lg font-medium">
                {footer.cta}
              </p>
            </div>

            {/* Right - Button and Social */}
            <div className="flex items-center gap-8">
              <Link
                href="#contato"
                className="px-6 py-3 bg-gold-500 hover:bg-gold-400 text-white font-medium rounded transition-colors"
              >
                {footer.ctaButton}
              </Link>

              {/* Social Icons - com atributos de segurança para links externos */}
              <div className="flex items-center gap-5">
                <a
                  href="#"
                  className="text-gold-500 hover:text-gold-400 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gold-500 hover:text-gold-400 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gold-500 hover:text-gold-400 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gold-500 hover:text-gold-400 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gold-500 hover:text-gold-400 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Locations Section */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-6 md:px-12 py-10 md:py-14">
            <h3 className="text-white font-semibold mb-8">{footer.locations.title}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Matriz */}
              <div className="text-white/70 text-sm space-y-3">
                <h4 className="text-white font-medium mb-4">{footer.locations.matriz.title}</h4>
                {renderContactItem(footer.locations.matriz.phone)}
                {renderContactItem(footer.locations.matriz.email)}
                {renderContactItem(footer.locations.matriz.address, true)}
              </div>

              {/* Filial */}
              <div className="text-white/70 text-sm space-y-3">
                <h4 className="text-white font-medium mb-4">{footer.locations.filial.title}</h4>
                {renderContactItem(footer.locations.filial.phone)}
                {renderContactItem(footer.locations.filial.email)}
                {renderContactItem(footer.locations.filial.address, true)}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Registrations */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-6 md:px-12 py-6 md:py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-white/60 text-sm">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-12">
                <span>{footer.registrations.crc}</span>
                <span>{footer.registrations.crcRt}</span>
                <span>{footer.registrations.cnpj}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gold line at bottom */}
        <div className="h-1 bg-gold-500" />
      </div>
    </footer>
  );
}
