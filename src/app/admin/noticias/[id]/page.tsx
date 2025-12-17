'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft,
  Save,
  Send,
  Upload,
  X,
  Loader2,
  ImageIcon,
  Trash2,
  Languages,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { RichTextEditor } from '@/components/admin/Editor'
import toast from 'react-hot-toast'
import { useConfirm } from '@/components/admin/ConfirmDialog'

type Locale = 'pt' | 'en' | 'es'

interface TranslationContent {
  title: string
  excerpt: string
  content: string
}

interface Category {
  id: string
  slug: string
  name_pt: string
  name_en: string | null
  name_es: string | null
  color: string
}

const LOCALE_LABELS: Record<Locale, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
}

const LOCALE_FLAGS: Record<Locale, string> = {
  pt: '🇧🇷',
  en: '🇺🇸',
  es: '🇪🇸',
}

export default function EditNewsPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploadingCard, setUploadingCard] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [translating, setTranslating] = useState<Locale | null>(null)
  const confirm = useConfirm()

  // Active locale for editing
  const [activeLocale, setActiveLocale] = useState<Locale>('pt')

  // Translations state
  const [translations, setTranslations] = useState<Record<Locale, TranslationContent>>({
    pt: { title: '', excerpt: '', content: '' },
    en: { title: '', excerpt: '', content: '' },
    es: { title: '', excerpt: '', content: '' },
  })

  // Common fields
  const [slug, setSlug] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageBanner, setImageBanner] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')

  useEffect(() => {
    fetchCategories()
    fetchNews()
  }, [id])

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
      const response = await fetch(`/api/admin/news/${id}`)
      const data = await response.json()

      if (response.ok && data.news) {
        const news = data.news

        // Load translations
        const newTranslations: Record<Locale, TranslationContent> = {
          pt: { title: '', excerpt: '', content: '' },
          en: { title: '', excerpt: '', content: '' },
          es: { title: '', excerpt: '', content: '' },
        }

        if (news.news_translations) {
          news.news_translations.forEach((t: { locale: Locale; title: string; excerpt: string; content: string }) => {
            if (newTranslations[t.locale]) {
              newTranslations[t.locale] = {
                title: t.title || '',
                excerpt: t.excerpt || '',
                content: t.content || '',
              }
            }
          })
        }

        setTranslations(newTranslations)
        setSlug(news.slug || '')
        setCategoryId(news.category_id || '')
        setImageUrl(news.image_url || '')
        setImageBanner(news.image_banner || '')
        setStatus(news.status || 'draft')
      }
    } catch (error) {
      console.error('Erro ao buscar notícia:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTitleChange = (value: string) => {
    setTranslations(prev => ({
      ...prev,
      [activeLocale]: { ...prev[activeLocale], title: value }
    }))
  }

  const handleExcerptChange = (value: string) => {
    setTranslations(prev => ({
      ...prev,
      [activeLocale]: { ...prev[activeLocale], excerpt: value }
    }))
  }

  const handleContentChange = (value: string) => {
    setTranslations(prev => ({
      ...prev,
      [activeLocale]: { ...prev[activeLocale], content: value }
    }))
  }

  const handleTranslate = async (targetLocale: Locale) => {
    const sourceContent = translations.pt
    if (!sourceContent.title && !sourceContent.excerpt && !sourceContent.content) {
      toast.error('Preencha o conteúdo em Português primeiro')
      return
    }

    try {
      setTranslating(targetLocale)
      const response = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: sourceContent.title,
          excerpt: sourceContent.excerpt,
          content: sourceContent.content,
          sourceLocale: 'pt',
          targetLocale,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setTranslations(prev => ({
          ...prev,
          [targetLocale]: {
            title: data.title || '',
            excerpt: data.excerpt || '',
            content: data.content || '',
          }
        }))
        setActiveLocale(targetLocale)
        toast.success('Tradução concluída!')
      } else {
        toast.error(data.error || 'Erro ao traduzir')
      }
    } catch (error) {
      console.error('Erro ao traduzir:', error)
      toast.error('Erro ao traduzir. Tente novamente.')
    } finally {
      setTranslating(null)
    }
  }

  const handleCardImageUpload = useCallback(async (file: File) => {
    try {
      setUploadingCard(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setImageUrl(data.url)
      } else {
        toast.error(data.error || 'Erro no upload')
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error('Erro ao fazer upload da imagem')
    } finally {
      setUploadingCard(false)
    }
  }, [])

  const handleBannerImageUpload = useCallback(async (file: File) => {
    try {
      setUploadingBanner(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setImageBanner(data.url)
      } else {
        toast.error(data.error || 'Erro no upload')
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error('Erro ao fazer upload da imagem')
    } finally {
      setUploadingBanner(false)
    }
  }, [])

  const handleCardDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        handleCardImageUpload(file)
      }
    },
    [handleCardImageUpload]
  )

  const handleBannerDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        handleBannerImageUpload(file)
      }
    },
    [handleBannerImageUpload]
  )

  const handleSave = async (publishNow = false) => {
    if (!translations.pt.title.trim()) {
      toast.error('O título em Português é obrigatório')
      return
    }

    if (!slug.trim()) {
      toast.error('O slug é obrigatório')
      return
    }

    try {
      setSaving(true)

      const response = await fetch(`/api/admin/news/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          translations,
          slug,
          category_id: categoryId,
          image_url: imageUrl,
          image_banner: imageBanner,
          status: publishNow ? 'published' : status,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Notícia salva com sucesso!')
        router.push('/admin/noticias')
      } else {
        toast.error(data.error || 'Erro ao salvar')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar notícia')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Excluir notícia',
      message: 'Tem certeza que deseja excluir esta notícia? Esta ação não pode ser desfeita.',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger',
    })

    if (!confirmed) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/admin/news/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Notícia excluída com sucesso!')
        router.push('/admin/noticias')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao excluir')
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir notícia')
    } finally {
      setDeleting(false)
    }
  }

  const currentTranslation = translations[activeLocale]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/noticias"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Editar Notícia</h1>
            <p className="text-sm text-gray-500">
              Atualize as informações da publicação
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Excluir
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Salvar
          </button>
          {status === 'draft' && (
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Publicar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Language Tabs */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">Idiomas</span>
              </div>

              {/* Auto-translate button - only for non-PT tabs */}
              {activeLocale !== 'pt' && (
                <button
                  onClick={() => handleTranslate(activeLocale)}
                  disabled={translating !== null}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {translating === activeLocale ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Traduzir para {LOCALE_LABELS[activeLocale]}
                </button>
              )}
            </div>

            {/* Locale tabs */}
            <div className="flex gap-2">
              {(['pt', 'en', 'es'] as Locale[]).map((locale) => {
                const hasContent = translations[locale].title || translations[locale].content
                return (
                  <button
                    key={locale}
                    onClick={() => setActiveLocale(locale)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeLocale === locale
                        ? 'bg-amber-500 text-white'
                        : hasContent
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{LOCALE_FLAGS[locale]}</span>
                    <span>{LOCALE_LABELS[locale]}</span>
                    {hasContent && activeLocale !== locale && (
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título ({LOCALE_LABELS[activeLocale]})
            </label>
            <input
              type="text"
              value={currentTranslation.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Digite o título da notícia"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-lg"
            />
          </div>

          {/* Excerpt */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resumo ({LOCALE_LABELS[activeLocale]})
            </label>
            <textarea
              value={currentTranslation.excerpt}
              onChange={(e) => handleExcerptChange(e.target.value)}
              placeholder="Um breve resumo da notícia para exibir na listagem..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none"
            />
          </div>

          {/* Content Editor */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conteúdo ({LOCALE_LABELS[activeLocale]})
            </label>
            <RichTextEditor
              content={currentTranslation.content}
              onChange={handleContentChange}
              placeholder="Escreva o conteúdo da notícia..."
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Status
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={() => setStatus('draft')}
                  className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                />
                <div>
                  <p className="font-medium text-gray-800">Rascunho</p>
                  <p className="text-xs text-gray-500">Não publicado</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={status === 'published'}
                  onChange={() => setStatus('published')}
                  className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                />
                <div>
                  <p className="font-medium text-gray-800">Publicado</p>
                  <p className="text-xs text-gray-500">Visível no site</p>
                </div>
              </label>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={loadingCategories}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-white disabled:bg-gray-100"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name_pt}
                </option>
              ))}
            </select>
          </div>

          {/* Slug */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL (slug)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">/noticias/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="url-da-noticia"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-sm"
              />
            </div>
          </div>

          {/* Card Image - Quadrada */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagem do Card (Quadrada)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Exibida na listagem de notícias
            </p>

            {imageUrl ? (
              <div className="relative rounded-lg overflow-hidden">
                <Image
                  src={imageUrl}
                  alt="Card"
                  width={200}
                  height={200}
                  className="w-full h-32 object-cover"
                />
                <button
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDrop={handleCardDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-amber-500 transition-colors cursor-pointer"
              >
                {uploadingCard ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                    <p className="text-sm text-gray-500">Enviando...</p>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 mb-2">
                      Arraste ou clique
                    </p>
                    <label className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-3 h-3" />
                      Escolher
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleCardImageUpload(file)
                        }}
                      />
                    </label>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Banner Image - Retangular */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagem do Banner (Retangular)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Exibida no topo da página da notícia
            </p>

            {imageBanner ? (
              <div className="relative rounded-lg overflow-hidden">
                <Image
                  src={imageBanner}
                  alt="Banner"
                  width={300}
                  height={150}
                  className="w-full h-24 object-cover"
                />
                <button
                  onClick={() => setImageBanner('')}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDrop={handleBannerDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-amber-500 transition-colors cursor-pointer"
              >
                {uploadingBanner ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                    <p className="text-sm text-gray-500">Enviando...</p>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 mb-2">
                      Arraste ou clique
                    </p>
                    <label className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-3 h-3" />
                      Escolher
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleBannerImageUpload(file)
                        }}
                      />
                    </label>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
