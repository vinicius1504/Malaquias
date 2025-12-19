'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import type { Segment } from '@/types/database';

export default function SegmentsCarousel() {
  const [segments, setSegments] = useState<Partial<Segment>[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  // Buscar segmentos do banco
  useEffect(() => {
    async function fetchSegments() {
      try {
        const response = await fetch('/api/segments');
        if (response.ok) {
          const data = await response.json();
          if (data.segments && data.segments.length > 0) {
            setSegments(data.segments);
          }
        }
      } catch (error) {
        console.log('Usando fallback para segmentos:', error);
      }
    }
    fetchSegments();
  }, []);

  if (segments.length === 0) return null;

  // Duplica os segmentos para criar efeito infinito
  const duplicatedSegments = [...segments, ...segments, ...segments];

  return (
    <>
      {/* CSS Keyframes para animação contínua */}
      <style jsx global>{`
        @keyframes scrollSegments {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }
      `}</style>

      <div
        className="relative w-full overflow-hidden flex justify-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Container que limita a 3 itens visíveis */}
        <div className="w-full max-w-[1300px] lg:max-w-[1550px] overflow-hidden">
          {/* Carousel Container - Animação Contínua */}
          <div
            className="flex gap-10"
            style={{
              animation: 'scrollSegments 60s linear infinite',
              animationPlayState: isPaused ? 'paused' : 'running',
              width: 'fit-content',
            }}
          >
            {duplicatedSegments.map((segment, idx) => {
              const segmentNumber = (segment.display_order !== undefined ? segment.display_order : idx % segments.length) + 1;
              const isHovered = hoveredId === `${segment.id}-${idx}`;
              const uniqueKey = `${segment.id}-${idx}`;
              const segmentSlug = segment.lp_slug || null;

              const handleMouseEnter = () => {
                setHoveredId(uniqueKey);
                if (segment.video_url && segment.id) {
                  const video = videoRefs.current[uniqueKey];
                  if (video) {
                    video.play().catch(() => {});
                  }
                }
              };

              const handleMouseLeave = () => {
                if (segment.video_url && segment.id) {
                  const video = videoRefs.current[uniqueKey];
                  if (video) {
                    video.pause();
                    video.currentTime = 0;
                  }
                }
                setHoveredId(null);
              };

              const cardContent = (
                <div className="relative w-[550px] h-[480px] md:w-[400px] md:h-[300px] lg:w-[720px] lg:h-[590px] rounded-2xl overflow-hidden cursor-pointer">
                  {/* Video ou Image */}
                  {segment.video_url ? (
                    <video
                      ref={(el) => {
                        videoRefs.current[uniqueKey] = el;
                      }}
                      src={segment.video_url}
                      muted
                      loop
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 pointer-events-none"
                      style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
                      poster={segment.image_url || undefined}
                    />
                  ) : (
                    <Image
                      src={segment.image_url || '/images/placeholder.jpg'}
                      alt={segment.title || ''}
                      fill
                      className="object-cover transition-transform duration-500 pointer-events-none"
                      style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
                      draggable={false}
                    />
                  )}

                  {/* Overlay no hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent pointer-events-none transition-opacity duration-300 ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  {/* Conteúdo - aparece no hover */}
                  <div
                    className={`absolute inset-0 flex flex-col justify-end p-6 pointer-events-none transition-opacity duration-300 ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {/* Número na lateral esquerda */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center">
                      <span
                        className="font-light text-7xl md:text-8xl"
                        style={{
                          fontFamily: 'var(--font-heading)',
                          WebkitTextStroke: '1px #BD9657',
                          WebkitTextFillColor: 'transparent',
                          color: 'transparent'
                        }}
                      >
                        {segmentNumber}
                      </span>
                    </div>

                    {/* Título */}
                    <div className="ml-20">
                      <h3 className="text-white font-heading font-semibold text-xl md:text-2xl">
                        Contabilidade
                      </h3>
                      <h3 className="text-white font-heading font-semibold text-xl md:text-2xl">
                        para {segment.title}
                      </h3>
                    </div>
                  </div>

                  {/* Botão no hover */}
                  <div
                    className={`absolute right-6 bottom-6 pointer-events-none transition-opacity duration-300 ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-white text-sm font-medium">
                      <div className="w-8 h-8 border border-gold-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Frame decorativo no hover */}
                  <div
                    className={`absolute top-4 right-4 bottom-4 w-1/2 border border-gold-500/50 rounded pointer-events-none transition-opacity duration-300 ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>
              );

              // Se tem slug, envolve com Link para a LP
              return segmentSlug ? (
                <Link
                  key={uniqueKey}
                  href={`/segmentos/${segmentSlug}`}
                  className="flex-shrink-0 block"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {cardContent}
                </Link>
              ) : (
                <div
                  key={uniqueKey}
                  className="flex-shrink-0"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {cardContent}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
