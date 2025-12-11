'use client';

import { useParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import ServicePageContent from '@/components/pages/ServicePageContent';

export default function ServicePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { t } = useLanguage();

  // Busca o serviço pelo slug no idioma atual
  const service = t.servicesPages.services.find((s) => s.slug === slug);

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Serviço não encontrado</p>
      </div>
    );
  }

  return (
    <ServicePageContent
      title={service.title}
      subtitle={service.subtitle}
      checklist={service.checklist}
      model3DPath={service.model3D}
      icon={service.icon}
    />
  );
}
