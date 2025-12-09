'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Header from './Header';
import StarfieldCanvas from '../ui/StarfieldCanvas';

// Carregamento dinamico do componente 3D para evitar erros de SSR
const ScrollingLogo3D = dynamic(() => import('../three/ScrollingLogo3D'), {
  ssr: false,
});

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Fundo de galaxia - fixed, cobre toda a tela */}
      <div className="fixed inset-0 z-0">
        <StarfieldCanvas />
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
