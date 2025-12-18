'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export interface LPTextImageProps {
  // Tag superior (pequeno texto acima do título)
  tag?: string;

  // Título com parte destacada
  title: string;
  titleHighlight?: string; // parte do título em destaque (cor accent)

  // Parágrafos de texto
  paragraphs: string[];

  // CTA no final do texto (opcional)
  ctaText?: string; // texto acima do botão
  ctaButtonText?: string;
  ctaButtonLink?: string;

  // Imagem
  image: string;
  imageAlt?: string;

  // Layout
  imagePosition: 'left' | 'right';

  // Tema
  accentColor?: string;
  backgroundColor?: string; // cor de fundo da section
}

export default function LPTextImage({
  tag,
  title,
  titleHighlight,
  paragraphs,
  ctaText,
  ctaButtonText,
  ctaButtonLink,
  image,
  imageAlt = '',
  imagePosition = 'right',
  accentColor = '#22c55e',
  backgroundColor = '#ffffff',
}: LPTextImageProps) {
  // Determina se é fundo escuro para ajustar cores do texto
  const isDarkBg = backgroundColor.toLowerCase() === '#0a0a0a' ||
                   backgroundColor.toLowerCase() === '#000000' ||
                   backgroundColor.toLowerCase() === '#1a1a2e';

  const textColor = isDarkBg ? 'text-white' : 'text-gray-900';
  const paragraphColor = isDarkBg ? 'text-white/70' : 'text-gray-600';

  // Função para renderizar o título com highlight
  const renderTitle = () => {
    if (!titleHighlight) {
      return title;
    }

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
    <section style={{ backgroundColor }} className="py-44 md:py-28">
      <div className="container mx-auto px-6">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
          imagePosition === 'left' ? 'lg:flex-row-reverse' : ''
        }`}>

          {/* Conteúdo de Texto */}
          <motion.div
            className={imagePosition === 'left' ? 'lg:order-2' : 'lg:order-1'}
            initial={{ opacity: 0, x: imagePosition === 'left' ? 30 : -30 }}
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
            <h2 className={`text-3xl md:text-4xl lg:text-4xl font-bold mb-6 leading-tight ${textColor}`}>
              {renderTitle()}
            </h2>

            {/* Linha decorativa */}
            <div
              className="w-20 h-1 mb-6"
              style={{ backgroundColor: accentColor }}
            />

            {/* Parágrafos */}
            <div className="space-y-4">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className={`text-base md:text-lg leading-relaxed ${paragraphColor}`}
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* CTA no final do texto */}
            {ctaButtonText && ctaButtonLink && (
              <div className="mt-8">
                {ctaText && (
                  <p className={`text-base mb-4 ${paragraphColor}`}>
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

          {/* Imagem */}
          <motion.div
            className={`relative ${imagePosition === 'left' ? 'lg:order-1' : 'lg:order-2'}`}
            initial={{ opacity: 0, x: imagePosition === 'left' ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
              <Image
                src={image}
                alt={imageAlt || title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Decoração opcional */}
            <div
              className={`absolute -z-10 w-full h-full rounded-lg ${
                imagePosition === 'left' ? '-right-4 -bottom-4' : '-left-4 -bottom-4'
              }`}
              style={{ backgroundColor: `${accentColor}20` }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
