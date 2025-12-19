import { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://malaquiascontabilidade.com.br';

export const metadata: Metadata = {
  title: 'Contato | Malaquias Contabilidade',
  description: 'Entre em contato com a Malaquias Contabilidade. Solicite um orçamento, tire dúvidas ou envie seu currículo. Atendimento especializado em Campo Grande-MS.',
  openGraph: {
    title: 'Contato | Malaquias Contabilidade',
    description: 'Entre em contato com a Malaquias Contabilidade. Solicite um orçamento, tire dúvidas ou envie seu currículo.',
    type: 'website',
    images: [{ url: `${BASE_URL}/images/og-image.jpg`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [`${BASE_URL}/images/og-image.jpg`],
  },
};

export default function ContatoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
