import { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://malaquiascontabilidade.com.br';

export const metadata: Metadata = {
  title: 'Notícias e Blog | Malaquias Contabilidade',
  description: 'Fique por dentro das últimas novidades em contabilidade, tributação, gestão empresarial e dicas para o seu negócio.',
  openGraph: {
    title: 'Notícias e Blog | Malaquias Contabilidade',
    description: 'Fique por dentro das últimas novidades em contabilidade, tributação e gestão empresarial.',
    type: 'website',
    images: [{ url: `${BASE_URL}/images/og-image.jpg`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [`${BASE_URL}/images/og-image.jpg`],
  },
};

export default function NoticiasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
