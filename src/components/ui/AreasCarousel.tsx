'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

// Mapeamento de ícones SVG
const icons: Record<string, JSX.Element> = {
  building: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="48" height="48" rx="4" stroke="#C9983A" strokeWidth="2"/>
      <rect x="16" y="16" width="32" height="8" rx="2" fill="#C9983A" fillOpacity="0.3"/>
      <rect x="16" y="28" width="32" height="4" rx="1" fill="#C9983A" fillOpacity="0.5"/>
      <rect x="16" y="36" width="24" height="4" rx="1" fill="#C9983A" fillOpacity="0.5"/>
      <rect x="16" y="44" width="28" height="4" rx="1" fill="#C9983A" fillOpacity="0.5"/>
      <circle cx="52" cy="52" r="10" fill="#C9983A"/>
      <path d="M48 52h8M52 48v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="48" height="48" rx="4" stroke="#C9983A" strokeWidth="2"/>
      <rect x="16" y="32" width="8" height="16" rx="1" fill="#C9983A" fillOpacity="0.5"/>
      <rect x="28" y="24" width="8" height="24" rx="1" fill="#C9983A" fillOpacity="0.7"/>
      <rect x="40" y="16" width="8" height="32" rx="1" fill="#C9983A"/>
    </svg>
  ),
  shieldCheck: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 8L12 16v16c0 12 8 22 20 26 12-4 20-14 20-26V16L32 8z" stroke="#C9983A" strokeWidth="2" fill="#C9983A" fillOpacity="0.1"/>
      <path d="M24 32l6 6 10-12" stroke="#C9983A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  document: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 8h24l12 12v36a4 4 0 01-4 4H16a4 4 0 01-4-4V12a4 4 0 014-4z" stroke="#C9983A" strokeWidth="2" fill="#C9983A" fillOpacity="0.1"/>
      <path d="M40 8v12h12" stroke="#C9983A" strokeWidth="2"/>
      <rect x="20" y="28" width="24" height="3" rx="1" fill="#C9983A" fillOpacity="0.5"/>
      <rect x="20" y="36" width="20" height="3" rx="1" fill="#C9983A" fillOpacity="0.5"/>
      <rect x="20" y="44" width="16" height="3" rx="1" fill="#C9983A" fillOpacity="0.5"/>
    </svg>
  ),
  users: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="20" r="8" stroke="#C9983A" strokeWidth="2" fill="#C9983A" fillOpacity="0.2"/>
      <circle cx="40" cy="20" r="8" stroke="#C9983A" strokeWidth="2" fill="#C9983A" fillOpacity="0.2"/>
      <path d="M8 52c0-8 8-14 16-14s16 6 16 14" stroke="#C9983A" strokeWidth="2" fill="#C9983A" fillOpacity="0.1"/>
      <path d="M32 52c0-8 8-14 16-14s8 6 8 14" stroke="#C9983A" strokeWidth="2" fill="#C9983A" fillOpacity="0.1"/>
    </svg>
  ),
  userTax: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="20" r="10" stroke="#C9983A" strokeWidth="2" fill="#C9983A" fillOpacity="0.2"/>
      <path d="M8 56c0-10 10-18 20-18s20 8 20 18" stroke="#C9983A" strokeWidth="2" fill="#C9983A" fillOpacity="0.1"/>
      <rect x="40" y="36" width="18" height="18" rx="2" fill="#C9983A"/>
      <path d="M45 45h8M49 41v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  certificate: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="40" height="48" rx="4" stroke="#C9983A" strokeWidth="2" fill="#C9983A" fillOpacity="0.1"/>
      <rect x="16" y="16" width="24" height="4" rx="1" fill="#C9983A" fillOpacity="0.5"/>
      <rect x="16" y="24" width="20" height="3" rx="1" fill="#C9983A" fillOpacity="0.3"/>
      <rect x="16" y="32" width="16" height="3" rx="1" fill="#C9983A" fillOpacity="0.3"/>
      <circle cx="48" cy="44" r="12" fill="#C9983A"/>
      <path d="M44 44l3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

// Ícone padrão caso não encontre
const defaultIcon = (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="24" stroke="#C9983A" strokeWidth="2" fill="#C9983A" fillOpacity="0.1"/>
    <circle cx="32" cy="32" r="8" fill="#C9983A"/>
  </svg>
);

export default function AreasCarousel() {
  const { t } = useLanguage();
  const services = t.services.items;

  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number>();
  const directionRef = useRef<1 | -1>(1);
  const progressRef = useRef(0);
  const pauseTimeRef = useRef(0);

  const isInView = useInView(containerRef, { once: true, margin: '-50px' });

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    const speed = 0.4;
    const pauseDuration = 60;

    const animate = () => {
      if (isPaused) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      if (pauseTimeRef.current > 0) {
        pauseTimeRef.current--;
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      progressRef.current += speed * directionRef.current;

      if (progressRef.current >= maxScroll) {
        progressRef.current = maxScroll;
        directionRef.current = -1;
        pauseTimeRef.current = pauseDuration;
      }

      if (progressRef.current <= 0) {
        progressRef.current = 0;
        directionRef.current = 1;
        pauseTimeRef.current = pauseDuration;
      }

      scrollContainer.scrollLeft = progressRef.current;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused]);

  return (
    <div ref={containerRef}>
      <motion.div
        ref={scrollRef}
        className="max-w-[1200px] mx-auto overflow-x-auto scrollbar-hide scroll-smooth"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{ scrollBehavior: 'auto' }}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex gap-6 pb-4 px-6 w-max">
          {services.map((service: { icon: string; title: string; shortDescription: string; slug: string }, index: number) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg p-6 shadow-sm w-[380px] h-[320px] flex-shrink-0 transition-transform duration-300 hover:scale-[1.02] flex flex-col"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.25, 0.1, 0.25, 1]
              }}
            >
              <div className="w-16 h-16 mb-4">
                {icons[service.icon] || defaultIcon}
              </div>
              <h3 className="text-lg font-semibold text-dark-900 mb-3 line-clamp-2">
                {service.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed flex-1 line-clamp-4">
                {service.shortDescription}
              </p>
              <a
                href={`/servicos/${service.slug}`}
                className="px-6 py-2 bg-gradient-to-r from-gold-400 to-gold-500 text-white text-sm font-medium rounded hover:from-gold-500 hover:to-gold-600 transition-all mt-4 self-start inline-block"
              >
                Saiba Mais!
              </a>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
