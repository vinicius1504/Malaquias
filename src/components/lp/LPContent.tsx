'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import LPHero from '@/components/lp/sections/LPHero';
import LPTextImage from '@/components/lp/sections/LPTextImage';
import LPCarouselCards, { CarouselCard } from '@/components/lp/sections/LPCarouselCards';
import LPServicesTabs, { ServiceTab } from '@/components/lp/sections/LPServicesTabs';
import LPFAQ, { FAQItem } from '@/components/lp/sections/LPFAQ';
import LPCTA, { FormField } from '@/components/lp/sections/LPCTA';
import LPFixedSections from '@/components/lp/sections/LPFixedSections';

// Tipos para as sections
interface TextImageSection {
  type: 'textImage';
  tag?: string;
  title: string;
  titleHighlight?: string;
  paragraphs: string[];
  ctaText?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;
  image: string;
  imageAlt?: string;
  imagePosition: 'left' | 'right';
  backgroundColor?: string;
}

interface CarouselCardsSection {
  type: 'carouselCards';
  tag?: string;
  title: string;
  titleHighlight?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  cards: CarouselCard[];
  contentPosition: 'left' | 'right';
  speed?: number;
  backgroundColor?: string;
}

interface ServicesTabsSection {
  type: 'servicesTabs';
  tag?: string;
  title?: string;
  titleHighlight?: string;
  tabs: ServiceTab[];
  ctaText?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;
  logoSvg?: string;
  logoPosition?: 'left' | 'right';
  backgroundColor?: string;
}

interface FAQSection {
  type: 'faq';
  tag?: string;
  title: string;
  titleHighlight?: string;
  description?: string;
  questions: FAQItem[];
  ctaText?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  backgroundColor?: string;
}

interface CTASection {
  type: 'cta';
  tag?: string;
  title: string;
  titleHighlight?: string;
  description?: string;
  fields?: FormField[];
  submitText?: string;
  submitMicrocopy?: string;
  backgroundColor?: string;
}

type Section = TextImageSection | CarouselCardsSection | ServicesTabsSection | FAQSection | CTASection;

interface HeroData {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  ctaSecondaryText?: string;
  ctaSecondaryLink?: string;
  trustText?: string;
  backgroundType: 'video' | 'image';
  backgroundVideos?: string[];
  backgroundVideo?: string;
  backgroundImage?: string;
  videoDuration?: number;
  highlights: {
    text: string;
    emphasis?: string;
  }[];
}

interface LocaleContent {
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  hero: HeroData;
  sections: Section[];
}

interface LPData {
  slug: string;
  theme: {
    mode: string;
    accentColor: string;
  };
  content: {
    pt: LocaleContent;
    en: LocaleContent;
    es: LocaleContent;
  };
}

interface LPContentProps {
  data: LPData;
}

// Componente para renderizar sections dinamicamente
function renderSection(section: Section, index: number, accentColor: string) {
  switch (section.type) {
    case 'textImage':
      return (
        <LPTextImage
          key={index}
          tag={section.tag}
          title={section.title}
          titleHighlight={section.titleHighlight}
          paragraphs={section.paragraphs}
          ctaText={section.ctaText}
          ctaButtonText={section.ctaButtonText}
          ctaButtonLink={section.ctaButtonLink}
          image={section.image}
          imageAlt={section.imageAlt}
          imagePosition={section.imagePosition}
          backgroundColor={section.backgroundColor}
          accentColor={accentColor}
        />
      );
    case 'carouselCards':
      return (
        <LPCarouselCards
          key={index}
          tag={section.tag}
          title={section.title}
          titleHighlight={section.titleHighlight}
          description={section.description}
          ctaText={section.ctaText}
          ctaLink={section.ctaLink}
          cards={section.cards}
          contentPosition={section.contentPosition}
          speed={section.speed}
          backgroundColor={section.backgroundColor}
          accentColor={accentColor}
        />
      );
    case 'servicesTabs':
      return (
        <LPServicesTabs
          key={index}
          tag={section.tag}
          title={section.title}
          titleHighlight={section.titleHighlight}
          tabs={section.tabs}
          ctaText={section.ctaText}
          ctaButtonText={section.ctaButtonText}
          ctaButtonLink={section.ctaButtonLink}
          logoSvg={section.logoSvg}
          logoPosition={section.logoPosition}
          backgroundColor={section.backgroundColor}
          accentColor={accentColor}
        />
      );
    case 'faq':
      return (
        <LPFAQ
          key={index}
          tag={section.tag}
          title={section.title}
          titleHighlight={section.titleHighlight}
          description={section.description}
          questions={section.questions}
          ctaText={section.ctaText}
          ctaButtonText={section.ctaButtonText}
          ctaButtonLink={section.ctaButtonLink}
          backgroundImage={section.backgroundImage}
          backgroundVideo={section.backgroundVideo}
          backgroundColor={section.backgroundColor}
          accentColor={accentColor}
        />
      );
    case 'cta':
      return (
        <LPCTA
          key={index}
          tag={section.tag}
          title={section.title}
          titleHighlight={section.titleHighlight}
          description={section.description}
          fields={section.fields}
          submitText={section.submitText}
          submitMicrocopy={section.submitMicrocopy}
          backgroundColor={section.backgroundColor}
          accentColor={accentColor}
        />
      );
    default:
      return null;
  }
}

export default function LPContent({ data }: LPContentProps) {
  const { locale } = useLanguage();

  // Seleciona o conteúdo baseado no idioma atual
  const content = data.content[locale] || data.content.pt;
  const accentColor = data.theme.accentColor;

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <LPHero
        title={content.hero.title}
        description={content.hero.description}
        ctaText={content.hero.ctaText}
        ctaLink={content.hero.ctaLink}
        ctaSecondaryText={content.hero.ctaSecondaryText}
        ctaSecondaryLink={content.hero.ctaSecondaryLink}
        trustText={content.hero.trustText}
        highlights={content.hero.highlights}
        backgroundType={content.hero.backgroundType}
        backgroundVideos={content.hero.backgroundVideos}
        backgroundVideo={content.hero.backgroundVideo}
        backgroundImage={content.hero.backgroundImage}
        videoDuration={content.hero.videoDuration}
        accentColor={accentColor}
      />

      {/* Sections dinâmicas */}
      {content.sections?.map((section: Section, index: number) =>
        renderSection(section, index, accentColor)
      )}

      {/* Seções fixas: Blog + Footer */}
      <LPFixedSections />
    </main>
  );
}
