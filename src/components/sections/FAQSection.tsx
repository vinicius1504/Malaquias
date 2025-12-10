'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import StarfieldCanvas from '../ui/StarfieldCanvas';
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
  const isContentInView = useInView(contentRef, { once: true, margin: '-50px' });

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      {/* Title - Outside blue area */}
      <section className="pt-24 bg-[#f5f5f5]" ref={titleRef}>
        <div className="container mx-auto px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark-900">
              {title}
            </h2>
            <div className="w-full h-[2px] bg-gradient-to-r from-gold-500 to-transparent mt-4" />
          </motion.div>
        </div>
      </section>

      {/* FAQ Content + Footer - Blue area with starfield */}
      <section className="relative bg-[#1a1a2e] overflow-hidden" ref={contentRef}>
        <StarfieldCanvas />

        {/* FAQ Content */}
        <div className="relative z-10 container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto space-y-3">
            {items.map((item, index) => (
              <motion.div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={isContentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{
                  duration: 0.4,
                  delay: Math.min(index * 0.05, 0.5),
                  ease: [0.25, 0.1, 0.25, 1]
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
                      className={`w-5 h-5 text-gold-500 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
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
                  className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-[500px]' : 'max-h-0'}`}
                >
                  <div className="px-6 pb-5 text-white/70 leading-relaxed">
                    {item.answer}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </section>
    </>
  );
}
