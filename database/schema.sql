-- Schema do banco de dados Malaquias
-- Execute este script no PostgreSQL após criar o banco

-- Extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários admin
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin', -- 'dev', 'admin', 'editor'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de categorias de notícias
CREATE TABLE IF NOT EXISTS news_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  name_pt VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  name_es VARCHAR(255),
  color VARCHAR(50) DEFAULT '#C9983A',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de notícias
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(255),
  category_id UUID REFERENCES news_categories(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published'
  image_url TEXT,
  image_banner TEXT,
  author_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de traduções de notícias
CREATE TABLE IF NOT EXISTS news_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  locale VARCHAR(10) NOT NULL, -- 'pt', 'en', 'es'
  title VARCHAR(500) NOT NULL,
  excerpt TEXT,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(news_id, locale)
);

-- Tabela de segmentos
CREATE TABLE IF NOT EXISTS segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  lp_slug VARCHAR(255),
  image_url TEXT,
  video_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de depoimentos
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de traduções de depoimentos
CREATE TABLE IF NOT EXISTS testimonial_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  testimonial_id UUID NOT NULL REFERENCES testimonials(id) ON DELETE CASCADE,
  locale VARCHAR(10) NOT NULL, -- 'pt', 'en', 'es'
  role VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(testimonial_id, locale)
);

-- Tabela de parceiros/clientes
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'partner', 'client'
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'login'
  entity VARCHAR(100) NOT NULL, -- nome da tabela afetada
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at);
CREATE INDEX IF NOT EXISTS idx_news_translations_news_id ON news_translations(news_id);
CREATE INDEX IF NOT EXISTS idx_news_translations_locale ON news_translations(locale);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_active ON testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonial_translations_testimonial_id ON testimonial_translations(testimonial_id);
CREATE INDEX IF NOT EXISTS idx_partners_type ON partners(type);
CREATE INDEX IF NOT EXISTS idx_partners_is_active ON partners(is_active);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Inserir usuário admin padrão (senha: Admin123!)
-- A senha está hasheada com bcrypt (12 rounds)
INSERT INTO admin_users (email, name, password_hash, role)
VALUES (
  'admin@malaquias.com.br',
  'Administrador',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2oK8jrOKoG',
  'dev'
) ON CONFLICT (email) DO NOTHING;

-- Inserir algumas categorias padrão
INSERT INTO news_categories (slug, name_pt, name_en, name_es, color) VALUES
  ('contabilidade', 'Contabilidade', 'Accounting', 'Contabilidad', '#C9983A'),
  ('fiscal', 'Fiscal', 'Tax', 'Fiscal', '#3B82F6'),
  ('trabalhista', 'Trabalhista', 'Labor', 'Laboral', '#10B981'),
  ('empresarial', 'Empresarial', 'Business', 'Empresarial', '#8B5CF6')
ON CONFLICT (slug) DO NOTHING;
