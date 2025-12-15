-- Script para criar as tabelas necessárias no Supabase
-- Execute este SQL no Editor SQL do seu projeto Supabase

-- Tabela de notícias
CREATE TABLE IF NOT EXISTS news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'geral',
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  image_url TEXT,
  author_id UUID,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de traduções de notícias
CREATE TABLE IF NOT EXISTS news_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL CHECK (locale IN ('pt', 'en', 'es')),
  title VARCHAR(500) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  UNIQUE(news_id, locale)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_translations_news_id ON news_translations(news_id);
CREATE INDEX IF NOT EXISTS idx_news_translations_locale ON news_translations(locale);

-- Habilitar RLS (Row Level Security)
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_translations ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para leitura pública de notícias publicadas
CREATE POLICY "Permitir leitura pública de notícias publicadas" ON news
  FOR SELECT USING (status = 'published');

CREATE POLICY "Permitir leitura pública de traduções" ON news_translations
  FOR SELECT USING (true);

-- Políticas para service role (admin)
CREATE POLICY "Service role pode tudo em news" ON news
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role pode tudo em news_translations" ON news_translations
  FOR ALL USING (auth.role() = 'service_role');

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_news_updated_at ON news;
CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
