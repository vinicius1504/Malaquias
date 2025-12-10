'use client';

import { ReactNode, Suspense, lazy } from 'react';
import dynamic from 'next/dynamic';
import Header from './Header';

// Lazy loading dos componentes pesados
const StarfieldCanvas = lazy(() => import('../ui/StarfieldCanvas'));

const ScrollingLogo3D = dynamic(() => import('../three/ScrollingLogo3D'), {
  ssr: false,
  loading: () => null,
});

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Fundo de galaxia - fixed, cobre toda a tela */}
      <div className="fixed inset-0 z-0 bg-[#0a0a14]">
        <Suspense fallback={<div className="w-full h-full bg-[#0a0a14]" />}>
          <StarfieldCanvas />
        </Suspense>
      </div>

      {/* Logo 3D global que segue o scroll */}
      <ScrollingLogo3D />

      {/* Header com z-index alto */}
      <Header />

      {/* Conteudo principal - acima da logo 3D */}
      <main className="flex-1 relative z-10">{children}</main>
    </div>
  );
}
