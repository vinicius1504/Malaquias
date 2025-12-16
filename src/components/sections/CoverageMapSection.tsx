'use client';

import { motion } from 'framer-motion';
import BrazilMap from '@/components/ui/BrazilMap';

export default function CoverageMapSection() {
  const handleStateClick = (stateId: string, stateName: string) => {
    console.log(`Estado clicado: ${stateName} (${stateId})`);
  };

  return (
    <section id="cobertura" className="py-24 bg-[#f5f5f5]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Esquerda - Texto */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark-900 mb-6">
              Presença que Gera Confiança
            </h2>
            <div className="w-full h-[2px] bg-gradient-to-r from-gold-500 to-transparent mb-6" />
            <p className="text-dark-600 leading-relaxed mb-4">
              Estamos presentes nos principais estados do país, oferecendo soluções contábeis digitais com a mesma eficiência e qualidade em cada região.
            </p>
            <p className="text-dark-600 leading-relaxed">
              Atuamos com tecnologia, proximidade e compromisso, conectando empresas a resultados em todo o Brasil.
            </p>
          </motion.div>

          {/* Direita - Mapa */}
          <motion.div
            className="flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="w-full max-w-xl">
              <BrazilMap onStateClick={handleStateClick} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
