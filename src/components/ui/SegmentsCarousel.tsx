'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Segment {
  id: number;
  title: string;
  image: string;
}

const segments: Segment[] = [
  { id: 1, title: 'Comércio', image: '/images/segmentos/comercio.jpg' },
  { id: 2, title: 'Serviços', image: '/images/segmentos/servicos.jpg' },
  { id: 3, title: 'Indústria', image: '/images/segmentos/industria.jpg' },
  { id: 4, title: 'Tecnologia', image: '/images/segmentos/tecnologia.jpg' },
  { id: 5, title: 'Saúde', image: '/images/segmentos/saude.jpg' },
  { id: 6, title: 'Educação', image: '/images/segmentos/educacao.jpg' },
  { id: 7, title: 'Construção', image: '/images/segmentos/construcao.jpg' },
  { id: 8, title: 'Alimentação', image: '/images/segmentos/alimentacao.jpg' },
];

export default function SegmentsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const visibleCount = 3;

  const getVisibleSegments = useCallback(() => {
    const result: Segment[] = [];
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % segments.length;
      result.push(segments[index]);
    }
    return result;
  }, [currentIndex]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % segments.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const visibleSegments = getVisibleSegments();

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel Container */}
      <div className="flex gap-6 justify-center">
        <AnimatePresence mode="popLayout">
          {visibleSegments.map((segment, idx) => {
            const globalIndex = (currentIndex + idx) % segments.length;
            const isHovered = hoveredIndex === idx;

            return (
              <motion.div
                key={`${segment.id}-${currentIndex}-${idx}`}
                className="relative w-[350px] h-[280px] md:w-[400px] md:h-[300px] rounded-xl overflow-hidden cursor-pointer flex-shrink-0"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Image */}
                <Image
                  src={segment.image}
                  alt={segment.title}
                  fill
                  className="object-cover transition-transform duration-500"
                  style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
                />

                {/* Overlay - aparece no hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Numeração */}
                  <span className="text-gold-500 font-bold text-5xl mb-2">
                    {String(globalIndex + 1).padStart(2, '0')}
                  </span>
                  {/* Título */}
                  <h3 className="text-white font-heading font-semibold text-2xl">
                    {segment.title}
                  </h3>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
