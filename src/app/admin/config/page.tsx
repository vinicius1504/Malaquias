'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  Settings,
  Upload,
  ImageIcon,
  Video,
  Loader2,
  Copy,
  Check,
  Trash2,
  FolderOpen,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useConfirm } from '@/components/admin/ConfirmDialog'

interface GalleryFile {
  name: string
  url: string
  size: number
  type: 'image' | 'video'
  createdAt: string
}

export default function ConfigPage() {
  const [files, setFiles] = useState<GalleryFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images')
  const [previewFile, setPreviewFile] = useState<GalleryFile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const confirm = useConfirm()

  useEffect(() => {
    fetchFiles()
  }, [activeTab])

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const folder = activeTab === 'images' ? 'gallery/images' : 'gallery/videos'
      const response = await fetch(`/api/admin/gallery?folder=${folder}&type=${activeTab}`)
      const data = await response.json()

      if (response.ok) {
        setFiles(data.files || [])
      }
    } catch (error) {
      console.error('Erro ao buscar arquivos:', error)
      toast.error('Erro ao carregar galeria')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamanho (25MB)
    if (file.size > 25 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo: 25MB')
      return
    }

    // Validar tipo
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')

    if (activeTab === 'images' && !isImage) {
      toast.error('Por favor, selecione uma imagem')
      return
    }

    if (activeTab === 'videos' && !isVideo) {
      toast.error('Por favor, selecione um vídeo')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', activeTab === 'images' ? 'gallery/images' : 'gallery/videos')

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Upload realizado com sucesso!')
        fetchFiles()
      } else {
        toast.error(data.error || 'Erro no upload')
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error('Erro ao fazer upload')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    toast.success('URL copiada!')
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const handleDelete = async (file: GalleryFile) => {
    const confirmed = await confirm({
      title: 'Excluir arquivo',
      message: `Tem certeza que deseja excluir "${file.name}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger',
    })

    if (!confirmed) return

    try {
      const folder = activeTab === 'images' ? 'gallery/images' : 'gallery/videos'
      const response = await fetch('/api/admin/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: `${folder}/${file.name}` }),
      })

      if (response.ok) {
        toast.success('Arquivo excluído!')
        setFiles(files.filter(f => f.name !== file.name))
      } else {
        toast.error('Erro ao excluir arquivo')
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir arquivo')
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-7 h-7 text-amber-500" />
            Configurações
          </h1>
          <p className="text-gray-500 mt-1">Galeria de mídia - Faça upload e copie URLs</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('images')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'images'
              ? 'bg-amber-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <ImageIcon className="w-5 h-5" />
          Imagens
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'videos'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Video className="w-5 h-5" />
          Vídeos
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <FolderOpen className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-lg text-blue-800">Como usar a galeria</h3>
            <p className="text-sm text-blue-600 mt-1">
              Faça upload de {activeTab === 'images' ? 'imagens' : 'vídeos'} aqui e copie a URL para usar em qualquer lugar do site.
              Limite de <strong>25MB</strong> por arquivo.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 mb-8 hover:border-amber-500 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept={activeTab === 'images' ? 'image/*' : 'video/mp4,video/webm'}
          onChange={handleUpload}
          className="hidden"
        />
        <div className="text-center">
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
              <p className="text-gray-600">Enviando arquivo...</p>
            </div>
          ) : (
            <>
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                activeTab === 'images' ? 'bg-amber-100' : 'bg-purple-100'
              }`}>
                {activeTab === 'images' ? (
                  <ImageIcon className="w-8 h-8 text-amber-500" />
                ) : (
                  <Video className="w-8 h-8 text-purple-500" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Upload de {activeTab === 'images' ? 'Imagem' : 'Vídeo'}
              </h3>
              <p className="text-gray-500 mb-4">
                {activeTab === 'images'
                  ? 'JPG, PNG, WebP ou GIF - Máx 25MB'
                  : 'MP4 ou WebM - Máx 25MB'}
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                  activeTab === 'images'
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-purple-500 hover:bg-purple-600'
                }`}
              >
                <Upload className="w-5 h-5" />
                Selecionar Arquivo
              </button>
            </>
          )}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-lg text-gray-800">
            {activeTab === 'images' ? 'Imagens' : 'Vídeos'} na Galeria ({files.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12">
            {activeTab === 'images' ? (
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            ) : (
              <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            )}
            <p className="text-gray-500">Nenhum {activeTab === 'images' ? 'a imagem' : 'vídeo'} na galeria</p>
            <p className="text-gray-400 text-sm mt-1">Faça upload para começar</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
            {files.map((file) => (
              <div
                key={file.name}
                className="group relative bg-gray-100 rounded-lg overflow-hidden aspect-square"
              >
                {/* Thumbnail */}
                {file.type === 'image' ? (
                  <Image
                    src={file.url}
                    alt={file.name}
                    fill
                    className="object-cover cursor-pointer"
                    onClick={() => setPreviewFile(file)}
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center bg-gray-800 cursor-pointer"
                    onClick={() => setPreviewFile(file)}
                  >
                    <Video className="w-12 h-12 text-white/50" />
                  </div>
                )}

                {/* Overlay com ações */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button
                    onClick={() => copyUrl(file.url)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-100"
                  >
                    {copiedUrl === file.url ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copiar URL
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(file)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-500 rounded-lg text-sm font-medium text-white hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                </div>

                {/* File info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-white text-xs truncate">{file.name}</p>
                  <p className="text-white/60 text-xs">{formatSize(file.size)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>

            {previewFile.type === 'image' ? (
              <div className="relative w-full h-[70vh]">
                <Image
                  src={previewFile.url}
                  alt={previewFile.name}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <video
                src={previewFile.url}
                controls
                autoPlay
                className="w-full max-h-[70vh]"
              />
            )}

            <div className="mt-4 flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div>
                <p className="text-white font-medium">{previewFile.name}</p>
                <p className="text-white/60 text-sm">{formatSize(previewFile.size)}</p>
              </div>
              <button
                onClick={() => copyUrl(previewFile.url)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 rounded-lg text-white font-medium hover:bg-amber-600"
              >
                {copiedUrl === previewFile.url ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copiar URL
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
