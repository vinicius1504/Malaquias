'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import Footer from '@/components/sections/Footer';
import StarfieldCanvas from '@/components/ui/StarfieldCanvas';

const ITEMS_PER_PAGE = 6;
const DEFAULT_IMAGE = '/images/Sem_foto.png';

export default function NoticiasPage() {
  const { t } = useLanguage();
  const news = t.news;
  const [currentPage, setCurrentPage] = useState(1);

  // Paginação
  const totalPages = Math.ceil(news.items.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = news.items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      {/* Hero Section com Vídeo */}
      <section className="relative min-h-[40vh] flex items-center justify-center">
        {/* Background Video */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/images/videos/services_video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/70 via-[#1a1a2e]/50 to-[#1a1a2e]/70" />
        </div>

        {/* Título */}
        <div className="relative z-10 container mx-auto px-6 py-24 text-center">
          <motion.h1
            className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white uppercase tracking-wide"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {news.pageTitle}
          </motion.h1>
          <motion.p
            className="text-white/80 text-lg mt-4 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {news.pageSubtitle}
          </motion.p>
        </div>

        {/* Linha dourada inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gold-500" />
      </section>

      {/* Grid de Notícias */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedItems.map((item, index) => (
              <motion.article
                key={item.id}
                className="relative h-80 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: 'easeOut'
                }}
              >
                {/* Image - Full card */}
                <Image
                  src={item.image || DEFAULT_IMAGE}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 bg-gold-500 text-white text-xs font-semibold rounded-full shadow-md">
                    {item.category}
                  </span>
                </div>

                {/* Content - Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                  {/* Date */}
                  <span className="text-xs text-white/70">
                    {formatDate(item.date)}
                  </span>

                  {/* Title */}
                  <h3 className="text-lg font-heading font-bold text-white mt-2 mb-3 line-clamp-2 group-hover:text-gold-400 transition-colors">
                    {item.title}
                  </h3>

                  {/* Read More Link */}
                  <Link
                    href={`/noticias/${item.slug}`}
                    className="inline-flex items-center gap-1 text-gold-400 font-semibold text-sm hover:text-gold-300 transition-colors"
                  >
                    {news.readMore}
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <motion.div
              className="flex justify-center items-center gap-2 mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-dark-700 hover:text-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {news.pagination.previous}
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-full text-sm font-semibold transition-all duration-300 ${
                    currentPage === page
                      ? 'bg-gold-500 text-white shadow-md'
                      : 'text-dark-700 hover:bg-gold-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-dark-700 hover:text-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {news.pagination.next}
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
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
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4">
              {news.cta.title}
            </h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto">
              {news.cta.description}
            </p>
            <Link
              href="https://wa.me/5567996617549"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-lg shadow-gold-500/30 hover:shadow-xl hover:shadow-gold-500/40 hover:scale-105"
            >
              {news.cta.button}
            </Link>
          </motion.div>
        </div>
        <Footer />
      </section>
    </main>
  );
}
