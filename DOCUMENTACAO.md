# Documentação do Projeto - Malaquias Contabilidade

## Visão Geral

**Malaquias Contabilidade** é uma aplicação web full-stack desenvolvida com **Next.js 14**, focada em soluções de contabilidade, planejamento tributário e gestão empresarial. O projeto combina um site público com um painel administrativo robusto, suportando múltiplos idiomas (PT, EN, ES).

---

## Stack Tecnológico

| Categoria | Tecnologia | Versão |
|-----------|------------|--------|
| Framework | Next.js (App Router) | 14.2.15 |
| Runtime | Node.js + TypeScript | 5.6 |
| UI | React + Tailwind CSS | 18.3 / 3.4 |
| Autenticação | NextAuth v5 | Beta |
| Database | Supabase (PostgreSQL) | - |
| 3D | Three.js + React Three Fiber | 0.170 |
| Editor | TipTap | 3.13 |
| Animações | Framer Motion | 12.23 |
| Email | Nodemailer + Resend | - |
| AI | Google Generative AI | 0.24 |
| Validação | Zod | 4.2 |

---

## Estrutura de Pastas

```
src/
├── app/                          # Next.js App Router
│   ├── (site)/                   # Páginas públicas
│   │   ├── page.tsx              # Home
│   │   ├── sobre/                # Página sobre
│   │   ├── servicos/[slug]/      # Serviços (dinâmico)
│   │   ├── segmentos/[slug]/     # Landing Pages (dinâmico)
│   │   ├── noticias/[slug]/      # Notícias (dinâmico)
│   │   └── contato/              # Contato
│   │
│   ├── admin/                    # Área administrativa (protegida)
│   │   ├── page.tsx              # Dashboard
│   │   ├── login/                # Login
│   │   ├── noticias/             # Gerenciador de notícias
│   │   ├── segmentos/            # Gerenciador de segmentos
│   │   ├── depoimentos/          # Gerenciador de depoimentos
│   │   ├── parceiros/            # Gerenciador de parceiros
│   │   ├── usuarios/             # Gerenciador de usuários (DEV)
│   │   ├── logs/                 # Logs de auditoria (DEV)
│   │   └── textos/               # Editor de conteúdo
│   │
│   └── api/                      # API Routes
│       ├── auth/[...nextauth]/   # NextAuth handler
│       ├── admin/                # Endpoints admin (protegidos)
│       └── [public endpoints]    # Endpoints públicos
│
├── components/                   # Componentes React
│   ├── layout/                   # Header, Footer, MainLayout
│   ├── sections/                 # Seções de página
│   ├── ui/                       # Componentes reutilizáveis
│   ├── three/                    # Componentes 3D
│   ├── admin/                    # Componentes administrativos
│   └── lp/                       # Landing Pages dinâmicas
│
├── contexts/                     # React Contexts
│   └── LanguageContext.tsx       # Internacionalização
│
├── lib/                          # Utilitários
│   ├── auth.ts                   # Configuração NextAuth
│   └── supabase/                 # Cliente Supabase
│
├── data/lp/                      # JSONs das Landing Pages
├── locales/                      # Traduções (pt, en, es)
├── types/                        # TypeScript types
└── styles/                       # Estilos globais
```

---

## Sistema de Rotas

### Rotas Públicas

| Rota | Descrição |
|------|-----------|
| `/` | Home |
| `/sobre` | Página sobre |
| `/servicos/[slug]` | Detalhes de serviço |
| `/segmentos/[slug]` | Landing page de segmento |
| `/noticias` | Lista de notícias |
| `/noticias/[slug]` | Detalhes de notícia |
| `/contato` | Formulário de contato |

### Rotas Administrativas (protegidas)

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/admin` | Dashboard | Admin |
| `/admin/login` | Login | Público |
| `/admin/noticias` | Gerenciador de notícias | Admin |
| `/admin/segmentos` | Gerenciador de segmentos | Admin |
| `/admin/depoimentos` | Gerenciador de depoimentos | Admin |
| `/admin/parceiros` | Gerenciador de parceiros | Admin |
| `/admin/usuarios` | Gerenciador de usuários | DEV only |
| `/admin/logs` | Logs de auditoria | DEV only |
| `/admin/textos` | Editor de conteúdo | Admin |

### API Routes

```
POST /api/auth/[...nextauth]     # NextAuth handler

