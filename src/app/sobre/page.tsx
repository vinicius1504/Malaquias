'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight,MessageCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Office3D from '@/components/three/Office3D';
import ClientsCarousel from '@/components/ui/ClientsCarousel';
import Footer from '@/components/sections/Footer';
import StarfieldCanvas from '@/components/ui/StarfieldCanvas';
import AnimatedSection from '@/components/ui/AnimatedSection';
import Link from 'next/link';

export default function SobrePage() {
  const { t } = useLanguage();
  const { sectionTitles, about } = t.home;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const services = t.services;

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      {/* Hero Section com Vídeo */}
      <section className="relative min-h-[60vh] flex items-center pt-24">
        {/* Background Video */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/images/videos/about_video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e]/90 via-[#1a1a2e]/70 to-[#1a1a2e]/50" />
        </div>

        {/* Conteúdo do Hero */}
        <div className="relative z-10 container mx-auto px-6 py-16">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Primeiro parágrafo */}
            <p className="text-lg md:text-xl text-white leading-relaxed mb-6">
              <span className="text-gold-500 font-semibold">{about.hero.title1} </span>
              <span className="text-gold-500 font-bold">{about.hero.highlight1} </span>
              <span>{about.hero.description1} </span>
              <span className="font-semibold">{about.hero.emphasis1} </span>
              <span>{about.hero.description2}</span>
            </p>

            {/* Segundo parágrafo */}
            <p className="text-lg md:text-xl text-white leading-relaxed">
              <span>{about.hero.title2} </span>
              <span className="text-gold-500 font-bold">{about.hero.highlight2}</span>
              <span>{about.hero.description3} </span>
              <span className="font-semibold">{about.hero.emphasis2} </span>
              <span>{about.hero.description4} </span>
              <span className="font-semibold">{about.hero.emphasis3} </span>
              <span>{about.hero.description5} </span>
              <span className="font-semibold">{about.hero.emphasis4}</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Seção com Modelo 3D e Accordion */}
      <section className="py-24">
        <div className="container mx-auto px-6">
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
              {about.items.map((item, index) => (
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

      {/* Nossos Clientes */}
      <section id="clientes" className="py-24 bg-[#f5f5f5]">
        <AnimatedSection className="container mx-auto px-6 mb-12">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark-900">
            {sectionTitles.clients}
          </h2>
          <div className="w-full h-[2px] bg-gradient-to-r from-gold-500 to-transparent mt-4" />
        </AnimatedSection>
        <ClientsCarousel />
      </section>

      {/* CTA Section com fundo de galáxia (mesmo do footer) */}
      <section className="relative bg-[#1a1a2e] overflow-hidden">
        <StarfieldCanvas />
        <div className="container mx-auto px-6 relative z-10 pt-20">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="https://wa.me/5567996617549"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-lg shadow-gold-500/30 hover:shadow-xl hover:shadow-gold-500/40 hover:scale-105"
            >
              <MessageCircle className="w-6 h-6" />
              <span>{services.cta.button}</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
                <Footer />
      </section>
    </main>
  );
}
