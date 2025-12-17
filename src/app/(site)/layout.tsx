import { MainLayout } from '@/components/layout';
import { LanguageProvider } from '@/contexts/LanguageContext';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <MainLayout>{children}</MainLayout>
      <WhatsAppButton />
    </LanguageProvider>
  );
}
