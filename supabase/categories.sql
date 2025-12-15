-- Tabela de categorias de notícias
CREATE TABLE IF NOT EXISTS news_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name_pt VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  name_es VARCHAR(255),
  color VARCHAR(20) DEFAULT '#C9983A',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_news_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_news_categories_updated_at ON news_categories;

CREATE TRIGGER trigger_news_categories_updated_at
  BEFORE UPDATE ON news_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_news_categories_updated_at();

-- Inserir categorias padrão
INSERT INTO news_categories (slug, name_pt, name_en, name_es) VALUES
  ('saude', 'Saúde', 'Health', 'Salud'),
  ('varejo', 'Varejo e E-commerce', 'Retail and E-commerce', 'Retail y E-commerce'),
  ('legislacao', 'Legislação', 'Legislation', 'Legislación'),
  ('gestao', 'Gestão Financeira', 'Financial Management', 'Gestión Financiera'),
  ('tributos', 'Tributos', 'Taxes', 'Impuestos')
ON CONFLICT (slug) DO NOTHING;

-- Adicionar coluna category_id na tabela news se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'news' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE news ADD COLUMN category_id UUID REFERENCES news_categories(id);
  END IF;
END $$;

-- RLS Policies
ALTER TABLE news_categories ENABLE ROW LEVEL SECURITY;

-- Remover policies existentes para recriar
DROP POLICY IF EXISTS "Categorias são públicas" ON news_categories;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar categorias" ON news_categories;

-- Permitir leitura pública das categorias
CREATE POLICY "Categorias são públicas" ON news_categories
  FOR SELECT USING (true);

-- Permitir todas as operações (INSERT, UPDATE, DELETE) para qualquer usuário
-- Em produção, você pode querer restringir isso
CREATE POLICY "Permitir gerenciamento de categorias" ON news_categories
  FOR ALL USING (true) WITH CHECK (true);
