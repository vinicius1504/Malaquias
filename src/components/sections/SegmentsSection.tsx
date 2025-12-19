'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import SegmentsCarousel from '@/components/ui/SegmentsCarousel';
import AnimatedSection from '@/components/ui/AnimatedSection';

export default function SegmentsSection() {
  const { t } = useLanguage();
  const { sectionTitles } = t.home;

  return (
    <section id="segmentos" className="py-40 bg-[#f5f5f5]">
      <AnimatedSection className="container mx-auto px-6 mb-12 text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark-900">
          {sectionTitles.sections}
        </h2>
        <div className="w-full h-[2px] bg-gradient-to-r from-gold-500 to-transparent mt-4 mx-auto md:mx-0 max-w-[200px] md:max-w-none" />
      </AnimatedSection>

      <SegmentsCarousel />
    </section>
  );
}
