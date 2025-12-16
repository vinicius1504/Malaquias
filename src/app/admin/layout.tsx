import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { ToastProvider } from '@/components/admin/ToastProvider'

export const metadata = {
  title: 'Admin | Malaquias Contabilidade',
  description: 'Painel administrativo',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Se não estiver logado e não for a página de login, redireciona
  const isLoginPage = true // Será verificado no middleware

  if (!session && !isLoginPage) {
    redirect('/admin/login')
  }

  // Se estiver na página de login e já estiver logado, vai pro dashboard
  if (session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ToastProvider />
        <AdminSidebar user={session.user} />
        <div className="lg:pl-64">
          <AdminHeader user={session.user} />
          <main className="p-6">{children}</main>
        </div>
      </div>
    )
  }

  // Página de login (sem sidebar)
  return (
    <>
      <ToastProvider />
      {children}
    </>
  )
}
