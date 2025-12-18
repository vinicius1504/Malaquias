# Arquitetura do Projeto – Site Malaquias Contabilidade

Este documento descreve como o projeto está organizado, com foco em:
- Reutilização de componentes
- Facilidade de manutenção
- Multi-idioma via JSON
- Preparação para integrações futuras (3D, CMS, editor de conteúdo)

---

## 1. Stack Tecnológica

- **Framework:** Next.js (App Router, pasta `app/`)
- **Linguagem:** TypeScript
- **Estilos:** Tailwind CSS
- **Componentes:** React + componentes internos em `components/`
- **Internacionalização (i18n):** arquivos JSON em `locales/`
- **3D / Animação:** estrutura preparada para `react-three-fiber` + `@react-three/drei` em `components/three/`

---

## 2. Estrutura de Pastas

```txt
app/
  layout.tsx
  page.tsx
  (routes e futuras páginas)

components/
  layout/
    Header.tsx
    Footer.tsx
    MainLayout.tsx
  sections/
    HeroSection.tsx
    ServicesSection.tsx
    WhyMalaquiasSection.tsx
    SegmentsSection.tsx
    TestimonialsSection.tsx
    FaqSection.tsx
    ContactSection.tsx
  ui/
    Button.tsx
    Card.tsx
    SectionContainer.tsx
    SectionTitle.tsx
  three/
    GalaxyBackground.tsx
    Logo3D.tsx
    ThreeCanvas.tsx

hooks/
  useI18n.ts
  useScrollSection.ts

locales/
  pt/
    common.json
    home.json
    services.json
    faq.json
  en/
    common.json
    home.json
    services.json
    faq.json

config/
  site.config.ts
  i18n.config.ts

lib/
  formatters.ts
  constants.ts
  utils.ts

styles/
  globals.css
  tailwind.css (separado, se necessário)

docs/
  ARQUITETURA_PROJETO.md

---

## 🎯 PLANO: Páginas Dinâmicas por Segmento

### Objetivo
Criar páginas individuais para cada segmento de atuação (indústria, varejo, saúde, etc.) usando rotas dinâmicas `[slug]`, onde cada página pode ter sections diferentes, ordem diferente, cores e conteúdos personalizados.

---

### Fase 1: Preparação do Banco de Dados (Supabase)

**1.1 Atualizar tabela `segments`**
```sql
ALTER TABLE segments ADD COLUMN slug VARCHAR(100) UNIQUE;
ALTER TABLE segments ADD COLUMN description TEXT;
ALTER TABLE segments ADD COLUMN theme VARCHAR(20) DEFAULT 'light'; -- 'light' | 'dark'
ALTER TABLE segments ADD COLUMN accent_color VARCHAR(20) DEFAULT '#FF6B00';
ALTER TABLE segments ADD COLUMN sections_config JSONB DEFAULT '[]';
ALTER TABLE segments ADD COLUMN seo_title VARCHAR(200);
ALTER TABLE segments ADD COLUMN seo_description VARCHAR(500);
ALTER TABLE segments ADD COLUMN icon VARCHAR(50);
```

**1.2 Criar tabela `segment_translations`** (multi-idioma)
```sql
CREATE TABLE segment_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id UUID REFERENCES segments(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL, -- 'pt', 'en', 'es'
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(300),
  description TEXT,
  hero_title VARCHAR(200),
  hero_subtitle VARCHAR(300),
  benefits JSONB DEFAULT '[]', -- [{title, description, icon}]
  features JSONB DEFAULT '[]',
  cta_text VARCHAR(100),
  cta_link VARCHAR(200),
  UNIQUE(segment_id, locale)
);
```

**1.3 Criar tabela `segment_sections`** (sections customizáveis)
```sql
CREATE TABLE segment_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id UUID REFERENCES segments(id) ON DELETE CASCADE,
  section_type VARCHAR(50) NOT NULL, -- 'hero', 'benefits', 'features', 'cases', 'testimonials', 'faq', 'cta'
  display_order INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  custom_config JSONB DEFAULT '{}', -- configurações específicas da section
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Fase 2: Estrutura de Arquivos

**2.1 Criar estrutura de pastas**
```
src/
├── app/(site)/segmentos/
│   ├── page.tsx                    # Lista todos os segmentos
│   └── [slug]/
│       └── page.tsx                # Página dinâmica do segmento
│
├── components/segments/
│   ├── SegmentPage.tsx             # Componente principal da página
│   ├── SegmentRenderer.tsx         # Renderiza sections dinamicamente
│   │
│   └── sections/                   # Sections específicas para segmentos
│       ├── SegmentHero.tsx         # Hero customizável
│       ├── SegmentBenefits.tsx     # Lista de benefícios
│       ├── SegmentFeatures.tsx     # Features/diferenciais
│       ├── SegmentCases.tsx        # Cases/Portfólio
│       ├── SegmentProcess.tsx      # Como funciona
│       ├── SegmentFAQ.tsx          # FAQ específico
│       ├── SegmentTestimonials.tsx # Depoimentos filtrados
│       └── SegmentCTA.tsx          # Call to action
│
├── types/
│   └── segments.ts                 # Tipos específicos
│
└── lib/
    └── segments.ts                 # Funções de fetch e utils
```