# Notícias
GET  /api/news                   # Listar notícias públicas
POST /api/admin/news             # Criar notícia
GET  /api/admin/news/[id]        # Obter notícia
PATCH /api/admin/news/[id]       # Atualizar notícia
DELETE /api/admin/news/[id]      # Deletar notícia

# Segmentos
GET  /api/segments               # Listar segmentos públicos
POST /api/admin/segments         # Criar segmento
PATCH /api/admin/segments/[id]   # Atualizar segmento
DELETE /api/admin/segments/[id]  # Deletar segmento

# Depoimentos
GET  /api/testimonials           # Listar depoimentos públicos
POST /api/admin/testimonials     # Criar depoimento
PATCH /api/admin/testimonials/[id] # Atualizar
DELETE /api/admin/testimonials/[id] # Deletar

# Parceiros
GET  /api/partners               # Listar parceiros públicos
POST /api/admin/partners         # Criar parceiro
PATCH /api/admin/partners/[id]   # Atualizar
DELETE /api/admin/partners/[id]  # Deletar

# Usuários (DEV only)
GET  /api/admin/users            # Listar usuários
POST /api/admin/users            # Criar usuário
PATCH /api/admin/users/[id]      # Atualizar
POST /api/admin/users/send-credentials # Enviar credenciais

# Utilitários
POST /api/admin/upload           # Upload de arquivos
POST /api/admin/translate        # Tradução com IA
GET  /api/admin/stats            # Estatísticas
GET  /api/admin/logs             # Logs de auditoria
POST /api/admin/categories       # Gerenciar categorias
```

---

## Sistema de Autenticação

### Configuração

- **Tecnologia:** NextAuth v5 (Beta)
- **Estratégia:** JWT
- **Duração da sessão:** 8 horas
- **Validação:** Zod
- **Hash de senha:** bcrypt

### Fluxo de Autenticação

1. Usuário faz login com email/senha
2. Sistema valida contra tabela `admin_users` no Supabase
3. Verifica se usuário está ativo (`is_active: true`)
4. Hash da senha é comparado com bcrypt
5. Log de auditoria é criado
6. JWT token é gerado e armazenado em cookie

### Roles de Usuário

| Role | Permissões |
|------|------------|
| `dev` | Acesso completo (inclui /usuarios, /logs, /config) |
| `admin` | Acesso limitado (sem áreas sensíveis) |

### Proteção de Rotas

O middleware (`src/middleware.ts`) verifica:
- Token JWT válido para rotas `/admin`
- Role `dev` para rotas protegidas
- Redireciona não autenticados para `/admin/login`

---

## Banco de Dados (Supabase)

### Tabelas Principais

```sql
-- Usuários Admin
admin_users
├── id (UUID)
├── email (text, unique)
├── password_hash (text)
├── name (text)
├── role ('dev' | 'admin')
├── is_active (boolean)
├── created_at, updated_at (timestamp)

-- Notícias
news
├── id (UUID)
├── slug (text)
├── category_id (UUID FK)
├── status ('draft' | 'published')
├── image_url, image_banner (text)
├── author_id (UUID FK)
├── published_at, created_at, updated_at (timestamp)

news_translations
├── id (UUID)
├── news_id (UUID FK)
├── locale ('pt' | 'en' | 'es')
├── title, excerpt, content (text)

-- Parceiros
partners
├── id (UUID)
├── name (text)
├── type ('partner' | 'client')
├── logo_url (text)
├── is_active (boolean)
├── display_order (integer)

-- Depoimentos
testimonials
├── id (UUID)
├── name (text)
├── avatar_url (text)
├── is_active (boolean)
├── display_order (integer)

testimonial_translations
├── id (UUID)
├── testimonial_id (UUID FK)
├── locale ('pt' | 'en' | 'es')
├── role, company, content (text)

