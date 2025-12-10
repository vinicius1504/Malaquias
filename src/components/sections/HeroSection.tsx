'use client';

import { motion } from 'framer-motion';

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
  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background Video */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/header.png"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/images/videos/video1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e]/95 via-[#1a1a2e]/70 to-transparent" />
      </div>

      {/* Conteudo Principal */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-2xl">
          {/* Titulo */}
          <motion.h1
            className="text-4xl md:text-5xl lg:text-5xl font-heading font-bold text-white leading-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span>{title1} </span>
            <span className="text-gold-500">{highlight1}</span>
            <span>, {title2} </span>
            <span className="text-gold-500">{highlight2}</span>
          </motion.h1>

          {/* Subtitulo */}
          <motion.p
            className="text-lg md:text-xl text-white/80 leading-relaxed mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {subtitle}
          </motion.p>
        </div>
      </div>

      {/* Botao CTA */}
      <motion.div
        className="absolute bottom-32 right-20 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <a
          href="#contato"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-white font-semibold text-sm uppercase tracking-wider rounded hover:from-gold-400 hover:to-gold-500 transition-all duration-300 shadow-lg shadow-gold-500/20"
        >
          {ctaText}
        </a>
      </motion.div>

      {/* Triangulo Decorativo */}
      <div className="absolute bottom-0 right-0 w-1/2 h-32">
        <svg
          viewBox="0 0 500 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <polygon
            points="500,100 500,0 0,100"
            fill="#8B7355"
            fillOpacity="0.6"
          />
          <polygon
            points="500,100 500,30 100,100"
            fill="#C9983A"
            fillOpacity="0.8"
          />
        </svg>
        <motion.div
          className="absolute bottom-4 right-1/4 text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
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
        </motion.div>
      </div>
    </section>
  );
}
