'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckSquare, MessageCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Footer from '@/components/sections/Footer';
import StarfieldCanvas from '@/components/ui/StarfieldCanvas';
import ServiceModel3D from '@/components/three/ServiceModel3D';
import Link from 'next/link';

interface ServiceItem {
  slug: string;
  icon: string;
  model3D: string;
  title: string;
  shortDescription: string;
  heroTitle: string;
  video: string;
  description: string[];
  checklist: string[];
}

export default function ServicePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { t } = useLanguage();
  const services = t.services;

  // Encontra o serviço pelo slug
  const service = services.items.find((item: ServiceItem) => item.slug === slug);

  if (!service) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-900 mb-4">Serviço não encontrado</h1>
          <Link href="/" className="text-gold-500 hover:text-gold-600">
            Voltar para a página inicial
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      {/* Hero Section com Vídeo */}
      <section className="relative min-h-[50vh] flex items-center justify-center ">
        {/* Background Video */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={service.video} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/70 via-[#1a1a2e]/50 to-[#1a1a2e]/70" />
        </div>

        {/* Título do Serviço */}
        <div className="relative z-10 container mx-auto px-6 py-24 text-center">
          <motion.h1
            className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white uppercase tracking-wide"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {service.heroTitle}
          </motion.h1>
        </div>

        {/* Linha dourada inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gold-500" />
      </section>

      {/* Seção de Texto Descritivo - Fundo Branco */}
      <section className="bg-[#f5f5f5] py-16">
        <div className="container mx-auto px-6">
          <motion.div
            className="max-w-4xl mx-auto space-y-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {service.description.map((paragraph: string, index: number) => (
              <p
                key={index}
                className="text-dark-700 text-base md:text-lg leading-relaxed text-justify"
              >
                {paragraph}
              </p>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Seção com Modelo 3D e Checklist - Fundo Branco */}
      <section className="bg-[#f5f5f5] py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Esquerda - Modelo 3D */}
            <motion.div
              className="relative aspect-[4/3] bg-[#f5f5f5] rounded-lg overflow-hidden order-2 lg:order-1"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <ServiceModel3D modelPath={service.model3D} />
            </motion.div>

            {/* Direita - Checklist */}
            <motion.div
              className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-lg order-1 lg:order-2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ul className="space-y-5">
                {service.checklist.map((item: string, index: number) => (
                  <motion.li
                    key={index}
                    className="flex items-start gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-gold-500/10 rounded flex items-center justify-center mt-0.5">
                      <CheckSquare className="w-4 h-4 text-gold-600" />
                    </div>
                    <span className="text-dark-700 text-sm md:text-base leading-relaxed">
                      {item}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
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
