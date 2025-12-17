'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Database,
} from 'lucide-react'
import { CategoryModal } from '@/components/admin/CategoryModal'
import { useConfirm } from '@/components/admin/ConfirmDialog'
import toast from 'react-hot-toast'

interface NewsTranslation {
  id: string
  locale: string
  title: string
  excerpt: string
}

interface Category {
  id: string
  slug: string
  name_pt: string
  name_en: string | null
  name_es: string | null
  color: string
}

interface NewsItem {
  id: string
  slug: string
  status: 'draft' | 'published'
  category_id: string | null
  image_url: string | null
  created_at: string
  published_at: string | null
  news_translations: NewsTranslation[]
  news_categories: Category | null
}

const statusOptions = [
  { value: '', label: 'Todos status' },
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicado' },
]

export default function NewsListPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [migrating, setMigrating] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [migrationResult, setMigrationResult] = useState<{
    success: string[]
    errors: string[]
    skipped: string[]
  } | null>(null)
  const confirm = useConfirm()

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchNews()
  }, [statusFilter, categoryFilter])

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const response = await fetch('/api/admin/categories')
      const data = await response.json()

      if (response.ok && data.categories) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchNews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (categoryFilter) params.append('category_id', categoryFilter)

      const response = await fetch(`/api/admin/news?${params}`)
      const data = await response.json()

      if (response.ok) {
        setNews(data.news || [])
      }
    } catch (error) {
      console.error('Erro ao buscar notícias:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Excluir notícia',
      message: 'Tem certeza que deseja excluir esta notícia? Esta ação não pode ser desfeita.',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger',
    })

    if (!confirmed) return

    try {
      setDeleting(id)
      const response = await fetch(`/api/admin/news/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setNews(news.filter((n) => n.id !== id))
        toast.success('Notícia excluída com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir notícia')
    } finally {
      setDeleting(null)
    }
  }

  const handleMigrate = async () => {
    const confirmed = await confirm({
      title: 'Migrar notícias',
      message: 'Isso irá migrar as notícias do arquivo JSON para o banco de dados. Deseja continuar?',
      confirmText: 'Migrar',
      cancelText: 'Cancelar',
      type: 'warning',
    })

    if (!confirmed) return

    try {
      setMigrating(true)
      setMigrationResult(null)
      const response = await fetch('/api/admin/migrate-news', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setMigrationResult(data.results)
        fetchNews()
        toast.success('Migração concluída!')
      } else {
        toast.error(data.error || 'Erro na migração')
      }
    } catch (error) {
      console.error('Erro na migração:', error)
      toast.error('Erro ao executar migração')
    } finally {
      setMigrating(false)
    }
  }

  const getTranslation = (item: NewsItem) => {
    return item.news_translations?.find((t) => t.locale === 'pt') || item.news_translations?.[0]
  }

  const filteredNews = news.filter((item) => {
    const translation = getTranslation(item)
    if (!search) return true
    return (
      translation?.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.slug.toLowerCase().includes(search.toLowerCase())
    )
  })

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notícias</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie as notícias e artigos do blog
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {migrating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Database className="w-5 h-5" />
            )}
            Migrar JSON
          </button>
          <Link
            href="/admin/noticias/nova"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nova Notícia
          </Link>
        </div>
      </div>

      {/* Migration Result */}
      {migrationResult && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-800">Resultado da Migração</h3>
            <button
              onClick={() => setMigrationResult(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              &times;
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-700 font-medium">Sucesso: {migrationResult.success.length}</p>
              {migrationResult.success.length > 0 && (
                <ul className="text-green-600 text-xs mt-1">
                  {migrationResult.success.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-700 font-medium">Ignorados: {migrationResult.skipped.length}</p>
              {migrationResult.skipped.length > 0 && (
                <ul className="text-yellow-600 text-xs mt-1">
                  {migrationResult.skipped.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 font-medium">Erros: {migrationResult.errors.length}</p>
              {migrationResult.errors.length > 0 && (
                <ul className="text-red-600 text-xs mt-1">
                  {migrationResult.errors.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 appearance-none bg-white min-w-[160px]"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              disabled={loadingCategories}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 appearance-none bg-white min-w-[180px] disabled:bg-gray-100"
            >
              <option value="">Todas categorias</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name_pt}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Adicionar categoria"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* News Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhuma notícia encontrada</p>
            <Link
              href="/admin/noticias/nova"
              className="inline-flex items-center gap-2 mt-4 text-amber-600 hover:text-amber-700 font-medium"
            >
              <Plus className="w-5 h-5" />
              Criar primeira notícia
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Imagem
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredNews.map((item) => {
                  const translation = getTranslation(item)

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      {/* Image */}
                      <td className="px-4 py-3">
                        <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt={translation?.title || ''}
                              width={64}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Eye className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Title */}
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          <p className="font-medium text-gray-900 truncate">
                            {translation?.title || 'Sem título'}
                          </p>
                          <p className="text-sm text-gray-500 truncate mt-0.5">
                            /{item.slug}
                          </p>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        {item.news_categories ? (
                          <span
                            className="px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${item.news_categories.color}20`,
                              color: item.news_categories.color
                            }}
                          >
                            {item.news_categories.name_pt}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            item.status === 'published'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {item.status === 'published' ? 'Publicado' : 'Rascunho'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {formatDate(item.published_at || item.created_at)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/noticias/${item.id}`}
                            className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/noticias/${item.slug}`}
                            target="_blank"
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deleting === item.id}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Excluir"
                          >
                            {deleting === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSuccess={() => fetchCategories()}
      />
    </div>
  )
}
