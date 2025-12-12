'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Tag, MessageCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Footer from '@/components/sections/Footer';
import StarfieldCanvas from '@/components/ui/StarfieldCanvas';

const DEFAULT_IMAGE = '/images/Sem_foto.png';

interface NewsItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  content: string[];
}

export default function NoticiaPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { t } = useLanguage();
  const news = t.news;
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  // Encontra a notícia pelo slug
  const article = news.items.find((item: NewsItem) => item.slug === slug);

  // Encontra artigos relacionados (mesma categoria, exceto o atual)
  const relatedArticles = news.items
    .filter((item: NewsItem) => item.category === article?.category && item.slug !== slug)
    .slice(0, 3);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (!article) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-900 mb-4">Notícia não encontrada</h1>
          <Link href="/noticias" className="text-gold-500 hover:text-gold-600">
            Voltar para notícias
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      {/* Hero Section com Imagem */}
      <section className="relative min-h-[50vh] flex items-end">
        {/* Background Image */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={article.image || DEFAULT_IMAGE}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-[#1a1a2e]/50 to-transparent" />
        </div>

        {/* Conteúdo do Hero */}
        <div className="relative z-10 container mx-auto px-6 pb-12">
          {/* Breadcrumb */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/noticias"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para notícias
            </Link>
          </motion.div>

          {/* Meta info */}
          <motion.div
            className="flex flex-wrap items-center gap-4 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500 text-white text-sm font-semibold rounded-full">
              <Tag className="w-3 h-3" />
              {article.category}
            </span>
            <span className="inline-flex items-center gap-2 text-white/70 text-sm">
              <Calendar className="w-4 h-4" />
              {formatDate(article.date)}
            </span>
          </motion.div>

          {/* Título */}
          <motion.h1
            className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-white leading-tight max-w-4xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {article.title}
          </motion.h1>
        </div>

        {/* Linha dourada inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gold-500" />
      </section>

      {/* Conteúdo do Artigo */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            {/* Resumo/Lead */}
            <motion.p
              className="text-lg md:text-xl text-dark-700 leading-relaxed mb-8 font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {article.excerpt}
            </motion.p>

            {/* Conteúdo */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {article.content.map((paragraph: string, index: number) => (
                <p
                  key={index}
                  className="text-dark-600 text-base md:text-lg leading-relaxed text-justify"
                >
                  {paragraph}
                </p>
              ))}
            </motion.div>

            {/* Compartilhar */}
            <motion.div
              className="mt-12 pt-8 border-t border-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <p className="text-sm text-dark-500 mb-4">Compartilhe esta notícia:</p>
              <div className="flex gap-3">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(article.title + ' - ' + currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Artigos Relacionados */}
      {relatedArticles.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <motion.h2
              className="text-2xl font-heading font-bold text-dark-900 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Artigos Relacionados
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedArticles.map((item: NewsItem, index: number) => (
                <motion.article
                  key={item.id}
                  className="relative h-64 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Image
                    src={item.image || DEFAULT_IMAGE}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                    <h3 className="text-base font-semibold text-white line-clamp-2 group-hover:text-gold-400 transition-colors">
                      {item.title}
                    </h3>
                    <Link
                      href={`/noticias/${item.slug}`}
                      className="inline-flex items-center gap-1 text-gold-400 text-sm mt-2 hover:text-gold-300 transition-colors"
                    >
                      {news.readMore}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative bg-[#1a1a2e] overflow-hidden">
        <StarfieldCanvas />
        <div className="container mx-auto px-6 relative z-10 py-20">
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
              <span>{news.cta.button}</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
        <Footer />
      </section>
    </main>
  );
}
