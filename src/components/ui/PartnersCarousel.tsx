'use client';

import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface PartnerLogo {
  src: string;
  alt: string;
}

// Logos dos parceiros (usando logos de clientes para teste - substituir depois)
const partnerLogos: PartnerLogo[] = [
  { src: '/images/parceiros/ec.png', alt: 'Parceiro 1' },
  { src: '/images/parceiros/solides.jpg', alt: 'Parceiro 2' },
  { src: '/images/parceiros/tr.png', alt: 'Parceiro 3' },
  { src: '/images/parceiros/uc.png', alt: 'Parceiro 4' },
];

function HorizontalRow({ logos, direction, speed = 25 }: { logos: PartnerLogo[]; direction: 'left' | 'right'; speed?: number }) {
  // Duplica os logos para criar efeito infinito
  const duplicatedLogos = [...logos, ...logos, ...logos];

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="flex gap-6 items-center"
        style={{
          animation: `${direction === 'left' ? 'scrollLeft' : 'scrollRight'} ${speed}s linear infinite`,
          width: 'fit-content',
        }}
      >
        {duplicatedLogos.map((logo, index) => (
          <div
            key={index}
            className="w-36 h-24 md:w-44 md:h-28 bg-white rounded-lg shadow-md flex items-center justify-center p-4 flex-shrink-0"
          >
            <Image
              src={logo.src}
              alt={logo.alt}
              width={160}
              height={100}
              className="object-contain w-full h-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PartnersCarousel() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  // Divide os logos em 2 linhas
  const row1 = partnerLogos.slice(0, 4);
  const row2 = partnerLogos.slice(4, 8);

  return (
    <>
      {/* CSS Keyframes */}
      <style jsx global>{`
        @keyframes scrollLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }
        @keyframes scrollRight {
          0% {
            transform: translateX(-33.33%);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>

      <div ref={containerRef} className="container mx-auto px-6">
        <div className="flex flex-col gap-6 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <HorizontalRow logos={row1} direction="left" speed={20} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          >
            <HorizontalRow logos={row2} direction="right" speed={25} />
          </motion.div>
        </div>
      </div>
    </>
  );
}
