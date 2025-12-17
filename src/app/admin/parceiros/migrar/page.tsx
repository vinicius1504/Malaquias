'use client'

import { useState } from 'react'
import { Loader2, Check, AlertCircle, Upload, ArrowLeft, Cloud, HardDrive } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { useConfirm } from '@/components/admin/ConfirmDialog'

// Logos de clientes existentes
const clientLogos = [
  { src: '/images/clientes/logo (1).png', name: 'Cliente 1' },
  { src: '/images/clientes/logo (2).png', name: 'Cliente 2' },
  { src: '/images/clientes/logo (3).png', name: 'Cliente 3' },
  { src: '/images/clientes/logo (4).png', name: 'Cliente 4' },
  { src: '/images/clientes/logo (5).png', name: 'Cliente 5' },
  { src: '/images/clientes/logo (6).png', name: 'Cliente 6' },
  { src: '/images/clientes/logo (7).png', name: 'Cliente 7' },
  { src: '/images/clientes/logo (8).png', name: 'Cliente 8' },
  { src: '/images/clientes/logo (9).png', name: 'Cliente 9' },
  { src: '/images/clientes/logo (10).png', name: 'Cliente 10' },
  { src: '/images/clientes/logo (11).png', name: 'Cliente 11' },
  { src: '/images/clientes/logo (12).png', name: 'Cliente 12' },
  { src: '/images/clientes/logo (13).png', name: 'Cliente 13' },
  { src: '/images/clientes/logo (14).png', name: 'Cliente 14' },
  { src: '/images/clientes/logo (15).png', name: 'Cliente 15' },
  { src: '/images/clientes/logo (16).png', name: 'Cliente 16' },
  { src: '/images/clientes/logo (17).png', name: 'Cliente 17' },
  { src: '/images/clientes/logo (18).png', name: 'Cliente 18' },
  { src: '/images/clientes/logo (19).png', name: 'Cliente 19' },
  { src: '/images/clientes/logo (20).png', name: 'Cliente 20' },
  { src: '/images/clientes/logo (21).png', name: 'Cliente 21' },
  { src: '/images/clientes/logo (22).png', name: 'Cliente 22' },
  { src: '/images/clientes/logo (23).png', name: 'Cliente 23' },
  { src: '/images/clientes/logo (1).jpeg', name: 'Cliente 24' },
  { src: '/images/clientes/logo (2).jpeg', name: 'Cliente 25' },
  { src: '/images/clientes/logo (3).jpeg', name: 'Cliente 26' },
  { src: '/images/clientes/logo (2).jpg', name: 'Cliente 27' },
]

// Logos de parceiros existentes
const partnerLogos = [
  { src: '/images/parceiros/ec.png', name: 'EC' },
  { src: '/images/parceiros/solides.jpg', name: 'Solides' },
  { src: '/images/parceiros/tr.png', name: 'TR' },
  { src: '/images/parceiros/uc.png', name: 'UC' },
]

type UploadMode = 'cloud' | 'local'

interface MigrationItem {
  src: string
  name: string
  type: 'client' | 'partner'
  status: 'pending' | 'migrating' | 'uploading' | 'success' | 'error'
  error?: string
  cloudUrl?: string
}

