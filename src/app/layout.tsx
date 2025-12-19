import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import '@/styles/globals.css';
import { Analytics, GoogleTagManagerBody } from '@/components/analytics';
import { OrganizationSchema, WebsiteSchema } from '@/components/seo/JsonLd';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://malaquiascontabilidade.com.br';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Malaquias Contabilidade | Planejamento Tributário e Gestão Empresarial',
  description: 'A Malaquias Contabilidade combina planejamento tributário, tecnologia e dashboards em Power BI para transformar contabilidade em gestão real do seu negócio.',

  // Favicon / Ícone do navegador
  icons: {
    icon: '/images/logos/Vector.svg',
    shortcut: '/images/logos/Vector.svg',
    apple: '/images/logos/Vector.svg',
  },

  // Meta tags de segurança e SEO
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Previne que números de telefone sejam detectados automaticamente
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  // Open Graph para compartilhamento seguro
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: BASE_URL,
    siteName: 'Malaquias Contabilidade',
    title: 'Malaquias Contabilidade | Planejamento Tributário e Gestão Empresarial',
    description: 'A Malaquias Contabilidade combina planejamento tributário, tecnologia e dashboards em Power BI para transformar contabilidade em gestão real do seu negócio.',
    images: [
      {
        url: `${BASE_URL}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Malaquias Contabilidade - Planejamento Tributário e Gestão Empresarial',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Malaquias Contabilidade | Planejamento Tributário e Gestão Empresarial',
    description: 'A Malaquias Contabilidade combina planejamento tributário, tecnologia e dashboards em Power BI para transformar contabilidade em gestão real do seu negócio.',
    images: [`${BASE_URL}/images/og-image.jpg`],
  },

  // Outras configurações de segurança
  other: {
    'msapplication-TileColor': '#1a1a2e',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <Analytics />
        <OrganizationSchema />
        <WebsiteSchema />
      </head>
      <body className="font-sans">
        <GoogleTagManagerBody />
        {children}
      </body>
    </html>
  );
}
