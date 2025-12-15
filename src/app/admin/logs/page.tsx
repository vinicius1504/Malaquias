'use client'

import { useState, useEffect } from 'react'
import {
  History,
  Filter,
  Loader2,
  User,
  LogIn,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Users,
  Newspaper,
  Settings,
} from 'lucide-react'

interface AuditLog {
  id: string
  user_id: string | null
  action: 'create' | 'update' | 'delete' | 'login' | 'logout'
  entity: string
  entity_id: string | null
  old_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
  admin_users: {
    id: string
    name: string
    email: string
  } | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const ACTION_CONFIG: Record<string, { label: string; icon: typeof Plus; color: string }> = {
  create: { label: 'Criação', icon: Plus, color: 'bg-green-100 text-green-700' },
  update: { label: 'Atualização', icon: Pencil, color: 'bg-blue-100 text-blue-700' },
  delete: { label: 'Exclusão', icon: Trash2, color: 'bg-red-100 text-red-700' },
  login: { label: 'Login', icon: LogIn, color: 'bg-purple-100 text-purple-700' },
  logout: { label: 'Logout', icon: LogOut, color: 'bg-gray-100 text-gray-700' },
}

const ENTITY_CONFIG: Record<string, { label: string; icon: typeof FileText }> = {
  admin_users: { label: 'Usuários', icon: Users },
  news: { label: 'Notícias', icon: Newspaper },
  content: { label: 'Textos', icon: FileText },
  news_categories: { label: 'Categorias', icon: Settings },
}

export default function LogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [filters, setFilters] = useState({
    action: '',
    entity: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  useEffect(() => {
    fetchLogs()
  }, [pagination.page, filters])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (filters.action) params.append('action', filters.action)
      if (filters.entity) params.append('entity', filters.entity)

      const response = await fetch(`/api/admin/logs?${params}`)
      const data = await response.json()

      if (response.ok) {
        setLogs(data.logs)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Erro ao buscar logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Agora'
    if (minutes < 60) return `${minutes}min atrás`
    if (hours < 24) return `${hours}h atrás`
    if (days < 7) return `${days}d atrás`
    return formatDate(dateString)
  }

  const getActionConfig = (action: string) => {
    return ACTION_CONFIG[action] || { label: action, icon: History, color: 'bg-gray-100 text-gray-700' }
  }

  const getEntityConfig = (entity: string) => {
    return ENTITY_CONFIG[entity] || { label: entity, icon: FileText }
  }

  const renderJsonDiff = (oldVal: Record<string, unknown> | null, newVal: Record<string, unknown> | null) => {
    if (!oldVal && !newVal) return null

    const allKeys = new Set([
      ...(oldVal ? Object.keys(oldVal) : []),
      ...(newVal ? Object.keys(newVal) : []),
    ])

    return (
      <div className="mt-3 space-y-2 text-sm">
        {Array.from(allKeys).map((key) => {
          const oldValue = oldVal?.[key]
          const newValue = newVal?.[key]
          const changed = JSON.stringify(oldValue) !== JSON.stringify(newValue)

          if (!changed && !oldValue && !newValue) return null

          return (
            <div key={key} className="flex items-start gap-2">
              <span className="font-medium text-gray-600 min-w-[100px]">{key}:</span>
              <div className="flex-1">
                {oldValue !== undefined && newValue !== undefined && changed ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-red-600 line-through bg-red-50 px-1 rounded">
                      {typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue)}
                    </span>
                    <span className="text-green-600 bg-green-50 px-1 rounded">
                      {typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue)}
                    </span>
                  </div>
                ) : oldValue !== undefined ? (
                  <span className="text-red-600 bg-red-50 px-1 rounded">
                    {typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue)}
                  </span>
                ) : newValue !== undefined ? (
                  <span className="text-green-600 bg-green-50 px-1 rounded">
                    {typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue)}
                  </span>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logs de Auditoria</h1>
          <p className="text-gray-500 mt-1">Acompanhe todas as ações realizadas no sistema</p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            showFilters || filters.action || filters.entity
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter className="w-5 h-5" />
          Filtros
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ação</label>
              <select
                value={filters.action}
                onChange={(e) => {
                  setFilters({ ...filters, action: e.target.value })
                  setPagination({ ...pagination, page: 1 })
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-black"
              >
                <option value="">Todas as ações</option>
                <option value="create">Criação</option>
                <option value="update">Atualização</option>
                <option value="delete">Exclusão</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Entidade</label>
              <select
                value={filters.entity}
                onChange={(e) => {
                  setFilters({ ...filters, entity: e.target.value })
                  setPagination({ ...pagination, page: 1 })
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-black"
              >
                <option value="">Todas as entidades</option>
                <option value="admin_users">Usuários</option>
                <option value="news">Notícias</option>
                <option value="content">Textos</option>
                <option value="news_categories">Categorias</option>
              </select>
            </div>

            {(filters.action || filters.entity) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ action: '', entity: '' })
                    setPagination({ ...pagination, page: 1 })
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logs List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum log encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map((log) => {
              const actionConfig = getActionConfig(log.action)
              const entityConfig = getEntityConfig(log.entity)
              const ActionIcon = actionConfig.icon
              const EntityIcon = entityConfig.icon
              const isExpanded = expandedLog === log.id

              return (
                <div
                  key={log.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Action Icon */}
                    <div className={`p-2 rounded-lg ${actionConfig.color}`}>
                      <ActionIcon className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${actionConfig.color}`}>
                          {actionConfig.label}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-gray-600">
                          <EntityIcon className="w-3 h-3" />
                          {entityConfig.label}
                        </span>
                        {log.entity_id && (
                          <span className="text-xs text-gray-400 font-mono">
                            #{log.entity_id.slice(0, 8)}
                          </span>
                        )}
                      </div>

                      {/* User info */}
                      <div className="flex items-center gap-2 mt-1 text-sm">
                        {log.admin_users ? (
                          <span className="flex items-center gap-1 text-gray-700">
                            <User className="w-3 h-3" />
                            {log.admin_users.name}
                          </span>
                        ) : (
                          <span className="text-gray-400">Sistema</span>
                        )}
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(log.created_at)}
                        </span>
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-2">
                            {formatDate(log.created_at)}
                            {log.ip_address && ` • IP: ${log.ip_address}`}
                          </div>

                          {(log.old_value || log.new_value) && (
                            <div className="border-t border-gray-200 pt-2 mt-2">
                              <span className="text-xs font-medium text-gray-600">Alterações:</span>
                              {renderJsonDiff(log.old_value, log.new_value)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Expand indicator */}
                    <ChevronRight
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <span className="text-sm text-gray-500">
            Mostrando {logs.length} de {pagination.total} registros
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="px-3 py-1 text-sm text-gray-700">
              Página {pagination.page} de {pagination.totalPages}
            </span>

            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
