'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Footer from '../sections/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

// Carrega o modelo 3D dinâmico sem SSR
const DynamicServiceModel3D = dynamic(() => import('../three/ServiceModel3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center">
      <div className="text-white/40">Carregando modelo 3D...</div>
    </div>
  ),
});

interface ServicePageContentProps {
  title: string;
  subtitle: string;
  checklist: string[];
  model3DPath: string;
  icon: string;
}

export default function ServicePageContent({
  title,
  subtitle,
  checklist,
  model3DPath,
}: ServicePageContentProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      {/* Hero Section com imagem de fundo */}
      <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        {/* Imagem de fundo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/hero-services.jpg')",
          }}
        />
        {/* Overlay escuro */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a]/70 via-[#0a0a1a]/50 to-[#0a0a1a]" />

        {/* Título do serviço */}
        <motion.div
          className="relative z-10 text-center px-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-white uppercase tracking-wide">
            {title}
          </h1>
        </motion.div>

        {/* Curva inferior */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#0a0a1a"
            />
          </svg>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-6 py-16">
        <div className="relative min-h-[600px]">
          {/* Modelo 3D - área expandida, posicionado à esquerda */}
          <div className="absolute -left-32 -top-20 -bottom-20 w-[55%] z-0">
            <DynamicServiceModel3D modelPath={model3DPath} />
          </div>

          {/* Conteúdo à direita */}
          <div className="relative z-10 lg:ml-auto lg:w-1/2 space-y-8">
            {/* Texto descritivo */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="text-white/80 leading-relaxed whitespace-pre-line text-justify">
                {subtitle}
              </p>
            </motion.div>

            {/* Checklist */}
            <motion.div
              className="bg-[#1a1a2e]/60 backdrop-blur-md rounded-2xl p-6 border border-gold-500/30"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <ul className="space-y-4">
                {checklist.map((item, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  >
                    {/* Ícone de check dourado */}
                    <span className="flex-shrink-0 w-6 h-6 bg-gold-500 rounded flex items-center justify-center mt-0.5">
                      <svg
                        className="w-4 h-4 text-[#0a0a1a]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                    <span className="text-white/90">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <section className="py-20 px-6">
        <motion.div
          className="container mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1a1a2e] to-[#0a0a1a] border border-gold-500/30">
            {/* Decoração de fundo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-500 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="relative z-10 py-16 px-8 md:px-16 text-center">
              <h2 className="text-2xl md:text-4xl font-heading font-bold text-white mb-4">
                {t.services.cta.title}
              </h2>
              <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
                {t.services.cta.description}
              </p>
              <Link
                href="https://wa.me/5567996617549?text=Olá! Gostaria de saber mais sobre os serviços da Malaquias Contabilidade."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-[#0a0a1a] font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gold-500/30"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {t.services.cta.button}
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
