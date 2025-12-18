'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// Opções disponíveis:
// tag               = Texto pequeno acima do título                = -
// title             = Título principal                             = -
// titleHighlight    = Parte do título na cor accent                = -
// tabs              = Array de tabs {label, title, items}          = -
// logoSvg           = Caminho do SVG temático da LP                = /images/logos/Vector.svg
// logoPosition      = "left" ou "right" (posição da logo)          = "left"
// ctaText           = Texto acima do botão CTA                     = -
// ctaButtonText     = Texto do botão CTA                           = -
// ctaButtonLink     = Link do botão CTA                            = -
// backgroundColor   = Cor de fundo                                 = #ffffff
// accentColor       = Cor de destaque                              = #22c55e

export interface ServiceTab {
  label: string;
  title: string;
  items: string[];
}

export interface LPServicesTabsProps {
  // Tag superior
  tag?: string;

  // Título com destaque
  title?: string;
  titleHighlight?: string;

  // Tabs de serviços
  tabs: ServiceTab[];

  // CTA no final (opcional)
  ctaText?: string; // texto acima do botão
  ctaButtonText?: string;
  ctaButtonLink?: string;

  // Layout
  logoSvg?: string; // caminho do SVG temático (ex: /images/logos/agro-icon.svg)
  logoPosition?: 'left' | 'right'; // posição da logo (esquerda ou direita do conteúdo)

  // Tema
  accentColor?: string;
  backgroundColor?: string;
}

export default function LPServicesTabs({
  tag,
  title,
  titleHighlight,
  tabs,
  ctaText,
  ctaButtonText,
  ctaButtonLink,
  logoSvg = '/images/logos/Vector.svg',
  logoPosition = 'left',
  accentColor = '#22c55e',
  backgroundColor = '#ffffff',
}: LPServicesTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  // Detecta fundo escuro
  const isDarkBg =
    backgroundColor.toLowerCase() === '#0a0a0a' ||
    backgroundColor.toLowerCase() === '#000000' ||
    backgroundColor.toLowerCase() === '#1a1a2e';

  const textColor = isDarkBg ? 'text-white' : 'text-gray-900';
  const itemColor = isDarkBg ? 'text-white/80' : 'text-gray-600';

  // Renderiza o título com highlight
  const renderTitle = () => {
    if (!title) return null;
    if (!titleHighlight) return title;

    const parts = title.split(titleHighlight);
    return (
      <>
        {parts[0]}
        <span style={{ color: accentColor }}>{titleHighlight}</span>
        {parts[1] || ''}
      </>
    );
  };

  return (
    <section style={{ backgroundColor }} className="py-44 md:py-28 overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Tag e Título opcional */}
        {(tag || title) && (
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {tag && (
              <span
                className="text-sm font-medium uppercase tracking-wider mb-4 block"
                style={{ color: accentColor }}
              >
                {tag}
              </span>
            )}
            {title && (
              <h2 className={`text-3xl md:text-4xl font-bold ${textColor}`}>
                {renderTitle()}
              </h2>
            )}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Logo */}
          <motion.div
            className={`relative flex ${logoPosition === 'right' ? 'lg:order-2 justify-end' : 'lg:order-1 justify-start'}`}
            initial={{ opacity: 0, x: logoPosition === 'right' ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative w-64 h-80 md:w-80 md:h-96 lg:w-96 lg:h-[450px]">
              {/* Logo temática da LP */}
              <Image
                src={logoSvg}
                alt="Logo temática"
                fill
                className="object-contain"
              />
            </div>
          </motion.div>

          {/* Conteúdo com Tabs */}
          <motion.div
            className={logoPosition === 'right' ? 'lg:order-1' : 'lg:order-2'}
            initial={{ opacity: 0, x: logoPosition === 'right' ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Tabs */}
            <div className="flex flex-wrap gap-3 mb-8">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border-2 ${
                    activeTab === index
                      ? 'text-white'
                      : isDarkBg
                      ? 'text-white/70 border-white/30 hover:border-white/50'
                      : 'text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                  style={{
                    backgroundColor: activeTab === index ? accentColor : 'transparent',
                    borderColor: activeTab === index ? accentColor : undefined,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Conteúdo da Tab Ativa */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Título da Tab */}
                <h3 className={`text-2xl md:text-3xl font-bold mb-6 ${textColor}`}>
                  {tabs[activeTab].title}
                </h3>

                {/* Items */}
                <ul className="space-y-3">
                  {tabs[activeTab].items.map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`flex items-start gap-3 ${itemColor}`}
                    >
                      <span
                        className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: accentColor }}
                      />
                      <span className="text-base md:text-lg leading-relaxed">
                        {item}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTA de recomendação */}
                {ctaButtonText && ctaButtonLink && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    {ctaText && (
                      <p className={`text-base mb-4 ${itemColor}`}>
                        {ctaText}
                      </p>
                    )}
                    <Link
                      href={ctaButtonLink}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      style={{
                        backgroundColor: accentColor,
                        boxShadow: `0 4px 15px ${accentColor}30`,
                      }}
                    >
                      {ctaButtonText}
                    </Link>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
