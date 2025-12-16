'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  MessageSquareQuote,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Check,
  X,
  Upload,
  ImageIcon,
  User,
  Languages,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'

type Locale = 'pt' | 'en' | 'es'

interface TranslationContent {
  role: string
  company: string
  content: string
}

interface TestimonialTranslation {
  id?: string
  testimonial_id?: string
  locale: Locale
  role: string
  company: string | null
  content: string
}

interface Testimonial {
  id: string
  name: string
  avatar_url: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
  testimonial_translations: TestimonialTranslation[]
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

export default function DepoimentosPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [translating, setTranslating] = useState<Locale | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Active locale for editing
  const [activeLocale, setActiveLocale] = useState<Locale>('pt')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    avatar_url: '',
  })

  // Translations state
  const [translations, setTranslations] = useState<Record<Locale, TranslationContent>>({
    pt: { role: '', company: '', content: '' },
    en: { role: '', company: '', content: '' },
    es: { role: '', company: '', content: '' },
  })

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/admin/testimonials')
      const data = await response.json()

      if (response.ok) {
        setTestimonials(data.testimonials || [])
      }
    } catch (error) {
      console.error('Erro ao buscar depoimentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingTestimonial(null)
    setFormData({
      name: '',
      avatar_url: '',
    })
    setTranslations({
      pt: { role: '', company: '', content: '' },
      en: { role: '', company: '', content: '' },
      es: { role: '', company: '', content: '' },
    })
    setActiveLocale('pt')
    setShowModal(true)
  }

  const openEditModal = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setFormData({
      name: testimonial.name,
      avatar_url: testimonial.avatar_url || '',
    })

    // Load translations
    const newTranslations: Record<Locale, TranslationContent> = {
      pt: { role: '', company: '', content: '' },
      en: { role: '', company: '', content: '' },
      es: { role: '', company: '', content: '' },
    }

    if (testimonial.testimonial_translations) {
      testimonial.testimonial_translations.forEach((t) => {
        if (newTranslations[t.locale]) {
          newTranslations[t.locale] = {
            role: t.role || '',
            company: t.company || '',
            content: t.content || '',
          }
        }
      })
    }

    setTranslations(newTranslations)
    setActiveLocale('pt')
    setShowModal(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('folder', 'testimonials')

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      const data = await response.json()

      if (response.ok) {
        setFormData({ ...formData, avatar_url: data.url })
      } else {
        toast.error(data.error || 'Erro no upload')
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error('Erro ao fazer upload da imagem')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleTranslate = async (targetLocale: Locale) => {
    const sourceContent = translations.pt
    if (!sourceContent.role && !sourceContent.content) {
      toast.error('Preencha o cargo e depoimento em Português primeiro')
      return
    }

    try {
      setTranslating(targetLocale)
      const response = await fetch('/api/admin/translate-testimonial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: sourceContent.role,
          company: sourceContent.company,
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
            role: data.role || '',
            company: data.company || '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('O nome é obrigatório')
      return
    }

    if (!translations.pt.role.trim() || !translations.pt.content.trim()) {
      toast.error('O cargo e depoimento em Português são obrigatórios')
      return
    }

    setSaving(true)

    try {
      const url = editingTestimonial
        ? `/api/admin/testimonials/${editingTestimonial.id}`
        : '/api/admin/testimonials'

      const method = editingTestimonial ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          avatar_url: formData.avatar_url || null,
          translations,
          display_order: editingTestimonial?.display_order ?? testimonials.length,
          is_active: true,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(editingTestimonial ? 'Atualizado com sucesso!' : 'Criado com sucesso!')
        setShowModal(false)
        fetchTestimonials()
      } else {
        toast.error(data.error || 'Erro ao salvar')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este depoimento?')) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setTestimonials(testimonials.filter(t => t.id !== id))
        toast.success('Excluído com sucesso!')
      } else {
        toast.error(data.error || 'Erro ao excluir')
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir')
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleActive = async (testimonial: Testimonial) => {
    try {
      const response = await fetch(`/api/admin/testimonials/${testimonial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: !testimonial.is_active,
        }),
      })

      if (response.ok) {
        setTestimonials(testimonials.map(t =>
          t.id === testimonial.id ? { ...t, is_active: !t.is_active } : t
        ))
        toast.success(testimonial.is_active ? 'Desativado' : 'Ativado')
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status')
    }
  }

  // Helper to get PT translation for display in list
  const getPtTranslation = (testimonial: Testimonial) => {
    const pt = testimonial.testimonial_translations?.find(t => t.locale === 'pt')
    return {
      role: pt?.role || '',
      company: pt?.company || '',
      content: pt?.content || '',
    }
  }

  const activeCount = testimonials.filter(t => t.is_active).length
  const currentTranslation = translations[activeLocale]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Depoimentos</h1>
          <p className="text-gray-500 mt-1">Gerencie os depoimentos exibidos no site</p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Depoimento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <MessageSquareQuote className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{testimonials.length}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
              <p className="text-sm text-gray-500">Ativos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquareQuote className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum depoimento cadastrado</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {testimonials.map((testimonial) => {
              const ptData = getPtTranslation(testimonial)
              return (
                <div
                  key={testimonial.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !testimonial.is_active ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {testimonial.avatar_url ? (
                          <Image
                            src={testimonial.avatar_url}
                            alt={testimonial.name}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-7 h-7 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                          <p className="text-sm text-gray-500">
                            {ptData.role}
                            {ptData.company && ` - ${ptData.company}`}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${
                            testimonial.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {testimonial.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>

                      {/* Testimonial text */}
                      <p className="mt-2 text-gray-600 text-sm line-clamp-2">
                        &ldquo;{ptData.content}&rdquo;
                      </p>

                      {/* Translation badges */}
                      <div className="flex items-center gap-2 mt-2">
                        {(['pt', 'en', 'es'] as Locale[]).map(locale => {
                          const hasTranslation = testimonial.testimonial_translations?.some(
                            t => t.locale === locale && t.content
                          )
                          return (
                            <span
                              key={locale}
                              className={`text-xs px-1.5 py-0.5 rounded ${
                                hasTranslation
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              {LOCALE_FLAGS[locale]}
                            </span>
                          )
                        })}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handleToggleActive(testimonial)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            testimonial.is_active
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {testimonial.is_active ? (
                            <>
                              <X className="w-3.5 h-3.5" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Ativar
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => openEditModal(testimonial)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(testimonial.id)}
                          disabled={deleting === testimonial.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {deleting === testimonial.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingTestimonial ? 'Editar Depoimento' : 'Novo Depoimento'}
              </h2>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Avatar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto (opcional)
                </label>

                <div className="flex items-center gap-4">
                  {/* Preview */}
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {formData.avatar_url ? (
                      <Image
                        src={formData.avatar_url}
                        alt="Preview"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    {/* Upload Button */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {uploading ? 'Enviando...' : 'Upload'}
                    </button>

                    {formData.avatar_url && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, avatar_url: '' })}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Remover foto
                      </button>
                    )}
                  </div>
                </div>

                {/* URL input */}
                <div className="relative mt-3">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm text-black"
                    placeholder="ou cole o link da imagem"
                  />
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-black"
                  placeholder="Nome completo"
                  required
                />
              </div>

              {/* Language Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex items-center gap-1">
                  <Languages className="w-4 h-4 text-gray-400 mr-2" />
                  {(['pt', 'en', 'es'] as Locale[]).map((locale) => (
                    <button
                      key={locale}
                      type="button"
                      onClick={() => setActiveLocale(locale)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeLocale === locale
                          ? 'border-amber-500 text-amber-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <span>{LOCALE_FLAGS[locale]}</span>
                      <span>{LOCALE_LABELS[locale]}</span>
                      {translations[locale].content && (
                        <Check className="w-3 h-3 text-green-500" />
                      )}
                    </button>
                  ))}

                  {/* Translate buttons */}
                  {activeLocale !== 'pt' && (
                    <button
                      type="button"
                      onClick={() => handleTranslate(activeLocale)}
                      disabled={translating !== null}
                      className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {translating === activeLocale ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      Traduzir com IA
                    </button>
                  )}
                </div>
              </div>

              {/* Cargo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo {activeLocale === 'pt' && '*'}
                </label>
                <input
                  type="text"
                  value={currentTranslation.role}
                  onChange={(e) => setTranslations(prev => ({
                    ...prev,
                    [activeLocale]: { ...prev[activeLocale], role: e.target.value }
                  }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-black"
                  placeholder="Ex: CEO, Diretor, Empresário"
                  required={activeLocale === 'pt'}
                />
              </div>

              {/* Empresa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa (opcional)
                </label>
                <input
                  type="text"
                  value={currentTranslation.company}
                  onChange={(e) => setTranslations(prev => ({
                    ...prev,
                    [activeLocale]: { ...prev[activeLocale], company: e.target.value }
                  }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-black"
                  placeholder="Nome da empresa"
                />
              </div>

              {/* Depoimento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Depoimento {activeLocale === 'pt' && '*'}
                </label>
                <textarea
                  value={currentTranslation.content}
                  onChange={(e) => setTranslations(prev => ({
                    ...prev,
                    [activeLocale]: { ...prev[activeLocale], content: e.target.value }
                  }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-black resize-none"
                  placeholder="O texto do depoimento..."
                  rows={4}
                  required={activeLocale === 'pt'}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.name || !translations.pt.role || !translations.pt.content}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  {editingTestimonial ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
