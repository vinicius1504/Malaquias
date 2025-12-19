'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import AreasCarousel from '@/components/ui/AreasCarousel';
import StarfieldCanvas from '@/components/ui/StarfieldCanvas';
import Logo3D from '@/components/three/Logo3D';
import ClientsCarousel from '@/components/ui/ClientsCarousel';
import PartnersCarousel from '@/components/ui/PartnersCarousel';
import TestimonialsCarousel from '@/components/ui/TestimonialsCarousel';
import BlogSection from '@/components/ui/BlogSection';
import FAQSection from '@/components/sections/FAQSection';
import HeroSection from '@/components/sections/HeroSection';
import CoverageMapSection from '@/components/sections/CoverageMapSection';
import SegmentsSection from '@/components/sections/SegmentsSection';
import AnimatedSection from '@/components/ui/AnimatedSection';

export default function HomeContent() {
  const { t } = useLanguage();
  const { hero, whyMalaquias, sectionTitles, blog } = t.home;
  const faq = t.faq; // Usa o faq.json completo com 10 perguntas

  // Margens escalonadas para os itens
  const itemMargins = ['', 'ml-4', 'ml-8', 'ml-4', ''];

  return (
    <>
      {/* Hero Section */}
      <HeroSection
        title1={sectionTitles.heroTitle1}
        highlight1={sectionTitles.heroHighlight1}
        title2={sectionTitles.heroTitle2}
        highlight2={sectionTitles.heroHighlight2}
        subtitle={hero.subtitle}
        ctaText={hero.ctaPrimary}
      />

      {/* Áreas de Atuação */}
      <section id="areas" className="min-h-screen flex flex-col justify-center py-24 bg-[#f5f5f5] ">
        <AnimatedSection className="container mx-auto px-6 mb-12 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark-900 ">
            {sectionTitles.areas}
          </h2>
          <div className="w-full h-[2px] bg-gradient-to-r from-gold-500 to-transparent mt-4 mx-auto md:mx-0 max-w-[200px] md:max-w-none" />
        </AnimatedSection>

        <AreasCarousel />
      </section>

      {/* Por que a Malaquias Contabilidade? */}
      <section id="porque" className="min-h-screen relative bg-[#f5f5f5]">
        {/* Title - Fora da área azul */}
        <AnimatedSection className="container mx-auto px-6 py-12 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark-900">
            {sectionTitles.whyPart1}
          </h2>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-gold-500">
            {sectionTitles.whyPart2}
          </h2>
          <div className="w-full h-[2px] bg-gradient-to-r from-gold-500 to-transparent mt-4 mx-auto md:mx-0 max-w-[200px] md:max-w-none" />
        </AnimatedSection>

        {/* Área azul - ocupa o resto da seção */}
        <div className="relative min-h-[calc(100vh-180px)] py-16 bg-[#1a1a2e] overflow-hidden flex items-center">
          {/* Fundo de estrelas */}
          <StarfieldCanvas />

          <div className="relative z-10 container mx-auto px-6">
            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 items-center">
              {/* Left - 3D Logo */}
              <motion.div
                className="relative h-[280px] w-[280px] md:h-[400px] md:w-[400px] lg:h-[500px] lg:w-[500px] flex items-center justify-center mx-auto lg:mx-0"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <Logo3D />
              </motion.div>

              {/* Right - Benefits List */}
              <div className="space-y-8 md:space-y-10 max-w-lg mx-auto lg:mx-0 lg:ml-auto text-center lg:text-left">
                {whyMalaquias.items.map((item, index) => (
                  <motion.div
                    key={index}
                    className={`lg:${itemMargins[index]}` || ''}
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.15,
                      ease: 'easeOut'
                    }}
                  >
                    <h3 className="text-gold-500 font-semibold text-lg md:text-xl mb-2 md:mb-3">
                      {item.title}
                    </h3>
                    <p className="text-white/80 text-sm md:text-base leading-relaxed">
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cobertura / Mapa do Brasil */}
      <CoverageMapSection />

      {/* Segmentos */}
      <SegmentsSection />

      {/* Nossos Clientes */}
      <section id="clientes" className="min-h-screen flex flex-col justify-center py-20 bg-[#f5f5f5]">
        <AnimatedSection className="container mx-auto px-6 mb-12 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark-900">
            {sectionTitles.clients}
          </h2>
          <div className="w-full h-[2px] bg-gradient-to-r from-gold-500 to-transparent mt-4 mx-auto md:mx-0 max-w-[200px] md:max-w-none" />
        </AnimatedSection>
        <ClientsCarousel />
      </section>

      {/* Nossos Parceiros */}
      <section id="parceiros" className="py-44 bg-[#f5f5f5]">
        <AnimatedSection className="container mx-auto px-6 mb-12 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark-900">
            {sectionTitles.partners}
          </h2>
          <div className="w-full h-[2px] bg-gradient-to-r from-gold-500 to-transparent mt-4 mx-auto md:mx-0 max-w-[200px] md:max-w-none" />
        </AnimatedSection>
        <PartnersCarousel />
      </section>

      {/* Depoimentos - Title fora da área azul */}
      <section id="depoimentos" className="pt-24 bg-[#f5f5f5]">
        <AnimatedSection className="container mx-auto px-6 pb-12 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark-900">
            {sectionTitles.testimonials}
          </h2>
          <div className="w-full h-[2px] bg-gradient-to-r from-gold-500 to-transparent mt-4 mx-auto md:mx-0 max-w-[200px] md:max-w-none" />
        </AnimatedSection>
      </section>

      {/* Depoimentos - Área azul */}
      <section className="relative py-32 bg-[#1a1a2e] overflow-hidden min-h-[500px] flex items-center">
        {/* Fundo de estrelas */}
        <StarfieldCanvas />

        <motion.div
          className="relative z-10 container mx-auto px-4 w-full"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Testimonials Carousel */}
          <TestimonialsCarousel testimonials={[]} />
        </motion.div>
      </section>

      {/* Blog / Últimas Notícias */}
      <div className="py-24 bg-[#f5f5f5]">
        <BlogSection
          title={sectionTitles.blog}
          readMore={blog.readMore}
          viewAll={blog.viewAll}
        />
      </div>

      {/* FAQ / Perguntas Frequentes + Footer */}
      <FAQSection
        title={sectionTitles.faq}
        items={faq.items}
      />
    </>
  );
}
