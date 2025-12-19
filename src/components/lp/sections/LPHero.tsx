'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export interface LPHeroProps {
  // Textos principais
  title: string;
  description: string;

  // CTA Primário (destaque)
  ctaText: string;
  ctaLink: string;

  // CTA Secundário (opcional - outline)
  ctaSecondaryText?: string;
  ctaSecondaryLink?: string;

  // Microcopy de confiança (abaixo dos CTAs)
  trustText?: string;

  // Cards inferiores (3 destaques)
  highlights: {
    text: string;
    emphasis?: string;
  }[];

  // Background - pode ser vídeo(s), imagem ou ambos
  backgroundType: 'video' | 'image';
  backgroundVideos?: string[]; // Array de vídeos para carousel
  backgroundVideo?: string; // Mantém compatibilidade com vídeo único
  backgroundImage?: string;

  // Configuração do carousel de vídeos
  videoDuration?: number; // Duração de cada vídeo em segundos (default: 5)

  // Tema
  accentColor?: string;
}

export default function LPHero({
  title,
  description,
  ctaText,
  ctaLink,
  ctaSecondaryText,
  ctaSecondaryLink,
  trustText,
  highlights,
  backgroundType,
  backgroundVideos,
  backgroundVideo,
  backgroundImage,
  videoDuration = 5,
  accentColor = '#22c55e',
}: LPHeroProps) {
  // Normaliza os vídeos para sempre ser um array
  const videos = backgroundVideos || (backgroundVideo ? [backgroundVideo] : []);
  const hasMultipleVideos = videos.length > 1;

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Função para ir para o próximo vídeo
  const goToNextVideo = useCallback(() => {
    if (!hasMultipleVideos) return;

    setIsTransitioning(true);

    setTimeout(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
      setIsTransitioning(false);
    }, 500); // Tempo do fade
  }, [hasMultipleVideos, videos.length]);

  // Timer para trocar vídeos automaticamente
  useEffect(() => {
    if (!hasMultipleVideos || backgroundType !== 'video') return;

    timerRef.current = setInterval(() => {
      goToNextVideo();
    }, videoDuration * 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [hasMultipleVideos, backgroundType, videoDuration, goToNextVideo]);

  // Garante que o vídeo atual está tocando
  useEffect(() => {
    if (backgroundType !== 'video' || videos.length === 0) return;

    const currentVideo = videoRefs.current[currentVideoIndex];
    if (currentVideo) {
      currentVideo.currentTime = 0;
      currentVideo.play().catch(() => {
        // Autoplay pode ser bloqueado pelo navegador
      });
    }
  }, [currentVideoIndex, backgroundType, videos.length]);

  return (
    <section className="relative min-h-screen py-20 md:py-32 flex flex-col justify-between">
      {/* Background Video ou Image */}
      <div className="absolute inset-0 overflow-hidden">
        {backgroundType === 'video' && videos.length > 0 ? (
          <>
            {/* Renderiza todos os vídeos, mas só mostra o atual */}
            {videos.map((videoSrc, index) => (
              <AnimatePresence key={videoSrc} mode="wait">
                {index === currentVideoIndex && (
                  <motion.video
                    ref={(el) => { videoRefs.current[index] = el; }}
                    autoPlay
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    poster={backgroundImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isTransitioning ? 0 : 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <source src={videoSrc} type="video/mp4" />
                  </motion.video>
                )}
              </AnimatePresence>
            ))}

            {/* Indicadores de vídeo (se mais de um) */}
            {hasMultipleVideos && (
              <div className="absolute bottom-32 right-6 z-20 flex flex-col gap-2">
                {videos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (timerRef.current) clearInterval(timerRef.current);
                      setCurrentVideoIndex(index);
                      timerRef.current = setInterval(goToNextVideo, videoDuration * 1000);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentVideoIndex
                        ? 'bg-white scale-125'
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`Vídeo ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : backgroundImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        ) : null}

        {/* Overlay gradiente escuro */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/70 via-[#0a0a0a]/60 to-[#0a0a0a]/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 container mx-auto px-6 flex-1 flex flex-col">
        {/* Título e descrição */}
        <div className="max-w-3xl pb-8 md:pb-32 flex flex-col justify-between flex-1">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            style={{ color: accentColor }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {title}
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-white/80 leading-relaxed mb-10 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {description}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* CTA Primário */}
            <Link
              href={ctaLink}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 4px 20px ${accentColor}40`,
              }}
            >
              {ctaText}
            </Link>

            {/* CTA Secundário (outline) */}
            {ctaSecondaryText && ctaSecondaryLink && (
              <Link
                href={ctaSecondaryLink}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 border-2"
                style={{
                  borderColor: accentColor,
                  color: accentColor,
                }}
              >
                {ctaSecondaryText}
              </Link>
            )}
          </motion.div>

          {/* Microcopy de confiança */}
          {trustText && (
            <motion.p
              className="mt-4 text-sm text-white/60 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {trustText}
            </motion.p>
          )}
        </div>

        {/* Cards de destaque (inferior) - Mobile: relative, Desktop: absolute */}
        <motion.div
          className="relative md:absolute md:bottom-0 md:left-0 md:right-0 mt-8 md:mt-0"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="md:container md:mx-auto md:px-6 pb-6 md:pb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="bg-[#0a0a0a]/60 backdrop-blur-sm border border-white/10 rounded-lg p-4 md:p-6"
                >
                  <p className="text-white/90 leading-relaxed text-sm md:text-base">
                    {highlight.emphasis ? (
                      <>
                        <span style={{ color: accentColor }} className="font-semibold">
                          {highlight.emphasis}
                        </span>{' '}
                        {highlight.text}
                      </>
                    ) : (
                      highlight.text
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
