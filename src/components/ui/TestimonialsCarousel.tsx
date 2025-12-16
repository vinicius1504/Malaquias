'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

interface Testimonial {
  name: string;
  role: string;
  company: string | null;
  content: string;
  avatar?: string;
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[]; // Fallback do JSON de traduções
}

export default function TestimonialsCarousel({ testimonials: fallbackTestimonials }: TestimonialsCarouselProps) {
  const { locale } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials);

  // Buscar depoimentos do banco de dados
  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const response = await fetch(`/api/testimonials?locale=${locale}`);

        if (!response.ok) {
          console.log('API não disponível, usando fallback');
          return;
        }

        const data = await response.json();

        if (data.testimonials && data.testimonials.length > 0) {
          const items = data.testimonials.map((t: { name: string; role: string; company: string | null; content: string; avatar_url: string | null }) => ({
            name: t.name,
            role: t.role,
            company: t.company,
            content: t.content,
            avatar: t.avatar_url,
          }));

          setTestimonials(items);
        }
      } catch (error) {
        console.log('Erro ao buscar depoimentos, usando fallback:', error);
      }
    }

    fetchTestimonials();
  }, [locale]);

  const nextTestimonial = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      setIsVisible(true);
    }, 300);
  }, [testimonials.length]);

  useEffect(() => {
    if (isPaused || testimonials.length === 0) return;

    const interval = setInterval(() => {
      nextTestimonial();
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, nextTestimonial, testimonials.length]);

  // Reset index when testimonials change
  useEffect(() => {
    setCurrentIndex(0);
  }, [testimonials]);

  if (testimonials.length === 0) {
    return null;
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div
      className="relative max-w-4xl mx-auto px-6 min-h-[280px] flex items-center justify-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Testimonial Card */}
      <div
        className={`flex items-center gap-6 transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
        }`}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
            {currentTestimonial.avatar ? (
              <Image
                src={currentTestimonial.avatar}
                alt={currentTestimonial.name}
                width={80}
                height={80}
                className="object-cover"
              />
            ) : (
              <svg
                className="w-12 h-12 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            )}
          </div>
        </div>

        {/* Speech Bubble */}
        <div className="relative flex-1">
          {/* Arrow pointing to avatar */}
          <div className="absolute left-0 top-6 -translate-x-full">
            <div
              className="w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-r-[16px] border-r-[#D4A84B]"
            />
          </div>

          {/* Bubble content */}
          <div className="bg-gradient-to-br from-[#D4A84B] to-[#C9983A] rounded-2xl p-6 shadow-xl">
            {/* Stars */}
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-5 h-5 text-[#1a1a2e]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            {/* Quote */}
            <p className="text-[#1a1a2e] text-sm md:text-base leading-relaxed mb-4">
              &ldquo;{currentTestimonial.content}&rdquo;
            </p>

            {/* Author info */}
            <div className="text-[#1a1a2e]/80 text-sm">
              <span className="font-semibold">{currentTestimonial.name}</span>
              <span className="mx-2">-</span>
              <span>{currentTestimonial.role}{currentTestimonial.company ? `, ${currentTestimonial.company}` : ''}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
