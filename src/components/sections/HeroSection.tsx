'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

/**
 * Props do componente HeroSection
 * @property title1 - Primeira parte do título principal (ex: "Menos burocracia")
 * @property highlight1 - Primeira palavra destacada em dourado (ex: "mais resultados")
 * @property title2 - Segunda parte do título (ex: ", economia")
 * @property highlight2 - Segunda palavra destacada em dourado (ex: "inteligente")
 * @property subtitle - Texto do subtítulo abaixo do título
 * @property ctaText - Texto do botão de chamada para ação
 */
interface HeroSectionProps {
  title1: string;
  highlight1: string;
  title2: string;
  highlight2: string;
  subtitle: string;
  ctaText: string;
}

export default function HeroSection({
  title1,
  highlight1,
  title2,
  highlight2,
  subtitle,
  ctaText,
}: HeroSectionProps) {
  // Estado que controla qual fase da digitação está ativa (0-4)
  const [currentPhase, setCurrentPhase] = useState(0);

  // Estado que armazena o texto já digitado de cada parte
  const [displayedTexts, setDisplayedTexts] = useState({
    title1: '',
    highlight1: '',
    title2: '',
    highlight2: '',
    subtitle: '',
  });

  // Estado que controla a visibilidade do botão CTA
  const [showButton, setShowButton] = useState(false);

  // Velocidade da digitação em milissegundos por caractere
  const speed = 25;

  /**
   * Effect que gerencia a animação de digitação
   * Executa sequencialmente: title1 -> highlight1 -> title2 -> highlight2 -> subtitle
   * Após completar todas as fases, exibe o botão CTA
   */
  useEffect(() => {
    // Array com todas as fases de digitação na ordem
    const phases = [
      { key: 'title1', text: title1 },
      { key: 'highlight1', text: highlight1 },
      { key: 'title2', text: title2 },
      { key: 'highlight2', text: highlight2 },
      { key: 'subtitle', text: subtitle },
    ];

    // Se todas as fases foram completadas, exibe o botão após 300ms
    if (currentPhase >= phases.length) {
      setTimeout(() => setShowButton(true), 200);
      return;
    }

    // Pega a fase atual e inicializa o índice do caractere
    const currentItem = phases[currentPhase];
    let charIndex = 0;

    // Intervalo que adiciona um caractere por vez
    const interval = setInterval(() => {
      if (charIndex <= currentItem.text.length) {
        // Atualiza o texto exibido com mais um caractere
        setDisplayedTexts((prev) => ({
          ...prev,
          [currentItem.key]: currentItem.text.slice(0, charIndex),
        }));
        charIndex++;
      } else {
        // Texto completo - limpa intervalo e avança para próxima fase após 100ms
        clearInterval(interval);
        setTimeout(() => setCurrentPhase((prev) => prev + 1), 100);
      }
    }, speed);

    // Cleanup: limpa o intervalo quando o componente desmonta ou a fase muda
    return () => clearInterval(interval);
  }, [currentPhase, title1, highlight1, title2, highlight2, subtitle]);

  /**
   * Verifica se uma determinada fase está sendo digitada no momento
   * @param phase - Número da fase (0-4)
   */
  const isTyping = (phase: number) => currentPhase === phase;

  /**
   * Determina se o cursor piscante deve ser exibido para uma fase específica
   * O cursor só aparece se a fase está ativa E o texto ainda não foi completamente digitado
   * @param phase - Número da fase (0-4)
   */
  const showCursor = (phase: number) => {
    const phases = [title1, highlight1, title2, highlight2, subtitle];
    return isTyping(phase) && displayedTexts[Object.keys(displayedTexts)[phase] as keyof typeof displayedTexts].length < phases[phase].length;
  };

  /**
   * Componente do cursor piscante
   * Usa Framer Motion para animar a opacidade entre 1 e 0
   */
  const Cursor = () => (
    <motion.span
      animate={{ opacity: [1, 0] }}
      transition={{ duration: 0.5, repeat: Infinity }}
      className="inline-block w-[3px] h-[1em] bg-current ml-0.5 align-middle"
    />
  );

  return (
    <section className="relative min-h-screen flex items-center">
      {/* ==================== CONTEUDO PRINCIPAL ==================== */}
      {/* Container com glassmorphism apenas no lado esquerdo */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-2xl bg-[#1a1a2e]/60 backdrop-blur-md rounded-2xl p-8 border border-white/10">
          {/* Titulo principal com efeito de digitacao */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight mb-6">
            {/* Primeira parte do titulo */}
            <span>{displayedTexts.title1}</span>
            {showCursor(0) && <Cursor />}
            {/* Espaco aparece quando title1 esta completo */}
            {displayedTexts.title1.length === title1.length && ' '}

            {/* Primeiro highlight em dourado */}
            <span className="text-gold-500">{displayedTexts.highlight1}</span>
            {showCursor(1) && <Cursor />}
            {/* Virgula aparece quando highlight1 esta completo */}
            {displayedTexts.highlight1.length === highlight1.length && ', '}

            {/* Segunda parte do titulo */}
            <span>{displayedTexts.title2}</span>
            {showCursor(2) && <Cursor />}
            {/* Espaco aparece quando title2 esta completo */}
            {displayedTexts.title2.length === title2.length && ' '}

            {/* Segundo highlight em dourado */}
            <span className="text-gold-500">{displayedTexts.highlight2}</span>
            {showCursor(3) && <Cursor />}
          </h1>

          {/* Subtitulo com efeito de digitacao */}
          <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-10">
            {displayedTexts.subtitle}
            {showCursor(4) && <Cursor />}
          </p>

          {/* ==================== BOTAO CTA ==================== */}
          {/* Agora dentro do container de texto */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={showButton ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <a
              href="#contato"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-white font-semibold text-sm uppercase tracking-wider rounded hover:from-gold-400 hover:to-gold-500 transition-all duration-300 shadow-lg shadow-gold-500/20"
            >
              {ctaText}
            </a>
          </motion.div>
        </div>
      </div>

      {/* ==================== SETA SCROLL ==================== */}
      {/* Seta animada indicando scroll para baixo */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 z-10">
        <svg
          className="w-8 h-8 animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
