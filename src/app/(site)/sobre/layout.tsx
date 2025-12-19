import { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://malaquiascontabilidade.com.br';

export const metadata: Metadata = {
  title: 'Sobre Nós | Malaquias Contabilidade',
  description: 'Conheça a história da Malaquias Contabilidade. Mais de 20 anos de experiência em planejamento tributário, gestão empresarial e consultoria contábil.',
  openGraph: {
    title: 'Sobre Nós | Malaquias Contabilidade',
    description: 'Conheça a história da Malaquias Contabilidade. Mais de 20 anos de experiência em planejamento tributário e gestão empresarial.',
    type: 'website',
    images: [{ url: `${BASE_URL}/images/og-image.jpg`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [`${BASE_URL}/images/og-image.jpg`],
  },
};

export default function SobreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
