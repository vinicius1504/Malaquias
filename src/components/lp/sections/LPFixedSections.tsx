'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import BlogSection from '@/components/ui/BlogSection';
import Footer from '@/components/sections/Footer';
import StarfieldCanvas from '@/components/ui/StarfieldCanvas';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MessageCircle, ArrowRight } from 'lucide-react';

// Seções fixas que aparecem no final de todas as LPs
// - BlogSection: Últimas notícias
// - Footer: Rodapé padrão do site

export default function LPFixedSections() {
  const { t } = useLanguage();
  const { sectionTitles, blog } = t.home;
  const services = t.services;
  return (
    <>
      {/* Blog / Últimas Notícias */}
      <div className="py-24 bg-[#f5f5f5]">
        <BlogSection
          title={sectionTitles.blog}
          readMore={blog.readMore}
          viewAll={blog.viewAll}
        />
      </div>

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
    </>
  );
}