-- Segmentos
segments
├── id (UUID)
├── title (text)
├── image_url, video_url (text)
├── is_active (boolean)
├── display_order (integer)

-- Logs de Auditoria
audit_logs
├── id (UUID)
├── user_id (UUID FK)
├── action ('create' | 'update' | 'delete' | 'login')
├── entity, entity_id (text/UUID)
├── old_value, new_value (jsonb)
├── ip_address (text)
├── created_at (timestamp)
```

---

## Sistema de Internacionalização (i18n)

### Idiomas Suportados

- **PT** - Português (padrão)
- **EN** - English
- **ES** - Español

### Estrutura de Arquivos

```
locales/
├── pt/
│   ├── common.json      # Menu, Nav, termos comuns
│   ├── home.json        # Textos da homepage
│   ├── services.json    # Descrições de serviços
│   ├── segments.json    # Descrições de segmentos
│   ├── about.json       # Página sobre
│   ├── contact.json     # Formulário contato
│   ├── news.json        # Blog/notícias
│   └── faq.json         # FAQ (10 perguntas)
├── en/                  # Mesma estrutura
└── es/                  # Mesma estrutura
```

### Uso em Componentes

```tsx
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div>
      <h1>{t.home.hero.title}</h1>
      <p>{t.common.nav.contact}</p>
    </div>
  );
}
```

### Persistência

O idioma selecionado é salvo no `localStorage` (key: `locale`).

---

## Sistema de Landing Pages Dinâmicas

### Conceito

Landing pages customizáveis por segmento de mercado, configuradas via JSON.

### Segmentos Disponíveis

| Slug | Segmento |
|------|----------|
| `agronegocio` | Agronegócio |
| `automoveis` | Automóveis |
| `restaurantes` | Restaurantes |
| `saude` | Saúde |
| `varejo` | Varejo |
| `setores` | Setores |

### Estrutura do JSON

```json
{
  "slug": "agronegocio",
  "theme": {
    "mode": "dark",
    "accentColor": "#BD9657"
  },
  "content": {
    "pt": {
      "seo": {
        "title": "...",
        "description": "...",
        "keywords": ["..."]
      },
      "hero": {
        "title": "...",
        "description": "...",
        "ctaText": "...",
        "ctaLink": "...",
        "backgroundType": "video",
        "backgroundVideos": ["..."]
      },
      "sections": [
        { "type": "textImage", ... },
        { "type": "carouselCards", ... },
        { "type": "servicesTabs", ... },
        { "type": "faq", ... },
        { "type": "cta", ... }
      ]
    },
    "en": { ... },
    "es": { ... }
  }
}
```

### Tipos de Seções

| Tipo | Descrição |
|------|-----------|
| `hero` | Banner inicial com CTA |
| `textImage` | Texto + imagem lado a lado |
| `carouselCards` | Carrossel de cards |
| `servicesTabs` | Abas de serviços com logo |
| `faq` | Perguntas frequentes |
| `cta` | Formulário de contato |

### Componentes LP

```
src/components/lp/
├── LPContent.tsx          # Wrapper principal (seleciona idioma)
└── sections/
    ├── LPHero.tsx         # Hero customizável
    ├── LPTextImage.tsx    # Seção texto + imagem
    ├── LPCarouselCards.tsx # Carrossel dinâmico
    ├── LPServicesTabs.tsx # Abas de serviços
    ├── LPFAQ.tsx          # FAQ customizável
    ├── LPCTA.tsx          # CTA com formulário
    └── LPFixedSections.tsx # Seções fixas (Blog + Footer)
