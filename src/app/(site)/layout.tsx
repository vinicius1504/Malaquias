import { MainLayout } from '@/components/layout';
import { LanguageProvider } from '@/contexts/LanguageContext';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import InactivityPopup from '@/components/ui/InactivityPopup';
import { ToastProvider } from '@/components/admin/ToastProvider';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <ToastProvider />
      <MainLayout>{children}</MainLayout>
      <WhatsAppButton />
      <InactivityPopup />
    </LanguageProvider>
  );
}
