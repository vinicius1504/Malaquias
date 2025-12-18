import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import LPContent from '@/components/lp/LPContent';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Função para carregar dados do JSON
async function getSegmentData(slug: string) {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'lp', `${slug}.json`);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch {
    return null;
  }
}

// Gerar metadata dinâmica para SEO (usa PT como padrão para metadata)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getSegmentData(slug);

  if (!data) {
    return {
      title: 'Segmento não encontrado',
    };
  }

  // Usa o conteúdo em PT para metadata (SEO padrão)
  const content = data.content?.pt || data;
  const seo = content.seo;

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: 'website',
    },
  };
}

// Gerar rotas estáticas baseadas nos JSONs existentes
export async function generateStaticParams() {
  const lpDir = path.join(process.cwd(), 'src', 'data', 'lp');

  try {
    const files = fs.readdirSync(lpDir);
    return files
      .filter((file) => file.endsWith('.json'))
      .map((file) => ({
        slug: file.replace('.json', ''),
      }));
  } catch {
    return [];
  }
}

export default async function SegmentPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getSegmentData(slug);

  if (!data) {
    notFound();
  }

  // Passa os dados completos para o componente cliente
  // que vai selecionar o idioma correto baseado no useLanguage
  return <LPContent data={data} />;
}
