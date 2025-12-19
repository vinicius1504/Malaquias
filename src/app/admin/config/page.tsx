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
  Download,
  FileJson,
  Database,
  Newspaper,
  Handshake,
  MessageSquareQuote,
  Layers,
  Users,
  CheckCircle2,
  PanelTop,
  History,
  Globe,
  FolderArchive,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useConfirm } from '@/components/admin/ConfirmDialog'
import JSZip from 'jszip'

interface GalleryFile {
  name: string
  url: string
  size: number
  type: 'image' | 'video'
  createdAt: string
}

interface ExportData {
  name: string
  endpoint: string
  icon: React.ElementType
  color: string
  description: string
  folder: string
}

const exportOptions: ExportData[] = [
  { name: 'Front-end (data + locales)', endpoint: '/api/admin/export-lp-files', icon: FolderArchive, color: 'rose', description: 'Pastas data/ e locales/ completas', folder: 'frontend' },
  { name: 'Notícias', endpoint: '/api/admin/news', icon: Newspaper, color: 'blue', description: 'Todas as notícias do blog', folder: 'noticias' },
  { name: 'Parceiros', endpoint: '/api/admin/partners', icon: Handshake, color: 'green', description: 'Lista de parceiros', folder: 'parceiros' },
  { name: 'Depoimentos', endpoint: '/api/admin/testimonials', icon: MessageSquareQuote, color: 'purple', description: 'Depoimentos de clientes', folder: 'depoimentos' },
  { name: 'Segmentos', endpoint: '/api/admin/segments', icon: Layers, color: 'amber', description: 'Segmentos de atuação', folder: 'segmentos' },
  { name: 'Traduções (DB)', endpoint: '/api/admin/translations', icon: Globe, color: 'cyan', description: 'Textos traduzidos do banco', folder: 'traducoes-db' },
  { name: 'Usuários', endpoint: '/api/admin/users', icon: Users, color: 'indigo', description: 'Usuários do sistema', folder: 'usuarios' },
  { name: 'Landing Pages (DB)', endpoint: '/api/admin/landing-pages', icon: Database, color: 'slate', description: 'LPs do banco de dados', folder: 'landing-pages-db' },
  { name: 'Logs', endpoint: '/api/admin/logs', icon: History, color: 'gray', description: 'Logs de auditoria', folder: 'logs' },
  { name: 'Categorias', endpoint: '/api/admin/categories', icon: FolderOpen, color: 'orange', description: 'Categorias de notícias', folder: 'categorias' },
]

