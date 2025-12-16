-- Script para criar a tabela de depoimentos no Supabase
-- Execute este SQL no Editor SQL do seu projeto Supabase

-- Tabela de depoimentos (dados base)
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de traduções de depoimentos
CREATE TABLE IF NOT EXISTS testimonial_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  testimonial_id UUID NOT NULL REFERENCES testimonials(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL CHECK (locale IN ('pt', 'en', 'es')),
  role VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  content TEXT NOT NULL,
  UNIQUE(testimonial_id, locale)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_testimonials_is_active ON testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_display_order ON testimonials(display_order);
CREATE INDEX IF NOT EXISTS idx_testimonial_translations_testimonial_id ON testimonial_translations(testimonial_id);
CREATE INDEX IF NOT EXISTS idx_testimonial_translations_locale ON testimonial_translations(locale);

-- Habilitar RLS (Row Level Security)
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonial_translations ENABLE ROW LEVEL SECURITY;

-- Política de acesso para leitura pública de depoimentos ativos
CREATE POLICY "Permitir leitura pública de depoimentos ativos" ON testimonials
  FOR SELECT USING (is_active = true);

CREATE POLICY "Permitir leitura pública de traduções de depoimentos" ON testimonial_translations
  FOR SELECT USING (true);

-- Política para service role (admin) - usando true para permitir tudo com service key
CREATE POLICY "Service role pode tudo em testimonials" ON testimonials
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role pode tudo em testimonial_translations" ON testimonial_translations
  FOR ALL USING (true) WITH CHECK (true);

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
