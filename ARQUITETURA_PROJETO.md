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
