'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Office3D from '@/components/three/Office3D';

interface AboutItem {
  title: string;
  content: string;
}

interface AboutSectionProps {
  title: string;
  items: AboutItem[];
}

export default function AboutSection({ title, items }: AboutSectionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section id="sobre" className="py-24 bg-[#f5f5f5]">
      <div className="container mx-auto px-6">
        {/* Title */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark-900">
            {title}
          </h2>
          <div className="w-full h-[2px] bg-gradient-to-r from-gold-500 to-transparent mt-4" />
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - 3D Model */}
          <motion.div
            className="relative aspect-[4/3] bg-[#1a1a2e] rounded-lg overflow-hidden"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Office3D />
          </motion.div>

          {/* Right - Accordion Items */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {items.map((item, index) => (
              <div
                key={index}
                className="border-b border-gold-500/30"
              >
                <button
                  onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                  className="w-full py-4 flex items-center justify-between text-left group"
                >
                  <span className="flex items-center gap-3">
                    <ChevronRight
                      className={`w-5 h-5 text-gold-500 transition-transform duration-300 ${
                        activeIndex === index ? 'rotate-90' : ''
                      }`}
                    />
                    <span className="text-gold-600 font-medium text-lg group-hover:text-gold-500 transition-colors">
                      {item.title}
                    </span>
                  </span>
                </button>

                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="pb-4 pl-8 text-dark-600 leading-relaxed">
                        {item.content}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
