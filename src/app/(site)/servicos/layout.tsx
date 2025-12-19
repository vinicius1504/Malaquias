import { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://malaquiascontabilidade.com.br';

export const metadata: Metadata = {
  title: 'Serviços | Malaquias Contabilidade',
  description: 'Conheça nossos serviços de contabilidade empresarial, planejamento tributário, departamento pessoal, consultoria financeira e muito mais.',
  openGraph: {
    title: 'Serviços | Malaquias Contabilidade',
    description: 'Conheça nossos serviços de contabilidade empresarial, planejamento tributário e consultoria financeira.',
    type: 'website',
    images: [{ url: `${BASE_URL}/images/og-image.jpg`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [`${BASE_URL}/images/og-image.jpg`],
  },
};

export default function ServicosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
