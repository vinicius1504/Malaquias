import Script from 'next/script';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://malaquiascontabilidade.com.br';

// Schema para Organização/Empresa
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AccountingService',
    name: 'Malaquias Contabilidade',
    alternateName: 'Malaquias',
    url: BASE_URL,
    logo: `${BASE_URL}/images/logos/Logo preta.svg`,
    image: `${BASE_URL}/images/og-image.jpg`,
    description: 'Escritório de contabilidade especializado em planejamento tributário, gestão empresarial e consultoria contábil em Campo Grande-MS.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua Rui Barbosa, 1620 - Centro',
      addressLocality: 'Campo Grande',
      addressRegion: 'MS',
      postalCode: '79002-362',
      addressCountry: 'BR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -20.4697,
      longitude: -54.6201,
    },
    telephone: '+55-67-99661-7549',
    email: 'contato@malaquiascontabilidade.com.br',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
    ],
    priceRange: '$$',
    areaServed: {
      '@type': 'State',
      name: 'Mato Grosso do Sul',
    },
    sameAs: [
      'https://www.instagram.com/malaquiascontabilidade',
      'https://www.facebook.com/malaquiascontabilidade',
      'https://www.linkedin.com/company/malaquiascontabilidade',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Serviços Contábeis',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Contabilidade Empresarial',
            description: 'Escrituração contábil, balanços e demonstrações financeiras.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Planejamento Tributário',
            description: 'Estratégias para redução legal da carga tributária.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Departamento Pessoal',
            description: 'Folha de pagamento, admissões, demissões e obrigações trabalhistas.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Consultoria Financeira',
            description: 'Análise de indicadores, fluxo de caixa e gestão financeira.',
          },
        },
      ],
    },
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Schema para Website
export function WebsiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Malaquias Contabilidade',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/noticias?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Schema para Breadcrumb
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Schema para FAQPage
interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSchema({ items }: { items: FAQItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Schema para Artigo/Notícia
interface ArticleSchemaProps {
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  url: string;
}

export function ArticleSchema({
  title,
  description,
  image,
  datePublished,
  dateModified,
  author = 'Malaquias Contabilidade',
  url,
}: ArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: image || `${BASE_URL}/images/og-image.jpg`,
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Organization',
      name: author,
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Malaquias Contabilidade',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/images/logos/Logo preta.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return (
    <Script
      id="article-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Schema para Serviço
interface ServiceSchemaProps {
  name: string;
  description: string;
  url: string;
}

export function ServiceSchema({ name, description, url }: ServiceSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: name,
    description: description,
    provider: {
      '@type': 'AccountingService',
      name: 'Malaquias Contabilidade',
      url: BASE_URL,
    },
    areaServed: {
      '@type': 'State',
      name: 'Mato Grosso do Sul',
    },
    url: url,
  };

  return (
    <Script
      id="service-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
