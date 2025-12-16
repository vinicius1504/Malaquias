import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
  FileText,
  Newspaper,
  Users,
  ArrowRight,
  MessageSquareQuote,
  Handshake,
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getStats() {
  // Buscar contagem de notícias
  const { count: totalNews } = await supabase
    .from('news')
    .select('*', { count: 'exact', head: true })

  const { count: publishedNews } = await supabase
    .from('news')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  // Buscar contagem de depoimentos
  const { count: totalTestimonials } = await supabase
    .from('testimonials')
    .select('*', { count: 'exact', head: true })

  const { count: activeTestimonials } = await supabase
    .from('testimonials')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // Buscar contagem de parceiros/clientes
  const { count: totalPartners } = await supabase
    .from('partners')
    .select('*', { count: 'exact', head: true })

  const { count: activePartners } = await supabase
    .from('partners')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // Buscar últimas notícias
  const { data: recentNews } = await supabase
    .from('news')
    .select('id, slug, is_published, created_at, updated_at, news_translations!inner(title, locale)')
    .eq('news_translations.locale', 'pt')
    .order('updated_at', { ascending: false })
    .limit(5)

  return {
    news: { total: totalNews || 0, published: publishedNews || 0 },
    testimonials: { total: totalTestimonials || 0, active: activeTestimonials || 0 },
    partners: { total: totalPartners || 0, active: activePartners || 0 },
    recentNews: recentNews?.map(n => ({
      id: n.id,
      slug: n.slug,
      title: Array.isArray(n.news_translations)
        ? n.news_translations[0]?.title
        : (n.news_translations as { title: string })?.title || 'Sem título',
      is_published: n.is_published,
      updated_at: n.updated_at,
    })) || [],
  }
}

export default async function AdminDashboard() {
  const session = await auth()

  if (!session) {
    redirect('/admin/login')
  }

  const data = await getStats()

  const stats = [
    {
      label: 'Notícias',
      value: String(data.news.total),
      change: `${data.news.published} publicadas`,
      icon: Newspaper,
      href: '/admin/noticias',
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Depoimentos',
      value: String(data.testimonials.total),
      change: `${data.testimonials.active} ativos`,
      icon: MessageSquareQuote,
      href: '/admin/depoimentos',
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Parceiros/Clientes',
      value: String(data.partners.total),
      change: `${data.partners.active} ativos`,
      icon: Handshake,
      href: '/admin/parceiros',
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Textos',
      value: '7',
      change: '3 idiomas',
      icon: FileText,
      href: '/admin/textos',
      color: 'from-amber-500 to-amber-600',
    },
    ...(['dev', 'admin'].includes(session.user.role)
      ? [
          {
            label: 'Usuários',
            value: '—',
            change: 'Gerenciar',
            icon: Users,
            href: '/admin/usuarios',
            color: 'from-gray-500 to-gray-600',
          },
        ]
      : []),
  ]

  const quickActions = [
    {
      label: 'Nova Notícia',
      description: 'Criar uma nova publicação para o blog',
      href: '/admin/noticias/nova',
      icon: Newspaper,
    },
    {
      label: 'Editar Textos',
      description: 'Alterar textos do site em todos os idiomas',
      href: '/admin/textos',
      icon: FileText,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          Bem-vindo, {session.user.name}!
        </h2>
        <p className="text-gray-600">
          Gerencie o conteúdo do site através do painel administrativo.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
                </div>
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.label}
                href={action.href}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-amber-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-amber-50 transition-colors">
                    <Icon className="w-6 h-6 text-gray-500 group-hover:text-amber-600 transition-colors" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 group-hover:text-amber-600 transition-colors">
                      {action.label}
                    </p>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent News */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Últimas Notícias
        </h3>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {data.recentNews.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Newspaper className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Nenhuma notícia cadastrada</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.recentNews.map((news) => (
                <Link
                  key={news.id}
                  href={`/admin/noticias/${news.id}`}
                  className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Newspaper className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{news.title}</p>
                    <p className="text-xs text-gray-500">
                      {news.is_published ? (
                        <span className="text-green-600">Publicada</span>
                      ) : (
                        <span className="text-amber-600">Rascunho</span>
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(news.updated_at).toLocaleDateString('pt-BR')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
