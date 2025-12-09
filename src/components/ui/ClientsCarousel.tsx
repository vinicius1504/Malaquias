'use client';

import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface ClientLogo {
  src: string;
  alt: string;
}

// Logos dos clientes
const clientLogos: ClientLogo[] = [
  { src: '/images/clientes/logo (1).png', alt: 'Cliente 1' },
  { src: '/images/clientes/logo (2).png', alt: 'Cliente 2' },
  { src: '/images/clientes/logo (3).png', alt: 'Cliente 3' },
  { src: '/images/clientes/logo (4).png', alt: 'Cliente 4' },
  { src: '/images/clientes/logo (5).png', alt: 'Cliente 5' },
  { src: '/images/clientes/logo (6).png', alt: 'Cliente 6' },
  { src: '/images/clientes/logo (7).png', alt: 'Cliente 7' },
  { src: '/images/clientes/logo (8).png', alt: 'Cliente 8' },
  { src: '/images/clientes/logo (9).png', alt: 'Cliente 9' },
  { src: '/images/clientes/logo (10).png', alt: 'Cliente 10' },
  { src: '/images/clientes/logo (11).png', alt: 'Cliente 11' },
  { src: '/images/clientes/logo (12).png', alt: 'Cliente 12' },
  { src: '/images/clientes/logo (13).png', alt: 'Cliente 13' },
  { src: '/images/clientes/logo (14).png', alt: 'Cliente 14' },
  { src: '/images/clientes/logo (15).png', alt: 'Cliente 15' },
  { src: '/images/clientes/logo (16).png', alt: 'Cliente 16' },
  { src: '/images/clientes/logo (17).png', alt: 'Cliente 17' },
  { src: '/images/clientes/logo (18).png', alt: 'Cliente 18' },
  { src: '/images/clientes/logo (19).png', alt: 'Cliente 19' },
  { src: '/images/clientes/logo (20).png', alt: 'Cliente 20' },
  { src: '/images/clientes/logo (21).png', alt: 'Cliente 21' },
  { src: '/images/clientes/logo (22).png', alt: 'Cliente 22' },
  { src: '/images/clientes/logo (23).png', alt: 'Cliente 23' },
  { src: '/images/clientes/logo (1).jpeg', alt: 'Cliente 24' },
  { src: '/images/clientes/logo (2).jpeg', alt: 'Cliente 25' },
  { src: '/images/clientes/logo (3).jpeg', alt: 'Cliente 26' },
  { src: '/images/clientes/logo (1).jpg', alt: 'Cliente 27' },
  { src: '/images/clientes/logo (2).jpg', alt: 'Cliente 28' },
];

function VerticalColumn({ logos, direction, speed = 20 }: { logos: ClientLogo[]; direction: 'up' | 'down'; speed?: number }) {
  // Duplica os logos para criar efeito infinito
  const duplicatedLogos = [...logos, ...logos, ...logos];

  return (
    <div className="relative h-[500px] overflow-hidden">
      <div
        className="flex flex-col gap-4"
        style={{
          animation: `${direction === 'up' ? 'scrollUp' : 'scrollDown'} ${speed}s linear infinite`,
        }}
      >
        {duplicatedLogos.map((logo, index) => (
          <div
            key={index}
            className="w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 bg-white rounded-lg shadow-md flex items-center justify-center p-3 flex-shrink-0"
          >
            <Image
              src={logo.src}
              alt={logo.alt}
              width={120}
              height={120}
              className="object-contain w-full h-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ClientsCarousel() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  // 6 colunas com logos distribuídas
  const columns = [
    { logos: clientLogos.slice(0, 5), direction: 'up' as const, speed: 18 },
    { logos: clientLogos.slice(5, 10), direction: 'down' as const, speed: 22 },
    { logos: clientLogos.slice(10, 15), direction: 'up' as const, speed: 20 },
    { logos: clientLogos.slice(15, 20), direction: 'down' as const, speed: 19 },
    { logos: clientLogos.slice(20, 24), direction: 'up' as const, speed: 21 },
    { logos: clientLogos.slice(24, 28), direction: 'down' as const, speed: 18 },
  ];

  return (
    <>
      {/* CSS Keyframes */}
      <style jsx global>{`
        @keyframes scrollUp {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-33.33%);
          }
        }
        @keyframes scrollDown {
          0% {
            transform: translateY(-33.33%);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>

      <div ref={containerRef} className="container mx-auto px-6">
        <div className="flex justify-between gap-4 overflow-hidden">
          {columns.map((col, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: 'easeOut'
              }}
            >
              <VerticalColumn
                logos={col.logos}
                direction={col.direction}
                speed={col.speed}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
