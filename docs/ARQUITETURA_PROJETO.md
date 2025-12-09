# Arquitetura do Projeto - Site Malaquias Contabilidade

Este documento descreve como o projeto está organizado, com foco em:
- Reutilização de componentes
- Facilidade de manutenção
- Multi-idioma via JSON
- Preparação para integrações futuras (3D, CMS, editor de conteúdo)

---

## 1. Stack Tecnológica

| Tecnologia | Uso |
|------------|-----|
| **Next.js 14** | Framework React com App Router |
| **TypeScript** | Tipagem estática |
| **Tailwind CSS** | Estilização utility-first |
| **tailwind-merge** | Merge de classes Tailwind |
| **react-three-fiber** | Integração Three.js com React |
| **@react-three/drei** | Helpers para Three.js |

---

## 2. Estrutura de Pastas

```
malaquias/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Layout raiz (fonts, providers)
│   │   └── page.tsx            # Página inicial
│   │
│   ├── components/
│   │   ├── layout/             # Componentes de estrutura
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── sections/           # Seções da página
│   │   │   ├── HeroSection.tsx
│   │   │   ├── ServicesSection.tsx
│   │   │   ├── WhyMalaquiasSection.tsx
│   │   │   ├── SegmentsSection.tsx
│   │   │   ├── TestimonialsSection.tsx
│   │   │   ├── FaqSection.tsx
│   │   │   ├── ContactSection.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── ui/                 # Componentes reutilizáveis
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── SectionContainer.tsx
│   │   │   ├── SectionTitle.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── three/              # Componentes 3D
│   │       ├── ThreeCanvas.tsx
│   │       ├── GalaxyBackground.tsx
│   │       ├── Logo3D.tsx
│   │       └── index.ts
│   │
│   ├── hooks/                  # Custom hooks
│   │   ├── useI18n.ts          # Internacionalização
│   │   ├── useLanguage.tsx     # Provider de idioma
│   │   ├── useScrollSection.ts # Tracking de scroll
│   │   └── index.ts
│   │
│   ├── locales/                # Arquivos de tradução
│   │   ├── pt/
│   │   │   ├── common.json
│   │   │   ├── home.json
│   │   │   ├── services.json
│   │   │   └── faq.json
│   │   └── en/
│   │       ├── common.json
│   │       ├── home.json
│   │       ├── services.json
│   │       └── faq.json
│   │
│   ├── config/                 # Configurações
│   │   ├── site.config.ts      # Dados do site
│   │   ├── i18n.config.ts      # Config de idiomas
│   │   └── index.ts
│   │
│   ├── lib/                    # Utilitários
│   │   ├── utils.ts            # Funções helper
│   │   ├── formatters.ts       # Formatação de dados
│   │   ├── constants.ts        # Constantes globais
│   │   └── index.ts
│   │
│   ├── styles/                 # Estilos globais
│   │   └── globals.css
│   │
│   └── types/                  # Definições de tipos
│       └── index.ts
│
├── docs/                       # Documentação
│   └── ARQUITETURA_PROJETO.md
│
├── public/                     # Arquivos estáticos
│   ├── images/
│   └── fonts/
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── next.config.js
```

---

## 3. Responsabilidade de Cada Pasta

### `app/`
Ponto de entrada das rotas do Next.js (App Router).

- **layout.tsx**: Define o layout global (fontes, providers, MainLayout)
- **page.tsx**: Página inicial que monta as seções

```tsx
// Exemplo: app/page.tsx
import { HeroSection, ServicesSection, ... } from '@/components/sections';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      {/* ... */}
    </>
  );
}
```

### `components/layout/`
Componentes de estrutura da página:
- **MainLayout**: Wrapper com Header e Footer
- **Header**: Navegação, logo, troca de idioma
- **Footer**: Links, contato, redes sociais

### `components/sections/`
Cada seção é um componente isolado que:
- Usa componentes de `ui/` para estrutura
- Busca textos via `useI18n()`
- Não possui textos hardcoded

```tsx
// Exemplo: components/sections/HeroSection.tsx
export default function HeroSection() {
  const { t } = useI18n('home');

  return (
    <section>
      <h1>{t('hero.title')}</h1>
      {/* ... */}
    </section>
  );
}
```

### `components/ui/`
Componentes atômicos e reutilizáveis:
- **Button**: Botões com variantes (primary, outline, ghost)
- **Card**: Cards com variantes e slots
- **SectionContainer**: Wrapper de seção com padding/background
- **SectionTitle**: Título de seção com badge e subtítulo

### `components/three/`
Componentes 3D para react-three-fiber:
- **ThreeCanvas**: Wrapper do Canvas
- **GalaxyBackground**: Partículas de galáxia animadas
- **Logo3D**: Logo 3D com animações

### `hooks/`
Hooks reutilizáveis:
- **useI18n**: Lê traduções dos JSONs
- **useLanguage**: Gerencia idioma atual (Context + localStorage)
- **useScrollSection**: Track de scroll e seção ativa

