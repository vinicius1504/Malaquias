'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, Search, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Footer from '@/components/sections/Footer';
import StarfieldCanvas from '@/components/ui/StarfieldCanvas';

const ITEMS_PER_PAGE = 6;
const DEFAULT_IMAGE = '/images/Sem_foto.png';

interface NewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image_url: string;
  published_at: string;
  category: string;
}

export default function NoticiasPage() {
  const { t, locale } = useLanguage();
  const news = t.news;
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchNews();
  }, [currentPage, selectedCategory, locale, searchQuery]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        locale: locale,
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await fetch(`/api/news?${params}`);
      const data = await response.json();

      if (response.ok) {
        setItems(data.news || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      saude: news.categories?.saude || 'Saúde',
      varejo: news.categories?.varejo || 'Varejo e E-commerce',
      legislacao: news.categories?.legislacao || 'Legislação',
      gestao: news.categories?.gestao || 'Gestão Financeira',
      tributos: news.categories?.tributos || 'Tributos',
    };
    return categories[category] || category;
  };

  const categories = [
    { value: 'all', label: news.categories?.all || 'Todas' },
    { value: 'saude', label: news.categories?.saude || 'Saúde' },
    { value: 'varejo', label: news.categories?.varejo || 'Varejo e E-commerce' },
    { value: 'legislacao', label: news.categories?.legislacao || 'Legislação' },
    { value: 'gestao', label: news.categories?.gestao || 'Gestão Financeira' },
    { value: 'tributos', label: news.categories?.tributos || 'Tributos' },
  ];

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

      {/* Filtros - Barra de Pesquisa e Dropdown */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
            {/* Barra de Pesquisa */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={news.searchPlaceholder || "Buscar notícias..."}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchQuery(searchInput);
                    setCurrentPage(1);
                  }
                }}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput('');
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown de Categorias */}
            <div className="relative w-full sm:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all cursor-pointer pr-10"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Botão de Buscar */}
            <button
              onClick={() => {
                setSearchQuery(searchInput);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              {news.searchButton || "Buscar"}
            </button>
          </div>

          {/* Tags de filtros ativos */}
          {(searchQuery || selectedCategory !== 'all') && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold-100 text-gold-700 rounded-full text-sm">
                  {news.searchLabel || "Busca"}: "{searchQuery}"
                  <button
                    onClick={() => {
                      setSearchInput('');
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    className="ml-1 hover:text-gold-900"
                  >
                    ✕
                  </button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold-100 text-gold-700 rounded-full text-sm">
                  {getCategoryLabel(selectedCategory)}
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setCurrentPage(1);
                    }}
                    className="ml-1 hover:text-gold-900"
                  >
                    ✕
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchInput('');
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setCurrentPage(1);
                }}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                {news.clearFilters || "Limpar filtros"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Grid de Notícias */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">{news.noResults || "Nenhuma notícia encontrada."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item, index) => (
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
                    src={item.image_url || DEFAULT_IMAGE}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 bg-gold-500 text-white text-xs font-semibold rounded-full shadow-md">
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>

                  {/* Content - Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                    {/* Date */}
                    <span className="text-xs text-white/70">
                      {formatDate(item.published_at)}
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
          )}

          {/* Paginação */}
          {!loading && totalPages > 1 && (
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
