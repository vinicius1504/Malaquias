'use client'

import { useState } from 'react'
import { Loader2, Check, AlertCircle, Upload, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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

interface MigrationItem {
  src: string
  name: string
  type: 'client' | 'partner'
  status: 'pending' | 'migrating' | 'success' | 'error'
  error?: string
}

export default function MigrarPage() {
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

  const migrateItem = async (item: MigrationItem, index: number) => {
    // Atualiza status para migrando
    setItems(prev => prev.map((it, i) =>
      i === index ? { ...it, status: 'migrating' } : it
    ))

    try {
      // Cria o registro no banco usando a URL local da imagem
      const response = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.name,
          type: item.type,
          logo_url: item.src, // Usa a URL local
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
    setMigrating(true)
    setCompleted(0)

    // Migra um por um para não sobrecarregar
    for (let i = 0; i < items.length; i++) {
      if (items[i].status === 'pending') {
        await migrateItem(items[i], i)
        // Pequeno delay entre cada requisição
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }

    setMigrating(false)
  }

  const pendingCount = items.filter(i => i.status === 'pending').length
  const successCount = items.filter(i => i.status === 'success').length
  const errorCount = items.filter(i => i.status === 'error').length

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
                  <div className="w-24 flex justify-center">
                    {item.status === 'pending' && (
                      <span className="text-sm text-gray-400">Pendente</span>
                    )}
                    {item.status === 'migrating' && (
                      <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                    )}
                    {item.status === 'success' && (
                      <Check className="w-5 h-5 text-green-500" />
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
                  <div className="w-24 flex justify-center">
                    {item.status === 'pending' && (
                      <span className="text-sm text-gray-400">Pendente</span>
                    )}
                    {item.status === 'migrating' && (
                      <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                    )}
                    {item.status === 'success' && (
                      <Check className="w-5 h-5 text-green-500" />
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
          <strong>Nota:</strong> Esta migração usa as URLs locais das imagens (/images/...).
          As imagens continuarão sendo servidas da pasta public. Se preferir fazer upload
          para o Supabase Storage, você pode editar cada item depois na página de parceiros.
        </p>
      </div>
    </div>
  )
}
