'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import dynamic from 'next/dynamic';

// Carrega o modelo 3D sem SSR
const ReceptionModel3D = dynamic(() => import('../three/ReceptionModel3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center">
      <div className="text-white/40">Carregando modelo 3D...</div>
    </div>
  ),
});

export default function AboutContent() {
  const { t } = useLanguage();
  const { pageTitle, history, accordion } = t.about;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        {/* Título da página */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-[#1a1a2e]/60 backdrop-blur-md rounded-2xl p-6 border border-white/10 inline-block">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-white">
              {pageTitle}
            </h1>
            <div className="w-full h-[2px] bg-gradient-to-r from-gold-500 to-transparent mt-4" />
          </div>
        </motion.div>

        {/* Seção de História */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-[#1a1a2e]/40 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-semibold text-gold-500 mb-4">
              {history.title}
            </h2>
            <p className="text-white/80 leading-relaxed whitespace-pre-line">
              {history.content}
            </p>
          </div>
        </motion.div>

        {/* Layout principal: Modelo 3D + Accordion */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Coluna do Modelo 3D da Recepção - flutuando no espaço */}
          <motion.div
            className="relative w-full aspect-[4/3]"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <ReceptionModel3D />
          </motion.div>

          {/* Coluna do Accordion */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {accordion.items.map((item, index) => (
              <div
                key={index}
                className="bg-[#1a1a2e]/60 backdrop-blur-md rounded-xl overflow-hidden border border-white/10"
              >
                {/* Header do Accordion */}
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-white/5 transition-colors"
                >
                  {/* Ícone de seta */}
                  <span className="flex-shrink-0">
                    <svg
                      className={`w-5 h-5 text-gold-500 transition-transform duration-300 ${
                        openIndex === index ? 'rotate-90' : ''
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <span className="text-white font-medium text-lg">
                    {item.title}
                  </span>
                </button>

                {/* Conteúdo do Accordion */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-5 pl-14 text-white/70 leading-relaxed">
                    {item.content}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
