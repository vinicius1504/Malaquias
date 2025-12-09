'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Footer from './Footer';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title: string;
  items: FAQItem[];
}

export default function FAQSection({ title, items }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const titleRef = useRef(null);
  const contentRef = useRef(null);
  const isTitleInView = useInView(titleRef, { once: true, margin: '-100px' });
  const isContentInView = useInView(contentRef, { once: true, margin: '-100px' });

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      {/* FAQ Section */}
      <section className="py-24" ref={titleRef}>
        <div className="bg-[#1a1a2e]/60 backdrop-blur-md rounded-2xl mx-6 p-8 border border-white/10">
          {/* Title */}
          <div className="container mx-auto mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-white">
                {title}
              </h2>
              <div className="w-full h-[2px] bg-gradient-to-r from-gold-500 to-transparent mt-4" />
            </motion.div>
          </div>

          {/* FAQ Content - Logo 3D global aparece à direita */}
          <div className="container mx-auto" ref={contentRef}>
            <div className="lg:max-w-xl space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10"
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
                    onClick={() => toggleItem(index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="text-white font-medium pr-4">{item.question}</span>
                    <span className="flex-shrink-0">
                      <svg
                        className={`w-5 h-5 text-gold-500 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''
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
                    className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'
                      }`}
                  >
                    <div className="px-6 pb-5 text-white/70 leading-relaxed">
                      {item.answer}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </>
  );
}
