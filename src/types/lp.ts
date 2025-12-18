/**
 * Types para Landing Pages de Segmentos
 * Cada section tem seus próprios dados customizáveis
 */

// ============================================
// TIPOS BASE
// ============================================

export type ThemeMode = 'light' | 'dark';

export interface LPTheme {
  mode: ThemeMode;
  accentColor: string; // hex color
  accentColorHover?: string;
}

// ============================================
// HERO SECTION
// ============================================

export interface LPHeroData {
  // Textos principais
  title: string;
  highlightWord?: string; // palavra destacada no título
  subtitle: string;

  // CTA
  ctaText: string;
  ctaLink: string;
  ctaSecondaryText?: string;
  ctaSecondaryLink?: string;

  // Mídia
  backgroundType: 'video' | 'image' | 'gradient';
  backgroundUrl?: string; // URL do vídeo ou imagem
  backgroundOverlay?: number; // 0-100 opacidade do overlay

  // Badges/Tags opcionais
  badge?: string; // ex: "Especialistas há 30 anos"
}

// ============================================
// BENEFITS SECTION
// ============================================

export interface LPBenefit {
  icon: string; // nome do ícone Lucide
  title: string;
  description: string;
}

export interface LPBenefitsData {
  title: string;
  subtitle?: string;
  benefits: LPBenefit[];
  layout: 'grid' | 'list' | 'cards'; // diferentes layouts
  columns?: 2 | 3 | 4; // número de colunas no grid
}

// ============================================
// FEATURES SECTION
// ============================================

export interface LPFeature {
  icon: string;
  title: string;
  description: string;
  highlight?: boolean; // destaca este feature
}

export interface LPFeaturesData {
  title: string;
  subtitle?: string;
  features: LPFeature[];

  // Mídia lateral (opcional)
  mediaType?: 'image' | '3d' | 'none';
  mediaUrl?: string;
  mediaPosition?: 'left' | 'right';
}

// ============================================
// PROCESS/STEPS SECTION
// ============================================

export interface LPStep {
  number: number;
  title: string;
  description: string;
  icon?: string;
}

export interface LPProcessData {
  title: string;
  subtitle?: string;
  steps: LPStep[];
  layout: 'timeline' | 'horizontal' | 'cards';
}

// ============================================
// TESTIMONIALS SECTION
// ============================================

export interface LPTestimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatarUrl?: string;
  rating?: number; // 1-5
}

export interface LPTestimonialsData {
  title: string;
  subtitle?: string;
  testimonials: LPTestimonial[]; // IDs ou dados completos
  layout: 'carousel' | 'grid' | 'featured';
  showRating?: boolean;
}

// ============================================
// FAQ SECTION
// ============================================

export interface LPFAQItem {
  question: string;
  answer: string;
}

export interface LPFAQData {
  title: string;
  subtitle?: string;
  items: LPFAQItem[];
  columns?: 1 | 2; // FAQ em 1 ou 2 colunas
}

// ============================================
// CTA SECTION
// ============================================

export interface LPCTAData {
  title: string;
  subtitle?: string;

  // Botão principal
  buttonText: string;
  buttonLink: string;

  // Botão secundário (opcional)
  secondaryButtonText?: string;
  secondaryButtonLink?: string;

  // Visual
  backgroundType: 'solid' | 'gradient' | 'image';
  backgroundUrl?: string;

  // Extras
  features?: string[]; // lista de features curtas (ex: "✓ Sem taxas ocultas")
}

// ============================================
// NÚMEROS/STATS SECTION
// ============================================

export interface LPStat {
  value: string; // "30+" ou "1000"
  label: string;
  suffix?: string; // "anos", "clientes"
  prefix?: string; // "R$", "+"
}

export interface LPStatsData {
  title?: string;
  stats: LPStat[];
  layout: 'inline' | 'grid' | 'cards';
}

// ============================================
// PARTNERS/LOGOS SECTION
// ============================================

export interface LPPartner {
  id: string;
  name: string;
  logoUrl: string;
}

export interface LPPartnersData {
  title?: string;
  subtitle?: string;
  partners: LPPartner[];
  layout: 'carousel' | 'grid';
  grayscale?: boolean; // logos em escala de cinza
}

// ============================================
// CONTACT FORM SECTION
// ============================================

export interface LPContactField {
  name: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[]; // para select
}

export interface LPContactData {
  title: string;
  subtitle?: string;
  fields: LPContactField[];
  submitText: string;
  successMessage?: string;

  // Info lateral
  showInfo?: boolean;
  phone?: string;
  email?: string;
  address?: string;
  whatsapp?: string;
}

// ============================================
// SECTION TYPES ENUM
// ============================================

export type LPSectionType =
  | 'hero'
  | 'benefits'
  | 'features'
  | 'process'
  | 'testimonials'
  | 'faq'
  | 'cta'
  | 'stats'
  | 'partners'
  | 'contact';

// ============================================
// CONFIGURAÇÃO DE SECTION
// ============================================

export interface LPSectionConfig {
  id: string;
  type: LPSectionType;
  order: number;
  isActive: boolean;
  data:
    | LPHeroData
    | LPBenefitsData
    | LPFeaturesData
    | LPProcessData
    | LPTestimonialsData
    | LPFAQData
    | LPCTAData
    | LPStatsData
    | LPPartnersData
    | LPContactData;
}

// ============================================
// LANDING PAGE COMPLETA
// ============================================

export interface LandingPageData {
  // Identificação
  id: string;
  slug: string;
  segmentId: string;

  // SEO
  seoTitle: string;
  seoDescription: string;
  seoKeywords?: string[];
  ogImage?: string;

  // Tema
  theme: LPTheme;

  // Sections
  sections: LPSectionConfig[];

  // Meta
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// PROPS PARA COMPONENTES
// ============================================

export interface LPSectionProps<T = unknown> {
  data: T;
  theme: LPTheme;
  className?: string;
}
