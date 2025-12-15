import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
  FileText,
  Newspaper,
  Users,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const session = await auth()

  if (!session) {
    redirect('/admin/login')
  }

  const stats = [
    {
      label: 'Textos',
      value: '24',
      change: '3 idiomas',
      icon: FileText,
      href: '/admin/textos',
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Notícias',
      value: '12',
      change: '3 publicadas',
      icon: Newspaper,
      href: '/admin/noticias',
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Acessos Hoje',
      value: '156',
      change: '+12%',
      icon: TrendingUp,
      href: '#',
      color: 'from-purple-500 to-purple-600',
    },
    ...(session.user.role === 'dev'
      ? [
          {
            label: 'Usuários',
            value: '2',
            change: 'Ativos',
            icon: Users,
            href: '/admin/usuarios',
            color: 'from-amber-500 to-amber-600',
          },
        ]
      : []),
  ]

  const quickActions = [
    {
      label: 'Editar Textos',
      description: 'Alterar textos do site em todos os idiomas',
      href: '/admin/textos',
      icon: FileText,
    },
    {
      label: 'Nova Notícia',
      description: 'Criar uma nova publicação para o blog',
      href: '/admin/noticias/nova',
      icon: Newspaper,
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

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Atividade Recente
        </h3>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="divide-y divide-gray-100">
            {[
              {
                action: 'Login realizado',
                user: session.user.name,
                time: 'Agora',
              },
              {
                action: 'Sistema iniciado',
                user: 'Sistema',
                time: 'Hoje',
              },
            ].map((activity, i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.action}</p>
                  <p className="text-xs text-gray-500">por {activity.user}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
