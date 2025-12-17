'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft,
  Save,
  Send,
  Upload,
  X,
  Loader2,
  ImageIcon,
  Plus,
  Languages,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { RichTextEditor } from '@/components/admin/Editor'
import { CategoryModal } from '@/components/admin/CategoryModal'
import toast from 'react-hot-toast'

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

export default function NewNewsPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [translating, setTranslating] = useState<Locale | null>(null)

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
  const [status, setStatus] = useState<'draft' | 'published'>('draft')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const response = await fetch('/api/admin/categories')
      const data = await response.json()

      if (response.ok && data.categories) {
        setCategories(data.categories)
        if (data.categories.length > 0 && !categoryId) {
          setCategoryId(data.categories[0].id)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  // Generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (value: string) => {
    setTranslations(prev => ({
      ...prev,
      [activeLocale]: { ...prev[activeLocale], title: value }
    }))
    // Generate slug from PT title
    if (activeLocale === 'pt' && (!slug || slug === generateSlug(translations.pt.title))) {
      setSlug(generateSlug(value))
    }
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

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      setUploading(true)
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
      setUploading(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        handleImageUpload(file)
      }
    },
    [handleImageUpload]
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

    if (!categoryId) {
      toast.error('Selecione uma categoria')
      return
    }

    try {
      setSaving(true)

      const response = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          translations,
          slug,
          category_id: categoryId,
          image_url: imageUrl,
          status: publishNow ? 'published' : status,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(publishNow ? 'Notícia publicada!' : 'Rascunho salvo!')
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

  const handleCategoryCreated = () => {
    fetchCategories()
  }

  const currentTranslation = translations[activeLocale]

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
            <h1 className="text-xl font-bold text-gray-800">Nova Notícia</h1>
            <p className="text-sm text-gray-500">
              Crie uma nova publicação para o blog
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
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
            Salvar Rascunho
          </button>
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

              {/* Auto-translate buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTranslate('en')}
                  disabled={translating !== null}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  {translating === 'en' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  🇺🇸 Traduzir EN
                </button>
                <button
                  onClick={() => handleTranslate('es')}
                  disabled={translating !== null}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50"
                >
                  {translating === 'es' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  🇪🇸 Traduzir ES
                </button>
              </div>
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
            <div className="flex items-center gap-2">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={loadingCategories}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-white disabled:bg-gray-100"
              >
                {loadingCategories ? (
                  <option>Carregando...</option>
                ) : categories.length === 0 ? (
                  <option value="">Nenhuma categoria</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name_pt}
                    </option>
                  ))
                )}
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

          {/* Featured Image */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem de Capa
            </label>

            {imageUrl ? (
              <div className="relative rounded-lg overflow-hidden">
                <Image
                  src={imageUrl}
                  alt="Capa"
                  width={300}
                  height={200}
                  className="w-full h-40 object-cover"
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
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-amber-500 transition-colors cursor-pointer"
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    <p className="text-sm text-gray-500">Enviando...</p>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-2">
                      Arraste uma imagem ou
                    </p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      Escolher arquivo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file)
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

      {/* Category Modal */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSuccess={handleCategoryCreated}
      />
    </div>
  )
}