export default function MigrarPage() {
  const confirm = useConfirm()
  const [uploadMode, setUploadMode] = useState<UploadMode>('cloud')
  const [items, setItems] = useState<MigrationItem[]>([
    ...clientLogos.map(l => ({ ...l, type: 'client' as const, status: 'pending' as const })),
    ...partnerLogos.map(l => ({ ...l, type: 'partner' as const, status: 'pending' as const })),
  ])
  const [migrating, setMigrating] = useState(false)
  const [completed, setCompleted] = useState(0)

  const updateItemName = (index: number, name: string) => {
    setItems(prev => prev.map((item, i) =>
      i === index ? { ...item, name } : item
    ))
  }

  const uploadToCloud = async (localPath: string, folder: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/admin/migrate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localPath, folder }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro no upload')
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error('Erro no upload para cloud:', error)
      return null
    }
  }

  const migrateItem = async (item: MigrationItem, index: number) => {
    let logoUrl = item.src

    // Se modo cloud, primeiro faz upload para Supabase Storage
    if (uploadMode === 'cloud') {
      setItems(prev => prev.map((it, i) =>
        i === index ? { ...it, status: 'uploading' } : it
      ))

      const folder = item.type === 'client' ? 'clients' : 'partners'
      const cloudUrl = await uploadToCloud(item.src, folder)

      if (!cloudUrl) {
        setItems(prev => prev.map((it, i) =>
          i === index ? { ...it, status: 'error', error: 'Falha no upload para cloud' } : it
        ))
        return
      }

      logoUrl = cloudUrl
      setItems(prev => prev.map((it, i) =>
        i === index ? { ...it, cloudUrl } : it
      ))
    }

    // Atualiza status para migrando
    setItems(prev => prev.map((it, i) =>
      i === index ? { ...it, status: 'migrating' } : it
    ))

    try {
      // Cria o registro no banco
      const response = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.name,
          type: item.type,
          logo_url: logoUrl,
          is_active: true,
          display_order: index,
        }),
      })

      if (response.ok) {
        setItems(prev => prev.map((it, i) =>
          i === index ? { ...it, status: 'success' } : it
        ))
        setCompleted(prev => prev + 1)
      } else {
        const data = await response.json()
        setItems(prev => prev.map((it, i) =>
          i === index ? { ...it, status: 'error', error: data.error } : it
        ))
      }
    } catch (error) {
      setItems(prev => prev.map((it, i) =>
        i === index ? { ...it, status: 'error', error: 'Erro de conexão' } : it
      ))
    }
  }

  const startMigration = async () => {
    const confirmed = await confirm({
      title: 'Confirmar Migração',
      message: `Deseja iniciar a migração de ${pendingCount} itens ${uploadMode === 'cloud' ? 'para o Supabase Storage' : 'com URLs locais'}?`,
      confirmText: 'Iniciar',
      type: 'info',
    })

    if (!confirmed) return

    setMigrating(true)
    setCompleted(0)

    // Migra um por um para não sobrecarregar
    for (let i = 0; i < items.length; i++) {
      if (items[i].status === 'pending') {
        await migrateItem(items[i], i)
        // Pequeno delay entre cada requisição
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }

    setMigrating(false)

    const successItems = items.filter(i => i.status === 'success').length
    const errorItems = items.filter(i => i.status === 'error').length

    if (errorItems === 0) {
      toast.success(`Migração concluída! ${successItems} itens migrados.`)
    } else {
      toast.error(`Migração finalizada com ${errorItems} erros.`)
    }
  }

  const pendingCount = items.filter(i => i.status === 'pending').length
  const successCount = items.filter(i => i.status === 'success').length
  const errorCount = items.filter(i => i.status === 'error').length

  const getStatusText = (status: MigrationItem['status']) => {
    switch (status) {
      case 'pending': return 'Pendente'
      case 'uploading': return 'Enviando...'
      case 'migrating': return 'Salvando...'
      case 'success': return 'Concluído'
      case 'error': return 'Erro'
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/parceiros"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Parceiros
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Migrar Logos Existentes</h1>
        <p className="text-gray-500 mt-1">
          Migre os logos locais para o banco de dados. Você pode editar os nomes antes de migrar.
        </p>
      </div>

      {/* Modo de Upload */}
      <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Modo de Upload</h3>
        <div className="flex gap-4">
          <button
            onClick={() => setUploadMode('cloud')}
            disabled={migrating}
            className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all ${
              uploadMode === 'cloud'
                ? 'border-amber-500 bg-amber-50 text-amber-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            } ${migrating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Cloud className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium">Supabase Storage</p>
              <p className="text-xs opacity-75">Upload para a nuvem (recomendado)</p>
            </div>
          </button>
          <button
            onClick={() => setUploadMode('local')}
            disabled={migrating}
            className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all ${
              uploadMode === 'local'
                ? 'border-amber-500 bg-amber-50 text-amber-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            } ${migrating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <HardDrive className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium">URL Local</p>
              <p className="text-xs opacity-75">Mantém referência local</p>
            </div>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{items.length}</p>
          <p className="text-sm text-gray-500">Total</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          <p className="text-sm text-gray-500">Pendentes</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{successCount}</p>
          <p className="text-sm text-gray-500">Migrados</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{errorCount}</p>
          <p className="text-sm text-gray-500">Erros</p>
        </div>
      </div>

      {/* Progress Bar */}
      {migrating && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progresso</span>
            <span>{completed} de {items.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completed / items.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Botão de migração */}
      <div className="mb-6">
        <button
          onClick={startMigration}
          disabled={migrating || pendingCount === 0}
          className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {migrating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Migrando... ({completed}/{items.length})
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Iniciar Migração ({pendingCount} itens)
            </>
          )}
        </button>
      </div>

      {/* Lista de Clientes */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Clientes ({clientLogos.length})
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="divide-y divide-gray-100">
            {items.filter(i => i.type === 'client').map((item, idx) => {
              const globalIndex = items.findIndex(i => i.src === item.src)
              return (
                <div key={item.src} className="flex items-center gap-4 p-4">
                  {/* Preview */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img
                      src={item.src}
                      alt={item.name}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>

                  {/* Nome editável */}
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItemName(globalIndex, e.target.value)}
                    disabled={item.status !== 'pending'}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Nome do cliente"
                  />

                  {/* Status */}
                  <div className="w-28 flex justify-center">
                    {item.status === 'pending' && (
                      <span className="text-sm text-gray-400">{getStatusText(item.status)}</span>
                    )}
                    {item.status === 'uploading' && (
                      <div className="flex items-center gap-2 text-blue-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs">{getStatusText(item.status)}</span>
                      </div>
                    )}
                    {item.status === 'migrating' && (
                      <div className="flex items-center gap-2 text-amber-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs">{getStatusText(item.status)}</span>
                      </div>
                    )}
                    {item.status === 'success' && (
                      <div className="flex items-center gap-1 text-green-500">
                        <Check className="w-5 h-5" />
                        {item.cloudUrl && <Cloud className="w-4 h-4" />}
                      </div>
                    )}
                    {item.status === 'error' && (
                      <div className="flex items-center gap-1 text-red-500" title={item.error}>
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Lista de Parceiros */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Parceiros ({partnerLogos.length})
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="divide-y divide-gray-100">
            {items.filter(i => i.type === 'partner').map((item) => {
              const globalIndex = items.findIndex(i => i.src === item.src)
              return (
                <div key={item.src} className="flex items-center gap-4 p-4">
                  {/* Preview */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img
                      src={item.src}
                      alt={item.name}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>

                  {/* Nome editável */}
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItemName(globalIndex, e.target.value)}
                    disabled={item.status !== 'pending'}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Nome do parceiro"
                  />

                  {/* Status */}
                  <div className="w-28 flex justify-center">
                    {item.status === 'pending' && (
                      <span className="text-sm text-gray-400">{getStatusText(item.status)}</span>
                    )}
                    {item.status === 'uploading' && (
                      <div className="flex items-center gap-2 text-blue-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs">{getStatusText(item.status)}</span>
                      </div>
                    )}
                    {item.status === 'migrating' && (
                      <div className="flex items-center gap-2 text-amber-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs">{getStatusText(item.status)}</span>
                      </div>
                    )}
                    {item.status === 'success' && (
                      <div className="flex items-center gap-1 text-green-500">
                        <Check className="w-5 h-5" />
                        {item.cloudUrl && <Cloud className="w-4 h-4" />}
                      </div>
                    )}
                    {item.status === 'error' && (
                      <div className="flex items-center gap-1 text-red-500" title={item.error}>
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Aviso */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Modo selecionado:</strong>{' '}
          {uploadMode === 'cloud' ? (
            <>
              As imagens serão enviadas para o Supabase Storage e as URLs públicas
              serão salvas no banco de dados. Isso é recomendado para produção.
            </>
          ) : (
            <>
              As imagens continuarão sendo servidas da pasta public usando URLs locais (/images/...).
              Isso funciona apenas em desenvolvimento ou se a pasta public for servida estaticamente.
            </>
          )}
        </p>
      </div>
    </div>
  )
}
