'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Check,
  X,
  Upload,
  ImageIcon,
  Video,
} from 'lucide-react'
import type { Segment } from '@/types/database'
import toast from 'react-hot-toast'
import { useConfirm } from '@/components/admin/ConfirmDialog'

export default function SegmentosPage() {
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const confirm = useConfirm()

  const [formData, setFormData] = useState({
    title: '',
    lp_slug: '',
    image_url: '',
    video_url: '',
  })

  // Função para gerar slug a partir do título
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .trim()
  }

  useEffect(() => {
    fetchSegments()
  }, [])

  const fetchSegments = async () => {
    try {
      const response = await fetch('/api/admin/segments')
      const data = await response.json()

      if (response.ok) {
        setSegments(data.segments)
      }
    } catch (error) {
      console.error('Erro ao buscar segmentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingSegment(null)
    setFormData({
      title: '',
      lp_slug: '',
      image_url: '',
      video_url: '',
    })
    setShowModal(true)
  }

  const openEditModal = (segment: Segment) => {
    setEditingSegment(segment)
    setFormData({
      title: segment.title,
      lp_slug: segment.lp_slug || '',
      image_url: segment.image_url || '',
      video_url: segment.video_url || '',
    })
    setShowModal(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('folder', 'segments')

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      const data = await response.json()

      if (response.ok) {
        setFormData({ ...formData, image_url: data.url })
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

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingVideo(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('folder', 'segments/videos')

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      const data = await response.json()

      if (response.ok) {
        setFormData({ ...formData, video_url: data.url })
      } else {
        toast.error(data.error || 'Erro no upload do vídeo')
      }
    } catch (error) {
      console.error('Erro no upload do vídeo:', error)
      toast.error('Erro ao fazer upload do vídeo')
    } finally {
      setUploadingVideo(false)
      if (videoInputRef.current) {
        videoInputRef.current.value = ''
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingSegment
        ? `/api/admin/segments/${editingSegment.id}`
        : '/api/admin/segments'

      const method = editingSegment ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          display_order: editingSegment?.display_order ?? segments.length,
          is_active: true,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(editingSegment ? 'Atualizado com sucesso!' : 'Criado com sucesso!')
        setShowModal(false)
        fetchSegments()
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
    const confirmed = await confirm({
      title: 'Excluir segmento',
      message: 'Tem certeza que deseja excluir este segmento? Esta ação não pode ser desfeita.',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger',
    })

    if (!confirmed) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/admin/segments/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setSegments(segments.filter(s => s.id !== id))
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

  const handleToggleActive = async (segment: Segment) => {
    try {
      const response = await fetch(`/api/admin/segments/${segment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !segment.is_active }),
      })

      if (response.ok) {
        setSegments(segments.map(s =>
          s.id === segment.id ? { ...s, is_active: !s.is_active } : s
        ))
        toast.success(segment.is_active ? 'Desativado' : 'Ativado')
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status')
    }
  }

  const updateOrder = async (segmentId: string, newOrder: number) => {
    try {
      await fetch(`/api/admin/segments/${segmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: newOrder }),
      })
    } catch (error) {
      console.error('Erro ao atualizar ordem:', error)
    }
  }

  const moveSegment = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= segments.length) return

    const newSegments = [...segments]
    const [movedSegment] = newSegments.splice(index, 1)
    newSegments.splice(newIndex, 0, movedSegment)

    // Atualizar display_order de todos
    const updatedSegments = newSegments.map((s, i) => ({ ...s, display_order: i }))
    setSegments(updatedSegments)

    // Salvar no banco
    await updateOrder(movedSegment.id, newIndex)
    await updateOrder(segments[newIndex].id, index)
  }

  const activeCount = segments.filter(s => s.is_active).length

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Segmentos</h1>
          <p className="text-gray-500 mt-1">Gerencie os segmentos exibidos no carrossel</p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Segmento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Layers className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{segments.length}</p>
              <p className="text-sm text-gray-500">Total de Segmentos</p>
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

      {/* Segments List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : segments.length === 0 ? (
          <div className="text-center py-12">
            <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum segmento cadastrado</p>
            <button
              onClick={openCreateModal}
              className="mt-4 text-amber-600 hover:text-amber-700 font-medium"
            >
              Criar primeiro segmento
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {segments.map((segment, index) => (
              <div
                key={segment.id}
                className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                  !segment.is_active ? 'opacity-50' : ''
                }`}
              >
                {/* Ordem / Drag */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => moveSegment(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <span className="text-lg font-bold text-amber-500">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <button
                    onClick={() => moveSegment(index, 'down')}
                    disabled={index === segments.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Imagem */}
                <div className="w-32 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {segment.image_url ? (
                    <Image
                      src={segment.image_url}
                      alt={segment.title}
                      width={128}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-gray-900">{segment.title}</h3>
                    {segment.video_url && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                        <Video className="w-3 h-3" />
                        Vídeo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {segment.is_active ? (
                      <span className="text-green-600">Ativo</span>
                    ) : (
                      <span className="text-red-600">Inativo</span>
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(segment)}
                    className={`p-2 rounded-lg transition-colors ${
                      segment.is_active
                        ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                        : 'bg-green-100 hover:bg-green-200 text-green-700'
                    }`}
                    title={segment.is_active ? 'Desativar' : 'Ativar'}
                  >
                    {segment.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEditModal(segment)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(segment.id)}
                    disabled={deleting === segment.id}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-50"
                    title="Excluir"
                  >
                    {deleting === segment.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingSegment ? 'Editar' : 'Novo'} Segmento
              </h2>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    const newTitle = e.target.value
                    setFormData({
                      ...formData,
                      title: newTitle,
                      lp_slug: generateSlug(newTitle),
                    })
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-black"
                  placeholder="Ex: Comércio, Indústria, Saúde..."
                  required
                />
              </div>

              {/* Slug da LP (gerado automaticamente) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug da Landing Page
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">/segmentos/</span>
                  <input
                    type="text"
                    value={formData.lp_slug}
                    onChange={(e) => setFormData({ ...formData, lp_slug: generateSlug(e.target.value) })}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-black"
                    placeholder="slug-da-pagina"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.lp_slug ? (
                    <>Link: <span className="text-amber-600">/segmentos/{formData.lp_slug}</span></>
                  ) : (
                    'Gerado automaticamente do título. Deixe vazio se não tiver LP.'
                  )}
                </p>
              </div>

              {/* Imagem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem
                </label>

                {/* Preview */}
                {formData.image_url && (
                  <div className="mb-3 p-4 bg-gray-50 rounded-lg">
                    <div className="aspect-video bg-white rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                      <Image
                        src={formData.image_url}
                        alt="Preview"
                        width={400}
                        height={225}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Remover imagem
                    </button>
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex gap-2">
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
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                    ) : (
                      <Upload className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600">
                      {uploading ? 'Enviando...' : 'Fazer upload'}
                    </span>
                  </button>
                </div>

                {/* Ou colar link */}
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-gray-500">ou cole o link</span>
                  </div>
                </div>

                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-black"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
              </div>

              {/* Vídeo (opcional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vídeo <span className="text-gray-400 font-normal">(opcional - reproduz no hover)</span>
                </label>

                {/* Preview do vídeo */}
                {formData.video_url && (
                  <div className="mb-3 p-4 bg-gray-50 rounded-lg">
                    <div className="aspect-video bg-black rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                      <video
                        src={formData.video_url}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, video_url: '' })}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Remover vídeo
                    </button>
                  </div>
                )}

                {/* Upload de vídeo */}
                <div className="flex gap-2">
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept=".mp4,.webm,video/mp4,video/webm"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={uploadingVideo}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors disabled:opacity-50"
                  >
                    {uploadingVideo ? (
                      <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                    ) : (
                      <Video className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600">
                      {uploadingVideo ? 'Enviando...' : 'Upload de vídeo'}
                    </span>
                  </button>
                </div>

                {/* Ou colar link do vídeo */}
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-gray-500">ou cole o link</span>
                  </div>
                </div>

                <div className="relative">
                  <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-black"
                    placeholder="https://exemplo.com/video.mp4"
                  />
                </div>
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
                  disabled={saving || !formData.title}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  {editingSegment ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
