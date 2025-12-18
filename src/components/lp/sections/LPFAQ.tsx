'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Opções disponíveis:
// tag               = Texto pequeno acima do título                = -
// title             = Título principal                             = -
// titleHighlight    = Parte do título na cor accent                = -
// description       = Descrição abaixo do título                   = -
// questions         = Array de {question, answer}                  = -
// ctaText           = Texto acima do botão CTA                     = -
// ctaButtonText     = Texto do botão CTA                           = -
// ctaButtonLink     = Link do botão CTA                            = -
// backgroundImage   = URL da imagem de fundo                       = -
// backgroundVideo   = URL do vídeo de fundo                        = -
// backgroundColor   = Cor de fundo (usado se não tiver mídia)      = #0a0a0a
// accentColor       = Cor de destaque                              = #22c55e

export interface FAQItem {
  question: string;
  answer: string;
}

export interface LPFAQProps {
  // Tag superior
  tag?: string;

  // Título com destaque
  title: string;
  titleHighlight?: string;

  // Descrição
  description?: string;

  // Perguntas e respostas
  questions: FAQItem[];

  // CTA após as perguntas (opcional)
  ctaText?: string; // texto acima do botão
  ctaButtonText?: string;
  ctaButtonLink?: string;

  // Background
  backgroundImage?: string;
  backgroundVideo?: string;

  // Tema
  accentColor?: string;
  backgroundColor?: string;
}

export default function LPFAQ({
  tag,
  title,
  titleHighlight,
  description,
  questions,
  ctaText,
  ctaButtonText,
  ctaButtonLink,
  backgroundImage,
  backgroundVideo,
  accentColor = '#22c55e',
  backgroundColor = '#0a0a0a',
}: LPFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Se tem imagem ou vídeo de fundo, considera como fundo escuro (overlay escuro)
  const hasBackground = backgroundImage || backgroundVideo;
  const isDarkBg = hasBackground ||
    backgroundColor.toLowerCase() === '#0a0a0a' ||
    backgroundColor.toLowerCase() === '#000000' ||
    backgroundColor.toLowerCase() === '#1a1a2e';

  const textColor = isDarkBg ? 'text-white' : 'text-gray-900';
  const descriptionColor = isDarkBg ? 'text-white/70' : 'text-gray-600';
  const borderColor = isDarkBg ? 'border-white/20' : 'border-gray-200';
  const hoverBg = isDarkBg ? 'hover:bg-white/5' : 'hover:bg-gray-50';

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

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-44 md:py-28 overflow-hidden">
      {/* Background */}
      {backgroundVideo ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      ) : backgroundImage ? (
        <Image
          src={backgroundImage}
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ backgroundColor }}
        />
      )}

      {/* Overlay escuro para legibilidade */}
      {hasBackground && (
        <div className="absolute inset-0 bg-black/60" />
      )}

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
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
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textColor}`}>
            {renderTitle()}
          </h2>

          {/* Descrição */}
          {description && (
            <p className={`text-base md:text-lg ${descriptionColor}`}>
              {description}
            </p>
          )}
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {questions.map((item, index) => (
            <div
              key={index}
              className={`border-b ${borderColor}`}
            >
              <button
                onClick={() => toggleQuestion(index)}
                className={`w-full py-5 flex items-center justify-between text-left transition-colors ${hoverBg}`}
              >
                <span className={`text-base md:text-lg font-medium pr-4 ${textColor}`}>
                  {item.question}
                </span>
                <motion.span
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown
                    size={24}
                    style={{ color: openIndex === index ? accentColor : isDarkBg ? '#9ca3af' : '#6b7280' }}
                  />
                </motion.span>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className={`pb-5 text-base leading-relaxed ${descriptionColor}`}>
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* CTA após as perguntas */}
          {ctaButtonText && ctaButtonLink && (
            <motion.div
              className="mt-10 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {ctaText && (
                <p className={`text-base mb-4 ${descriptionColor}`}>
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
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