```

---

## Área Administrativa

### Funcionalidades

#### Dashboard (`/admin`)
- Estatísticas gerais
- Acesso rápido às funcionalidades

#### Gerenciador de Notícias (`/admin/noticias`)
- CRUD completo
- Editor de texto rico (TipTap)
- Múltiplas categorias
- Publicação em 3 idiomas
- Upload de imagens (capa + banner)
- Status (rascunho/publicado)

#### Gerenciador de Segmentos (`/admin/segmentos`)
- CRUD de segmentos
- Upload de imagens e vídeos
- Ordenação por drag & drop
- Ativação/desativação

#### Gerenciador de Depoimentos (`/admin/depoimentos`)
- CRUD com traduções
- Upload de avatar
- Tradução automática com IA

#### Gerenciador de Parceiros (`/admin/parceiros`)
- CRUD de parceiros/clientes
- Upload de logo
- Tipo (partner ou client)

#### Gerenciador de Usuários (`/admin/usuarios`) [DEV]
- CRUD de usuários admin
- Definição de roles
- Envio de credenciais por email

#### Logs de Auditoria (`/admin/logs`) [DEV]
- Visualização de todas as ações
- Filtros por ação, usuário, data

#### Editor de Textos (`/admin/textos`)
- Gerenciamento de conteúdo dinâmico
- Edição de traduções

---

## Segurança

### Middleware de Proteção

```typescript
// src/middleware.ts
- Valida token JWT para rotas /admin
- Protege rotas DEV-only
- Bloqueia scanners (sqlmap, nikto, nmap)
- Previne path traversal
- Limita query strings (máx 2048 chars)
```

### Headers de Segurança (next.config.js)

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: [restritiva]
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Validação

- Zod para validação de inputs
- Verificação de email/senha
- Validação de uploads (tipos e tamanhos)

---

## Variáveis de Ambiente

### Obrigatórias

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AUTH_SECRET=
NEXTAUTH_SECRET=
```

### Opcionais

```env
GOOGLE_API_KEY=          # Para IA/Tradução
RESEND_API_KEY=          # Para email (Resend)
NODEMAILER_USER=         # Para email (SMTP)
NODEMAILER_PASSWORD=
```

---

## Comandos de Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build de produção
npm run build

# Rodar produção
npm run start

# Lint
npm run lint
```

---

## Mapeamento de Componentes

### Layout

| Componente | Localização | Descrição |
|------------|-------------|-----------|
| Header | `components/layout/Header.tsx` | Navegação principal |
| Footer | `components/sections/Footer.tsx` | Rodapé |
| MainLayout | `components/layout/MainLayout.tsx` | Wrapper do layout |

### Seções

| Componente | Descrição |
|------------|-----------|
| HeroSection | Banner inicial com vídeo/imagem |
| AboutSection | Seção sobre a empresa |
| SegmentsSection | Grid de segmentos |
| CoverageMapSection | Mapa de cobertura |
| FAQSection | Perguntas frequentes |

### Carrosséis

| Componente | Descrição |
|------------|-----------|
| SegmentsCarousel | Carrossel de segmentos |
| ClientsCarousel | Logos de clientes |
| PartnersCarousel | Logos de parceiros |
| TestimonialsCarousel | Depoimentos |
| BlogSection | Cards de notícias |

### 3D

| Componente | Descrição |
|------------|-----------|
| Logo3D | Logo animado em 3D |
| Office3D | Escritório 3D |
| ServiceModel3D | Modelo de serviço |

---

## Fluxo de Publicação

### Notícias

1. Criar notícia em `/admin/noticias/nova`
2. Preencher título, conteúdo em PT
3. Traduzir para EN/ES (manual ou IA)
4. Adicionar imagens (capa + banner)
5. Selecionar categoria
6. Salvar como rascunho ou publicar

### Landing Pages

1. Editar JSON em `src/data/lp/[slug].json`
2. Configurar tema (cores)
3. Adicionar conteúdo em PT
4. Traduzir para EN/ES
5. Configurar seções desejadas
6. Testar em `/segmentos/[slug]`

---

## Suporte e Manutenção

### Logs de Auditoria

Todas as ações administrativas são registradas:
- Login/Logout
- Criação de conteúdo
- Edição de conteúdo
- Exclusão de conteúdo

### Monitoramento

- Logs disponíveis em `/admin/logs` (apenas DEV)
- Filtros por ação, usuário e período

---

## Contato

Para dúvidas sobre o projeto, consulte esta documentação ou entre em contato com a equipe de desenvolvimento.
