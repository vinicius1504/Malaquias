'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import {
  Menu,
  LogOut,
  User,
  ChevronDown,
  Bell,
  Plus,
  Pencil,
  Trash2,
  LogIn,
  History,
  Clock,
} from 'lucide-react'
import type { UserRole } from '@/types/database'

interface AdminHeaderProps {
  user: {
    name: string
    email: string
    role: UserRole
  }
}

interface Notification {
  id: string
  action: 'create' | 'update' | 'delete' | 'login' | 'logout'
  entity: string
  entity_id: string | null
  created_at: string
  admin_users: {
    id: string
    name: string
    email: string
  } | null
}

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/textos': 'Gerenciar Textos',
  '/admin/noticias': 'Notícias',
  '/admin/noticias/nova': 'Nova Notícia',
  '/admin/usuarios': 'Usuários',
  '/admin/logs': 'Logs de Auditoria',
  '/admin/config': 'Configurações',
}

const ACTION_CONFIG: Record<string, { label: string; icon: typeof Plus; color: string }> = {
  create: { label: 'criou', icon: Plus, color: 'text-green-600' },
  update: { label: 'atualizou', icon: Pencil, color: 'text-blue-600' },
  delete: { label: 'excluiu', icon: Trash2, color: 'text-red-600' },
  login: { label: 'entrou', icon: LogIn, color: 'text-purple-600' },
  logout: { label: 'saiu', icon: LogOut, color: 'text-gray-600' },
}

const ENTITY_LABELS: Record<string, string> = {
  admin_users: 'usuário',
  news: 'notícia',
  content: 'texto',
  news_categories: 'categoria',
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastSeen, setLastSeen] = useState<string | null>(null)

  // Proteção caso user.role seja undefined
  const userRole = user?.role || 'admin'
  const isDev = userRole === 'dev'
  const pageTitle = pageTitles[pathname] || 'Admin'

  // Carregar lastSeen do localStorage
  useEffect(() => {
    if (isDev) {
      const saved = localStorage.getItem('notifications_last_seen')
      setLastSeen(saved)
    }
  }, [isDev])

  // Buscar notificações periodicamente (apenas para devs)
  useEffect(() => {
    if (!isDev) return

    const fetchNotifications = async () => {
      try {
        const params = new URLSearchParams()
        if (lastSeen) {
          params.append('last_seen', lastSeen)
        }

        const response = await fetch(`/api/admin/notifications?${params}`)
        const data = await response.json()

        if (response.ok) {
          setNotifications(data.notifications || [])
          setUnreadCount(data.unreadCount || 0)
        }
      } catch (error) {
        console.error('Erro ao buscar notificações:', error)
      }
    }

    fetchNotifications()

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [isDev, lastSeen])

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' })
  }

  const handleOpenNotifications = () => {
    setShowNotifications(!showNotifications)
    if (!showNotifications) {
      // Marcar como visto
      const now = new Date().toISOString()
      localStorage.setItem('notifications_last_seen', now)
      setLastSeen(now)
      setUnreadCount(0)
    }
  }

  const handleViewAllLogs = () => {
    setShowNotifications(false)
    router.push('/admin/logs')
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Agora'
    if (minutes < 60) return `${minutes}min`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Left - Mobile Menu & Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications - Apenas para devs */}
          {isDev && (
            <div className="relative">
              <button
                onClick={handleOpenNotifications}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">Notificações</h3>
                      <span className="text-xs text-gray-500">Últimas 24h</span>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          Nenhuma notificação recente
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {notifications.map((notif) => {
                            const actionConfig = ACTION_CONFIG[notif.action] || { label: notif.action, icon: History, color: 'text-gray-600' }
                            const ActionIcon = actionConfig.icon
                            const entityLabel = ENTITY_LABELS[notif.entity] || notif.entity

                            return (
                              <div
                                key={notif.id}
                                className="px-4 py-3 hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`p-1.5 rounded-full bg-gray-100 ${actionConfig.color}`}>
                                    <ActionIcon className="w-3 h-3" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-800">
                                      <span className="font-medium">
                                        {notif.admin_users?.name || 'Sistema'}
                                      </span>
                                      {' '}
                                      <span className={actionConfig.color}>{actionConfig.label}</span>
                                      {' '}
                                      {entityLabel}
                                    </p>
                                    <span className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                      <Clock className="w-3 h-3" />
                                      {formatRelativeTime(notif.created_at)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                      <button
                        onClick={handleViewAllLogs}
                        className="w-full text-center text-sm text-amber-600 hover:text-amber-700 font-medium"
                      >
                        Ver todos os logs
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <span className="text-white font-semibold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {user.name}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      Meu Perfil
                    </button>
                  </div>

                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
