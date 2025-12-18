'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// Opções disponíveis:
// tag = Texto pequeno acima do título
// title = Título principal
// titleHighlight = Parte do título na cor accent
// description = Parágrafo descritivo
// cards = Array de cards {image, title, subtitle, ctaText?, ctaLink?}
// contentPosition = "left" ou "right" (default: "left")
// speed = velocidade da animação em segundos (default: 30)
// ctaText = Texto do CTA geral (opcional)
// ctaLink = Link do CTA geral (opcional)
// backgroundColor = Cor de fundo (default: #ffffff)




export interface CarouselCard {
  image: string;
  title: string;
  subtitle?: string;
  ctaText?: string; // CTA específico do card
  ctaLink?: string;
}

export interface LPCarouselCardsProps {
  // Tag superior
  tag?: string;

  // Título com destaque
  title: string;
  titleHighlight?: string;

  // Descrição
  description?: string;

  // CTA geral (abaixo do título/descrição)
  ctaText?: string;
  ctaLink?: string;

  // Cards do carrossel
  cards: CarouselCard[];

  // Layout
  contentPosition: 'left' | 'right';

  // Carrossel config
  speed?: number; // velocidade da animação em segundos (default: 30)

  // Tema
  accentColor?: string;
  backgroundColor?: string;
}

export default function LPCarouselCards({
  tag,
  title,
  titleHighlight,
  description,
  ctaText,
  ctaLink,
  cards,
  contentPosition = 'left',
  speed = 30,
  accentColor = '#22c55e',
  backgroundColor = '#ffffff',
}: LPCarouselCardsProps) {
  const [isPaused, setIsPaused] = useState(false);

  // Detecta fundo escuro
  const isDarkBg = backgroundColor.toLowerCase() === '#0a0a0a' ||
                   backgroundColor.toLowerCase() === '#000000' ||
                   backgroundColor.toLowerCase() === '#1a1a2e';

  const textColor = isDarkBg ? 'text-white' : 'text-gray-900';
  const descriptionColor = isDarkBg ? 'text-white/70' : 'text-gray-600';
  const cardTextColor = isDarkBg ? 'text-white' : 'text-gray-800';
  const cardSubtitleColor = isDarkBg ? 'text-white/60' : 'text-gray-500';

  // Duplica os cards para criar efeito infinito
  const duplicatedCards = [...cards, ...cards, ...cards];

  // Renderiza o título com highlight
  const renderTitle = () => {
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
    <>
      {/* CSS Keyframes para animação contínua */}
      <style jsx global>{`
        @keyframes scrollCarouselCards {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }
      `}</style>

      <section style={{ backgroundColor }} className="py-44 md:py-28 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center`}>

            {/* Conteúdo de Texto */}
            <motion.div
              className={contentPosition === 'right' ? 'lg:order-2' : 'lg:order-1'}
              initial={{ opacity: 0, x: contentPosition === 'right' ? 30 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Tag */}
              {tag && (
                <span
                  className="text-sm font-medium uppercase tracking-wider mb-4 block"
                  style={{ color: accentColor }}
                >
                  {tag}
                </span>
              )}

              {/* Título */}
              <h2 className={`text-3xl md:text-4xl font-bold mb-6 leading-tight ${textColor}`}>
                {renderTitle()}
              </h2>

              {/* Descrição */}
              {description && (
                <p className={`text-base md:text-lg leading-relaxed ${descriptionColor}`}>
                  {description}
                </p>
              )}

              {/* CTA geral */}
              {ctaText && ctaLink && (
                <Link
                  href={ctaLink}
                  className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 4px 15px ${accentColor}30`,
                  }}
                >
                  {ctaText}
                </Link>
              )}
            </motion.div>

            {/* Carrossel Contínuo */}
            <motion.div
              className={`relative ${contentPosition === 'right' ? 'lg:order-1' : 'lg:order-2'}`}
              initial={{ opacity: 0, x: contentPosition === 'right' ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="overflow-hidden">
                {/* Container com animação contínua */}
                <div
                  className="flex gap-10"
                  style={{
                    animation: `scrollCarouselCards ${speed}s linear infinite`,
                    animationPlayState: isPaused ? 'paused' : 'running',
                    width: 'fit-content',
                  }}
                >
                  {duplicatedCards.map((card, index) => (
                    <div
                      key={`${card.title}-${index}`}
                      className="flex flex-col items-center text-center flex-shrink-0"
                    >
                      {/* Imagem circular */}
                      <div
                        className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mb-4 transition-all duration-300 hover:scale-105"
                        style={{ borderColor: accentColor }}
                      >
                        <Image
                          src={card.image}
                          alt={card.title}
                          fill
                          className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                          sizes="160px"
                        />
                      </div>

                      {/* Título do card */}
                      <h3 className={`font-semibold text-sm md:text-base max-w-[150px] ${cardTextColor}`}>
                        {card.title}
                      </h3>

                      {/* Subtítulo */}
                      {card.subtitle && (
                        <p className={`text-xs md:text-sm ${cardSubtitleColor}`}>
                          {card.subtitle}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
