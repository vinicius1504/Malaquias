'use client';

import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface PartnerLogo {
  src: string;
  alt: string;
}

// Logos fallback (caso não haja dados no banco ou erro)
const fallbackLogos: PartnerLogo[] = [
  { src: '/images/parceiros/ec.png', alt: 'EC' },
  { src: '/images/parceiros/solides.jpg', alt: 'Solides' },
  { src: '/images/parceiros/tr.png', alt: 'TR' },
  { src: '/images/parceiros/uc.png', alt: 'UC' },
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
  const [partnerLogos, setPartnerLogos] = useState<PartnerLogo[]>(fallbackLogos);

  useEffect(() => {
    async function fetchPartners() {
      try {
        const response = await fetch('/api/partners?type=partner');

        if (!response.ok) {
          console.log('API não disponível, usando fallback');
          return;
        }

        const data = await response.json();

        if (data.partners && data.partners.length > 0) {
          const logos = data.partners
            .filter((p: { logo_url: string | null }) => p.logo_url)
            .map((p: { name: string; logo_url: string }) => ({
              src: p.logo_url,
              alt: p.name,
            }));

          if (logos.length > 0) {
            setPartnerLogos(logos);
          }
        }
      } catch (error) {
        console.log('Erro ao buscar parceiros, usando fallback:', error);
        // Mantém o fallback já setado no useState
      }
    }

    fetchPartners();
  }, []);

  // Se tiver mais de 10, divide em 2 linhas. Senão, usa 1 linha só
  const useTwoRows = partnerLogos.length > 10;
  const half = Math.ceil(partnerLogos.length / 2);
  const row1 = useTwoRows ? partnerLogos.slice(0, half) : partnerLogos;
  const row2 = useTwoRows ? partnerLogos.slice(half) : [];

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
          {row2.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            >
              <HorizontalRow logos={row2} direction="right" speed={25} />
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