### `locales/`
Arquivos JSON organizados por idioma e namespace:

```
locales/
├── pt/
│   ├── common.json    # Textos globais (nav, footer)
│   ├── home.json      # Textos da home
│   ├── services.json  # Textos de serviços
│   └── faq.json       # Perguntas frequentes
└── en/
    └── ...
```

### `config/`
Configurações centralizadas:
- **site.config.ts**: Nome, contatos, redes sociais, SEO
- **i18n.config.ts**: Idiomas suportados, idioma padrão

### `lib/`
Funções utilitárias:
- **utils.ts**: cn(), debounce(), throttle(), etc.
- **formatters.ts**: Formatação de moeda, data, telefone
- **constants.ts**: Breakpoints, z-index, IDs de seção

---

## 4. Sistema de Internacionalização (i18n)

### Como funciona
1. Textos ficam em arquivos JSON em `locales/`
2. `useI18n()` hook lê o idioma atual e retorna função `t()`
3. Componentes usam `t('key')` para buscar textos

### Adicionar novo idioma
1. Criar pasta em `locales/` (ex: `locales/es/`)
2. Copiar JSONs de outro idioma e traduzir
3. Adicionar idioma em `config/i18n.config.ts`:

```ts
export const locales = ['pt', 'en', 'es'] as const;
```

### Adicionar novas chaves
1. Adicionar chave nos JSONs de todos os idiomas
2. Usar `t('nova.chave')` no componente

```json
// locales/pt/home.json
{
  "nova": {
    "chave": "Texto em português"
  }
}
```

---

## 5. Componentes 3D

### Estrutura atual
Os componentes 3D estão preparados mas não integrados na página.

### Como integrar
1. Importe o ThreeCanvas e componentes 3D
2. Adicione como background ou elemento da página

```tsx
// Exemplo de uso futuro
import { ThreeCanvas, GalaxyBackground } from '@/components/three';

export default function HomePage() {
  return (
    <>
      {/* Background 3D fixo */}
      <div className="fixed inset-0 -z-10">
        <ThreeCanvas>
          <GalaxyBackground />
        </ThreeCanvas>
      </div>

      {/* Conteúdo */}
      <HeroSection />
      {/* ... */}
    </>
  );
}
```

### Customização
- **GalaxyBackground**: Props para cores, quantidade de partículas, velocidade
- **Logo3D**: Props para cor, posição, intensidade de float

---

## 6. Reutilização de Seções

### Em novas páginas
```tsx
// app/sobre/page.tsx
import { WhyMalaquiasSection, ContactSection } from '@/components/sections';

export default function SobrePage() {
  return (
    <>
      <WhyMalaquiasSection />
      <ContactSection />
    </>
  );
}
```

### Criando nova seção
1. Criar arquivo em `components/sections/`
2. Usar componentes de `ui/` para estrutura
3. Buscar textos via `useI18n()`
4. Adicionar textos nos JSONs de idioma
5. Exportar em `components/sections/index.ts`

---

## 7. Convenções de Código

### Nomenclatura
- **Componentes**: PascalCase (`HeroSection.tsx`)
- **Hooks**: camelCase com prefixo "use" (`useI18n.ts`)
- **Utilitários**: camelCase (`formatters.ts`)
- **Constantes**: SCREAMING_SNAKE_CASE

### Imports
Usar aliases configurados no tsconfig:
```tsx
import { Button } from '@/components/ui';
import { useI18n } from '@/hooks';
import { siteConfig } from '@/config';
```

### Estilização
1. Preferir classes Tailwind
2. Usar `twMerge` ou `cn()` para merge de classes
3. Componentes aceitam `className` para customização

---

## 8. Futuras Integrações

### CMS (ex: Sanity, Strapi)
- Mapear campos do CMS para props dos componentes
- Ou mapear para estrutura dos JSONs de idioma

### Editor de Conteúdo
- Criar API routes para salvar conteúdo
- Usar React Query ou SWR para cache

### Analytics
- Adicionar em `app/layout.tsx`
- Eventos podem ser disparados nos componentes

### Formulário de Contato
- Integrar com API (própria ou serviço como Resend)
- Adicionar validação com Zod
- Implementar loading states

---

## 9. Comandos

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar produção
npm start

# Lint
npm run lint
```

---

## 10. Próximos Passos Sugeridos

1. [ ] Integrar componentes 3D na página
2. [ ] Adicionar animações de entrada com Framer Motion
3. [ ] Implementar envio do formulário de contato
4. [ ] Configurar SEO por página
5. [ ] Adicionar mais idiomas conforme necessário
6. [ ] Integrar com CMS para gestão de conteúdo
7. [ ] Adicionar testes com Jest/Vitest
8. [ ] Configurar CI/CD (Vercel, GitHub Actions)
