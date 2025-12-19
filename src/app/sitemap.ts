import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://malaquiascontabilidade.com.br';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/sobre`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contato`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/noticias`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ];

  // Landing pages dinâmicas (segmentos)
  const lpDir = path.join(process.cwd(), 'src', 'data', 'lp');
  let segmentPages: MetadataRoute.Sitemap = [];

  try {
    const files = fs.readdirSync(lpDir);
    segmentPages = files
      .filter((file) => file.endsWith('.json') && file !== 'setores.json')
      .map((file) => ({
        url: `${BASE_URL}/segmentos/${file.replace('.json', '')}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }));
  } catch {
    console.error('Erro ao ler diretório de LPs para sitemap');
  }

  // Serviços estáticos
  const servicesSlugs = [
    'contabilidade-empresarial',
    'planejamento-tributario',
    'departamento-pessoal',
    'consultoria-financeira',
    'abertura-de-empresas',
    'auditoria',
  ];

  const servicePages: MetadataRoute.Sitemap = servicesSlugs.map((slug) => ({
    url: `${BASE_URL}/servicos/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...segmentPages, ...servicePages];
}