---

### Fase 3: Implementação Backend

**3.1 Atualizar types** (`src/types/segments.ts`)
- SegmentFull (com translations)
- SegmentSection
- SegmentConfig
- SectionType enum

**3.2 Criar lib de segmentos** (`src/lib/segments.ts`)
- `getSegmentBySlug(slug, locale)`
- `getAllSegments(locale)`
- `getSegmentSections(segmentId)`

**3.3 Criar/Atualizar APIs**
- `GET /api/segments/[slug]` - Retorna segmento com translations
- Atualizar admin APIs para novos campos

---

### Fase 4: Implementação Frontend

**4.1 Página dinâmica** (`src/app/(site)/segmentos/[slug]/page.tsx`)
- Server component com fetch do segmento
- Metadata dinâmica (SEO)
- Renderização das sections

**4.2 Renderer de sections** (`SegmentRenderer.tsx`)
- Mapeia section_type para componente
- Passa props customizadas
- Ordem definida pelo banco

**4.3 Sections individuais**
Cada section recebe:
- Dados do segmento
- Config específica
- Tema/cores

---

### Fase 5: Admin para Gerenciar

**5.1 Atualizar página de segmentos**
- Formulário com novos campos
- Editor de sections (drag & drop ordem)
- Preview de cores/tema

**5.2 Traduções**
- Abas por idioma
- Editor de benefícios/features (JSON visual)

---

### Fase 6: Testes e Refinamento

- Testar todos os segmentos
- Verificar SEO/meta tags
- Performance (ISR/cache)
- Responsividade

---

## 📋 Checklist de Tarefas

### Banco de Dados
- [ ] Criar migration para novos campos em `segments`
- [ ] Criar tabela `segment_translations`
- [ ] Criar tabela `segment_sections`
- [ ] Inserir dados de teste

### Types & Lib
- [ ] Criar `src/types/segments.ts`
- [ ] Criar `src/lib/segments.ts`

### API
- [ ] Criar `GET /api/segments/[slug]`
- [ ] Atualizar APIs admin

### Frontend - Estrutura
- [ ] Criar `src/app/(site)/segmentos/page.tsx`
- [ ] Criar `src/app/(site)/segmentos/[slug]/page.tsx`
- [ ] Criar `src/components/segments/SegmentRenderer.tsx`

### Frontend - Sections
- [ ] Criar `SegmentHero.tsx`
- [ ] Criar `SegmentBenefits.tsx`
- [ ] Criar `SegmentFeatures.tsx`
- [ ] Criar `SegmentCases.tsx`
- [ ] Criar `SegmentProcess.tsx`
- [ ] Criar `SegmentFAQ.tsx`
- [ ] Criar `SegmentTestimonials.tsx`
- [ ] Criar `SegmentCTA.tsx`

### Admin
- [ ] Atualizar formulário de segmentos
- [ ] Adicionar editor de sections
- [ ] Adicionar abas de tradução

### i18n
- [ ] Criar `src/locales/pt/segments.json`
- [ ] Criar `src/locales/en/segments.json`
- [ ] Criar `src/locales/es/segments.json`

---

## 🔧 Exemplo de Configuração por Segmento

```typescript
// Exemplo: Segmento "Indústria"
{
  slug: 'industria',
  theme: 'dark',
  accent_color: '#FF6B00',
  sections: [
    { type: 'hero', order: 1 },
    { type: 'benefits', order: 2 },
    { type: 'process', order: 3 },
    { type: 'cases', order: 4 },
    { type: 'testimonials', order: 5 },
    { type: 'cta', order: 6 }
  ],
  translations: {
    pt: {
      title: 'Contabilidade para Indústria',
      hero_title: 'Soluções contábeis para o setor industrial',
      benefits: [
        { title: 'Gestão de custos', description: '...', icon: 'factory' },
        { title: 'Compliance fiscal', description: '...', icon: 'shield' }
      ]
    }
  }
}

// Exemplo: Segmento "Varejo" (diferente!)
{
  slug: 'varejo',
  theme: 'light',
  accent_color: '#00A3FF',
  sections: [
    { type: 'hero', order: 1 },
    { type: 'cases', order: 2 },      // Cases vem antes!
    { type: 'benefits', order: 3 },
    { type: 'faq', order: 4 },        // Tem FAQ, indústria não tinha
    { type: 'cta', order: 5 }
  ]
}
```

---

## 🚀 Ordem de Execução Recomendada

1. **Fase 1** - Banco de dados (fundação)
2. **Fase 2** - Estrutura de arquivos (esqueleto)
3. **Fase 3** - Backend (dados fluindo)
4. **Fase 4** - Frontend sections (visualização)
5. **Fase 5** - Admin (gerenciamento)
6. **Fase 6** - Testes (qualidade)
