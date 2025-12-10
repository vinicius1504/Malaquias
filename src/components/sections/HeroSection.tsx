'use client';

import { motion } from 'framer-motion';

/**
 * Props do componente HeroSection
 */
interface HeroSectionProps {
  title1: string;
  highlight1: string;
  title2: string;
  highlight2: string;
  subtitle: string;
  ctaText: string;
}

export default function HeroSection({
  title1,
  highlight1,
  title2,
  highlight2,
  subtitle,
  ctaText,
}: HeroSectionProps) {
  // Variantes de animação para container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  // Variantes de animação para cada elemento
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0, 0, 0.2, 1] as const,
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center">
      {/* ==================== CONTEUDO PRINCIPAL ==================== */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          className="max-w-2xl bg-[#1a1a2e]/60 backdrop-blur-md rounded-2xl p-8 border border-white/10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Titulo principal com animação de aparecer */}
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight mb-6"
            variants={itemVariants}
          >
            <span>{title1} </span>
            <span className="text-gold-500">{highlight1}</span>
            <span>, {title2} </span>
            <span className="text-gold-500">{highlight2}</span>
          </motion.h1>

          {/* Subtitulo */}
          <motion.p
            className="text-lg md:text-xl text-white/80 leading-relaxed mb-10"
            variants={itemVariants}
          >
            {subtitle}
          </motion.p>

          {/* ==================== BOTAO CTA ==================== */}
          <motion.div variants={itemVariants} className="flex justify-end">
            <a
              href="#contato"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-white font-semibold text-sm uppercase tracking-wider rounded hover:from-gold-400 hover:to-gold-500 transition-all duration-300 shadow-lg shadow-gold-500/20"
            >
              {ctaText}
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* ==================== SETA SCROLL ==================== */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 z-10">
        <svg
          className="w-8 h-8 animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
