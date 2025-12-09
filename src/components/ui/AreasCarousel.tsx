'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const cards = [
  {
    icon: (
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
    title: 'Abertura e reestruturação\nde empresa',
    description: 'Lorem ipsum is simply dummy text of the printing and typesetting industry of printing and typesetting industry industry industry.Lorem ipsum is simply dummy text of the printing and typesetting industry of.',
  },
  {
    icon: (
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
    title: 'Abertura e reestruturação\nde empresa',
    description: 'Lorem ipsum is simply dummy text of the printing and typesetting industry of printing and typesetting industry industry industry.Lorem ipsum is simply dummy text of the printing and typesetting industry of.',
  },
  {
    icon: (
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
    title: 'Abertura e reestruturação\nde empresa',
    description: 'Lorem ipsum is simply dummy text of the printing and typesetting industry of printing and typesetting industry industry industry.Lorem ipsum is simply dummy text of the printing and typesetting industry of.',
  },
  {
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="24" stroke="#C9983A" strokeWidth="2"/>
        <path d="M32 16v16l12 8" stroke="#C9983A" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="32" cy="32" r="4" fill="#C9983A"/>
      </svg>
    ),
    title: 'Consultoria\nTributária',
    description: 'Lorem ipsum is simply dummy text of the printing and typesetting industry of printing and typesetting industry industry industry.Lorem ipsum is simply dummy text of the printing and typesetting industry of.',
  },
  {
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="12" y="20" width="40" height="32" rx="2" stroke="#C9983A" strokeWidth="2"/>
        <path d="M12 28h40" stroke="#C9983A" strokeWidth="2"/>
        <rect x="18" y="34" width="12" height="8" rx="1" fill="#C9983A" fillOpacity="0.5"/>
        <path d="M20 12h24l4 8H16l4-8z" stroke="#C9983A" strokeWidth="2"/>
      </svg>
    ),
    title: 'Gestão\nFinanceira',
    description: 'Lorem ipsum is simply dummy text of the printing and typesetting industry of printing and typesetting industry industry industry.Lorem ipsum is simply dummy text of the printing and typesetting industry of.',
  },
  {
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 8v48M16 24l16-16 16 16M16 40l16 16 16-16" stroke="#C9983A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="32" cy="32" r="8" fill="#C9983A" fillOpacity="0.3" stroke="#C9983A" strokeWidth="2"/>
      </svg>
    ),
    title: 'Planejamento\nEstratégico',
    description: 'Lorem ipsum is simply dummy text of the printing and typesetting industry of printing and typesetting industry industry industry.Lorem ipsum is simply dummy text of the printing and typesetting industry of.',
  },
];

export default function AreasCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number>();
  const directionRef = useRef<1 | -1>(1);
  const progressRef = useRef(0);
  const pauseTimeRef = useRef(0);

  // Detecta quando o carousel entra na viewport
  const isInView = useInView(containerRef, { once: true, margin: '-50px' });

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    const speed = 0.4;
    const pauseDuration = 60; // frames de pausa nas extremidades

    const animate = () => {
      if (isPaused) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Pausa nas extremidades
      if (pauseTimeRef.current > 0) {
        pauseTimeRef.current--;
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Movimento suave
      progressRef.current += speed * directionRef.current;

      // Chegou no final - inverte direção
      if (progressRef.current >= maxScroll) {
        progressRef.current = maxScroll;
        directionRef.current = -1;
        pauseTimeRef.current = pauseDuration;
      }

      // Chegou no início - inverte direção
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
          {cards.map((card, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg p-6 shadow-sm w-[380px] flex-shrink-0 transition-transform duration-300 hover:scale-[1.02]"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: 'easeOut'
              }}
            >
              <div className="w-16 h-16 mb-4">{card.icon}</div>
              <h3 className="text-lg font-semibold text-dark-900 mb-3 whitespace-pre-line">
                {card.title}
              </h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                {card.description}
              </p>
              <button className="px-6 py-2 bg-gradient-to-r from-gold-400 to-gold-500 text-white text-sm font-medium rounded hover:from-gold-500 hover:to-gold-600 transition-all">
                Saiba Mais!
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
