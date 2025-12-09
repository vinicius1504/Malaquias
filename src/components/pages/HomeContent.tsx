'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import AreasCarousel from '@/components/ui/AreasCarousel';
import ClientsCarousel from '@/components/ui/ClientsCarousel';
import PartnersCarousel from '@/components/ui/PartnersCarousel';
import TestimonialsCarousel from '@/components/ui/TestimonialsCarousel';
import BlogSection from '@/components/ui/BlogSection';
import FAQSection from '@/components/sections/FAQSection';
import HeroSection from '@/components/sections/HeroSection';
import AnimatedSection from '@/components/ui/AnimatedSection';

export default function HomeContent() {
  const { t } = useLanguage();
  const { hero, whyMalaquias, sectionTitles, testimonials, blog, faq } = t.home;

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
      <section id="areas" className="min-h-screen flex flex-col justify-center py-24">
        <div className="bg-[#1a1a2e]/50 backdrop-blur-sm rounded-2xl mx-6 p-8 border border-white/10">
          <AnimatedSection className="container mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white">
              {sectionTitles.areas}
            </h2>
            <div className="w-full h-[2px] bg-gradient-to-r from-gold-500 to-transparent mt-4" />
          </AnimatedSection>

          <AreasCarousel />
        </div>
      </section>

      {/* Por que a Malaquias Contabilidade? */}
      <section id="porque" className="min-h-screen relative py-24">
        <div className="bg-[#1a1a2e]/60 backdrop-blur-md rounded-2xl mx-6 p-8 border border-white/10">
          {/* Title */}
          <AnimatedSection className="container mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white">
              {sectionTitles.whyPart1}
            </h2>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-gold-500">
              {sectionTitles.whyPart2}
            </h2>
            <div className="w-full h-[2px] bg-gradient-to-r from-gold-500 to-transparent mt-4" />
          </AnimatedSection>

          {/* Benefits List - Logo 3D global aparece à esquerda */}
          <div className="container mx-auto">
            <div className="lg:ml-auto lg:max-w-xl space-y-10">
              {whyMalaquias.items.map((item, index) => (
                <motion.div
                  key={index}
                  className={itemMargins[index] || ''}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.15,
                    ease: 'easeOut'
                  }}
                >
                  <h3 className="text-gold-500 font-semibold text-xl mb-3">
                    {item.title}
                  </h3>
                  <p className="text-white/80 text-base leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Nossos Clientes */}
      <section id="clientes" className="min-h-screen flex flex-col justify-center py-24">
        <div className="bg-[#1a1a2e]/50 backdrop-blur-sm rounded-2xl mx-6 p-8 border border-white/10">
          <AnimatedSection className="container mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white">
              {sectionTitles.clients}
            </h2>
            <div className="w-full h-[2px] bg-gradient-to-r from-gold-500 to-transparent mt-4" />
          </AnimatedSection>
          <ClientsCarousel />
        </div>
      </section>

      {/* Nossos Parceiros */}
      <section id="parceiros" className="py-24">
        <div className="bg-[#1a1a2e]/50 backdrop-blur-sm rounded-2xl mx-6 p-8 border border-white/10">
          <AnimatedSection className="container mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white">
              {sectionTitles.partners}
            </h2>
            <div className="w-full h-[2px] bg-gradient-to-r from-gold-500 to-transparent mt-4" />
          </AnimatedSection>
          <PartnersCarousel />
        </div>
      </section>

      {/* Depoimentos */}
      <section id="depoimentos" className="py-24">
        <div className="bg-[#1a1a2e]/60 backdrop-blur-md rounded-2xl mx-6 p-8 border border-white/10">
          <AnimatedSection className="container mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white">
              {sectionTitles.testimonials}
            </h2>
            <div className="w-full h-[2px] bg-gradient-to-r from-gold-500 to-transparent mt-4" />
          </AnimatedSection>

          <motion.div
            className="container mx-auto w-full"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <TestimonialsCarousel testimonials={testimonials.items} />
          </motion.div>
        </div>
      </section>

      {/* Blog / Últimas Notícias */}
      <div className="py-24">
        <div className="bg-[#1a1a2e]/50 backdrop-blur-sm rounded-2xl mx-6 p-8 border border-white/10">
          <BlogSection
            title={sectionTitles.blog}
            posts={blog.items}
            readMore={blog.readMore}
            viewAll={blog.viewAll}
          />
        </div>
      </div>

      {/* FAQ / Perguntas Frequentes + Footer */}
      <FAQSection
        title={sectionTitles.faq}
        items={faq.items}
      />
    </>
  );
}
