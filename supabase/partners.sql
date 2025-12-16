-- Script para criar a tabela de parceiros/clientes no Supabase
-- Execute este SQL no Editor SQL do seu projeto Supabase

-- Tabela de parceiros/clientes
CREATE TABLE IF NOT EXISTS partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'client' CHECK (type IN ('partner', 'client')),
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_partners_type ON partners(type);
CREATE INDEX IF NOT EXISTS idx_partners_is_active ON partners(is_active);
CREATE INDEX IF NOT EXISTS idx_partners_display_order ON partners(display_order);

-- Habilitar RLS (Row Level Security)
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Política de acesso para leitura pública de parceiros ativos
CREATE POLICY "Permitir leitura pública de parceiros ativos" ON partners
  FOR SELECT USING (is_active = true);

-- Política para service role (admin)
CREATE POLICY "Service role pode tudo em partners" ON partners
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_partners_updated_at ON partners;
CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
