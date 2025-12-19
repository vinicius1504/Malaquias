'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2 } from 'lucide-react';

const DEFAULT_IMAGE = '/images/Sem_foto.png';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image_url: string;
  published_at: string;
  category: string;
  slug: string;
}

interface BlogSectionProps {
  title: string;
  readMore: string;
  viewAll: string;
}

export default function BlogSection({ title, readMore, viewAll }: BlogSectionProps) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });
  const { locale } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/news?locale=${locale}&limit=3`);
        const data = await response.json();

        if (response.ok && data.news) {
          setPosts(data.news);
        }
      } catch (error) {
        console.error('Erro ao buscar notícias:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [locale]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <section id="blog" ref={containerRef}>
      <div className="container mx-auto px-6">
        {/* Title */}
        <motion.div
          className="mb-12 text-center md:text-left"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark-900">
            {title}
          </h2>
          <div className="w-full h-[2px] bg-gradient-to-r from-gold-500 to-transparent mt-4 mx-auto md:mx-0 max-w-[200px] md:max-w-none" />
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Nenhuma notícia publicada ainda.</p>
          </div>
        ) : (
          /* Blog Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                className="relative h-80 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group"
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.15,
                  ease: 'easeOut'
                }}
              >
                {/* Image - Full card */}
                <Image
                  src={post.image_url || DEFAULT_IMAGE}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Category Badge */}
                {post.category && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 bg-gold-500 text-white text-xs font-semibold rounded-full shadow-md">
                      {post.category}
                    </span>
                  </div>
                )}

                {/* Content - Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                  {/* Date */}
                  {post.published_at && (
                    <span className="text-xs text-white/70">
                      {formatDate(post.published_at)}
                    </span>
                  )}

                  {/* Title */}
                  <h3 className="text-lg font-heading font-bold text-white mt-2 mb-3 line-clamp-2 group-hover:text-gold-400 transition-colors">
                    {post.title}
                  </h3>

                  {/* Read More Link */}
                  <Link
                    href={`/noticias/${post.slug}`}
                    className="inline-flex items-center gap-1 text-gold-400 font-semibold text-sm hover:text-gold-300 transition-colors"
                  >
                    {readMore}
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

        {/* View All Button */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
        >
          <Link
            href="/noticias"
            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-gold-500 text-gold-600 font-semibold rounded-lg hover:bg-gold-500 hover:text-white transition-all duration-300"
          >
            {viewAll}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
