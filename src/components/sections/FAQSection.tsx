'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Footer from './Footer';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title: string;
  items: FAQItem[];
}

const ITEMS_PER_PAGE = 5;
const AUTO_SWITCH_INTERVAL = 10000; // 10 segundos

export default function FAQSection({ title, items }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const titleRef = useRef(null);
  const contentRef = useRef(null);
  const isTitleInView = useInView(titleRef, { once: true, margin: '-100px' });
  const isContentInView = useInView(contentRef, { once: true, margin: '-100px' });

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);

  // Itens da página atual
  const currentItems = items.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  // Alterna para próxima página
  const nextPage = useCallback(() => {
    setCurrentPage((prev) => {
      const next = (prev + 1) % totalPages;
      console.log(`[FAQ] Trocando para página ${next + 1} de ${totalPages}`);
      return next;
    });
    setOpenIndex(null); // Fecha qualquer pergunta aberta ao trocar de página
  }, [totalPages]);

  // Auto-switch a cada 10 segundos se não estiver pausado
  useEffect(() => {
    if (isPaused || totalPages <= 1) {
      console.log(`[FAQ] Timer pausado. isPaused: ${isPaused}, totalPages: ${totalPages}`);
      return;
    }

    console.log(`[FAQ] Timer iniciado - próxima troca em ${AUTO_SWITCH_INTERVAL / 1000}s`);

    let countdown = AUTO_SWITCH_INTERVAL / 1000;
    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdown > 0 && countdown <= 5) {
        console.log(`[FAQ] Trocando em ${countdown}s...`);
      }
    }, 1000);

    const interval = setInterval(() => {
      nextPage();
    }, AUTO_SWITCH_INTERVAL);

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    };
  }, [isPaused, nextPage, totalPages]);

  // Pausa quando uma pergunta está aberta
  useEffect(() => {
    setIsPaused(openIndex !== null);
  }, [openIndex]);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      {/* FAQ Section */}
      <section className="py-24" ref={titleRef}>
        <div className="mx-6">
          {/* Title com glassmorphism */}
          <div className="container mx-auto mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="inline-block"
            >
              <div className="bg-[#1a1a2e]/60 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-white">
                  {title}
                </h2>
                <div className="w-full h-[2px] bg-gradient-to-r from-gold-500 to-transparent mt-4" />
              </div>
            </motion.div>
          </div>

          {/* FAQ Content - Logo 3D global aparece à direita (área vazia) */}
          <div className="container mx-auto" ref={contentRef}>
            <div
              className="lg:max-w-xl space-y-4"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(openIndex !== null)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {currentItems.map((item, index) => {
                    const globalIndex = currentPage * ITEMS_PER_PAGE + index;
                    return (
                      <motion.div
                        key={globalIndex}
                        className="bg-[#1a1a2e]/60 backdrop-blur-md rounded-xl overflow-hidden border border-white/10"
                        initial={{ opacity: 0, x: -30 }}
                        animate={isContentInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.1,
                          ease: 'easeOut'
                        }}
                      >
                        {/* Question */}
                        <button
                          onClick={() => toggleItem(globalIndex)}
                          className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                        >
                          <span className="text-white font-medium pr-4">{item.question}</span>
                          <span className="flex-shrink-0">
                            <svg
                              className={`w-5 h-5 text-gold-500 transition-transform duration-300 ${openIndex === globalIndex ? 'rotate-180' : ''
                                }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </span>
                        </button>

                        {/* Answer */}
                        <div
                          className={`overflow-hidden transition-all duration-300 ${openIndex === globalIndex ? 'max-h-96' : 'max-h-0'
                            }`}
                        >
                          <div className="px-6 pb-5 text-white/70 leading-relaxed">
                            {item.answer}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>

              {/* Indicadores de página */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-6">
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentPage(index);
                        setOpenIndex(null);
                      }}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        currentPage === index
                          ? 'bg-gold-500 w-8'
                          : 'bg-white/30 hover:bg-white/50'
                      }`}
                      aria-label={`Página ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </>
  );
}