export default function ConfigPage() {
  const [files, setFiles] = useState<GalleryFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'images' | 'videos' | 'export'>('images')
  const [previewFile, setPreviewFile] = useState<GalleryFile | null>(null)
  const [exporting, setExporting] = useState<string | null>(null)
  const [exportingAll, setExportingAll] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const confirm = useConfirm()

  useEffect(() => {
    if (activeTab !== 'export') {
      fetchFiles()
    }
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

    if (file.size > 25 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo: 25MB')
      return
    }

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

  const downloadJson = (data: unknown, filename: string) => {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExportSingle = async (option: ExportData) => {
    setExporting(option.name)
    try {
      const response = await fetch(option.endpoint)
      const data = await response.json()

      if (response.ok) {
        const timestamp = new Date().toISOString().split('T')[0]
        downloadJson(data, `${option.folder}_${timestamp}.json`)
        toast.success(`${option.name} exportado com sucesso!`)
      } else {
        toast.error(`Erro ao exportar ${option.name}`)
      }
    } catch (error) {
      console.error(`Erro ao exportar ${option.name}:`, error)
      toast.error(`Erro ao exportar ${option.name}`)
    } finally {
      setExporting(null)
    }
  }

  const handleExportAllAsZip = async () => {
    setExportingAll(true)
    try {
      const zip = new JSZip()
      const timestamp = new Date().toISOString().split('T')[0]

      // Criar pasta raiz
      const rootFolder = zip.folder(`backup_malaquias_${timestamp}`)
      if (!rootFolder) throw new Error('Erro ao criar pasta')

      // Adicionar arquivo de metadados
      rootFolder.file('_info.json', JSON.stringify({
        exportedAt: new Date().toISOString(),
        version: '1.0',
        source: 'Malaquias Contabilidade - Admin Panel',
        contents: exportOptions.map(o => o.folder)
      }, null, 2))

      // Exportar cada tipo de dado em sua pasta
      for (const option of exportOptions) {
        try {
          const response = await fetch(option.endpoint)
          const data = await response.json()

          if (response.ok) {
            // Criar subpasta para cada tipo
            const subFolder = rootFolder.folder(option.folder)
            if (subFolder) {
              // Se for front-end (data + locales), recriar estrutura de pastas
              if (option.folder === 'frontend' && data.data && data.locales) {
                // Criar pasta data/
                const dataFolder = subFolder.folder('data')
                if (dataFolder && data.data.files) {
                  for (const file of data.data.files as Array<{ path: string; content: unknown }>) {
                    dataFolder.file(file.path, JSON.stringify(file.content, null, 2))
                  }
                }

                // Criar pasta locales/
                const localesFolder = subFolder.folder('locales')
                if (localesFolder && data.locales.files) {
                  for (const file of data.locales.files as Array<{ path: string; content: unknown }>) {
                    localesFolder.file(file.path, JSON.stringify(file.content, null, 2))
                  }
                }
              }
              // Se for landing pages do DB
              else if (option.folder === 'landing-pages-db' && data.landingPages) {
                subFolder.file(`${option.folder}.json`, JSON.stringify(data, null, 2))
                const lpFolder = subFolder.folder('paginas_individuais')
                if (lpFolder) {
                  for (const lp of data.landingPages) {
                    lpFolder.file(`${lp.slug}.json`, JSON.stringify(lp, null, 2))
                  }
                }
              }
              // Se for notícias
              else if (option.folder === 'noticias' && data.news) {
                subFolder.file(`${option.folder}.json`, JSON.stringify(data, null, 2))
                const newsFolder = subFolder.folder('individuais')
                if (newsFolder) {
                  for (const news of data.news) {
                    const slug = news.slug || news.id
                    newsFolder.file(`${slug}.json`, JSON.stringify(news, null, 2))
                  }
                }
              }
              // Se for segmentos
              else if (option.folder === 'segmentos' && data.segments) {
                subFolder.file(`${option.folder}.json`, JSON.stringify(data, null, 2))
                const segFolder = subFolder.folder('individuais')
                if (segFolder) {
                  for (const seg of data.segments) {
                    const slug = seg.lp_slug || seg.title?.toLowerCase().replace(/\s+/g, '-') || seg.id
                    segFolder.file(`${slug}.json`, JSON.stringify(seg, null, 2))
                  }
                }
              }
              // Se for depoimentos
              else if (option.folder === 'depoimentos' && data.testimonials) {
                subFolder.file(`${option.folder}.json`, JSON.stringify(data, null, 2))
                const testFolder = subFolder.folder('individuais')
                if (testFolder) {
                  for (const test of data.testimonials) {
                    testFolder.file(`${test.id}.json`, JSON.stringify(test, null, 2))
                  }
                }
              }
              // Se for parceiros
              else if (option.folder === 'parceiros' && data.partners) {
                subFolder.file(`${option.folder}.json`, JSON.stringify(data, null, 2))
                const partFolder = subFolder.folder('individuais')
                if (partFolder) {
                  for (const part of data.partners) {
                    partFolder.file(`${part.id}.json`, JSON.stringify(part, null, 2))
                  }
                }
              }
              // Outros - só o arquivo principal
              else {
                subFolder.file(`${option.folder}.json`, JSON.stringify(data, null, 2))
              }
            }
          }
        } catch (error) {
          console.error(`Erro ao buscar ${option.name}:`, error)
          const errorFolder = rootFolder.folder(option.folder)
          if (errorFolder) {
            errorFolder.file('_error.txt', `Erro ao exportar: ${error}`)
          }
        }
      }

      // Gerar e baixar o ZIP
      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup_malaquias_${timestamp}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Backup completo exportado com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar todos:', error)
      toast.error('Erro ao exportar backup completo')
    } finally {
      setExportingAll(false)
    }
  }

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; hover: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200', hover: 'hover:bg-blue-50' },
      green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200', hover: 'hover:bg-green-50' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200', hover: 'hover:bg-purple-50' },
      amber: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200', hover: 'hover:bg-amber-50' },
      pink: { bg: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-200', hover: 'hover:bg-pink-50' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200', hover: 'hover:bg-indigo-50' },
      rose: { bg: 'bg-rose-100', text: 'text-rose-600', border: 'border-rose-200', hover: 'hover:bg-rose-50' },
      gray: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', hover: 'hover:bg-gray-50' },
      cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600', border: 'border-cyan-200', hover: 'hover:bg-cyan-50' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200', hover: 'hover:bg-orange-50' },
      slate: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', hover: 'hover:bg-slate-50' },
    }
    return colors[color] || colors.blue
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
          <p className="text-gray-500 mt-1">Galeria de mídia e exportação de dados</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
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
        <button
          onClick={() => setActiveTab('export')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'export'
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FileJson className="w-5 h-5" />
          Exportar JSON
        </button>
      </div>

      {/* Export Tab Content */}
      {activeTab === 'export' ? (
        <div className="space-y-6">
          {/* Info Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-emerald-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-lg text-emerald-800">Exportar TODOS os JSONs do Sistema</h3>
                <p className="text-sm text-emerald-600 mt-1">
                  Exporte os arquivos JSON <strong>exatamente como estão no front-end</strong> (src/data/lp/) e dados do banco.
                  Tudo organizado em pastas separadas.
                </p>
              </div>
            </div>
          </div>

          {/* Export All Button */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <FolderArchive className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Backup Completo (ZIP)</h3>
                  <p className="text-emerald-100 text-sm mt-1">
                    Exporta TODOS os JSONs em um arquivo ZIP organizado por pastas
                  </p>
                  <p className="text-emerald-200 text-xs mt-1">
                    Inclui: JSONs das LPs (src/data/lp/), Notícias, Parceiros, Depoimentos, Segmentos, Usuários, Logs, etc.
                  </p>
                </div>
              </div>
              <button
                onClick={handleExportAllAsZip}
                disabled={exportingAll}
                className="flex items-center gap-2 px-8 py-4 bg-white text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {exportingAll ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Gerando ZIP...
                  </>
                ) : (
                  <>
                    <Download className="w-6 h-6" />
                    Baixar Backup Completo
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Individual Exports */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg text-gray-800">Exportar Individualmente</h2>
              <p className="text-gray-500 text-sm mt-1">Ou escolha quais dados deseja exportar separadamente</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {exportOptions.map((option) => {
                const colors = getColorClasses(option.color)
                const Icon = option.icon
                const isExporting = exporting === option.name

                return (
                  <div
                    key={option.name}
                    className={`border ${colors.border} rounded-xl p-4 ${colors.hover} transition-colors`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-lg text-gray-900">{option.name}</h3>
                        <p className="text-gray-500 text-xs mt-0.5">{option.description}</p>
                        <p className="text-gray-400 text-xs mt-0.5">Pasta: /{option.folder}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleExportSingle(option)}
                      disabled={isExporting}
                      className={`w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 ${colors.bg} ${colors.text} rounded-lg font-medium text-sm hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Exportando...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Exportar JSON
                        </>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Export Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-700 mb-2">Estrutura do Backup Completo (ZIP)</p>
                <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
{`backup_malaquias_YYYY-MM-DD.zip
├── _info.json (metadados)
├── frontend/                    ← PASTAS EXATAS DO FRONT-END
│   ├── data/
│   │   └── lp/
│   │       ├── varejo.json
│   │       ├── saude.json
│   │       ├── restaurantes.json
│   │       ├── automoveis.json
│   │       ├── agronegocio.json
│   │       └── setores.json
│   └── locales/
│       ├── pt/
│       │   ├── common.json
│       │   ├── home.json
│       │   ├── about.json
│       │   └── ...
│       ├── en/
│       │   └── ...
│       └── es/
│           └── ...
├── noticias/
├── parceiros/
├── depoimentos/
├── segmentos/
├── landing-pages-db/
├── usuarios/
├── logs/
├── traducoes-db/
└── categorias/`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
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

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-white text-xs truncate">{file.name}</p>
                      <p className="text-white/60 text-xs">{formatSize(file.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

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
