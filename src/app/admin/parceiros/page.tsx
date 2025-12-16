'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Handshake,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Check,
  X,
  Building2,
  Users,
  Upload,
  ImageIcon,
  FolderInput,
} from 'lucide-react'
import type { Partner, PartnerType } from '@/types/database'
import toast from 'react-hot-toast'

const TYPE_LABELS: Record<PartnerType, string> = {
  partner: 'Parceiro',
  client: 'Cliente',
}

const TYPE_COLORS: Record<PartnerType, string> = {
  partner: 'bg-blue-100 text-blue-700',
  client: 'bg-purple-100 text-purple-700',
}

export default function ParceirosPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<PartnerType | 'all'>('all')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state - apenas nome e logo
  const [formData, setFormData] = useState({
    name: '',
    type: 'client' as PartnerType,
    logo_url: '',
  })

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    try {
      const response = await fetch('/api/admin/partners')
      const data = await response.json()

      if (response.ok) {
        setPartners(data.partners)
      }
    } catch (error) {
      console.error('Erro ao buscar parceiros:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingPartner(null)
    setFormData({
      name: '',
      type: 'client',
      logo_url: '',
    })
    setShowModal(true)
  }

  const openEditModal = (partner: Partner) => {
    setEditingPartner(partner)
    setFormData({
      name: partner.name,
      type: partner.type,
      logo_url: partner.logo_url || '',
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
      formDataUpload.append('folder', 'partners')

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      const data = await response.json()

      if (response.ok) {
        setFormData({ ...formData, logo_url: data.url })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingPartner
        ? `/api/admin/partners/${editingPartner.id}`
        : '/api/admin/partners'

      const method = editingPartner ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          display_order: editingPartner?.display_order ?? partners.length,
          is_active: true,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(editingPartner ? 'Atualizado com sucesso!' : 'Criado com sucesso!')
        setShowModal(false)
        fetchPartners()
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
    if (!confirm('Tem certeza que deseja excluir?')) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/admin/partners/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setPartners(partners.filter(p => p.id !== id))
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

  const handleToggleActive = async (partner: Partner) => {
    try {
      const response = await fetch(`/api/admin/partners/${partner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !partner.is_active }),
      })

      if (response.ok) {
        setPartners(partners.map(p =>
          p.id === partner.id ? { ...p, is_active: !p.is_active } : p
        ))
        toast.success(partner.is_active ? 'Desativado' : 'Ativado')
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status')
    }
  }

  const filteredPartners = filterType === 'all'
    ? partners
    : partners.filter(p => p.type === filterType)

  const partnerCount = partners.filter(p => p.type === 'partner').length
  const clientCount = partners.filter(p => p.type === 'client').length

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parceiros e Clientes</h1>
          <p className="text-gray-500 mt-1">Gerencie os logos exibidos no site</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/parceiros/migrar"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
          >
            <FolderInput className="w-5 h-5" />
            Migrar Existentes
          </Link>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Novo
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Handshake className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{partners.length}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{partnerCount}</p>
              <p className="text-sm text-gray-500">Parceiros</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{clientCount}</p>
              <p className="text-sm text-gray-500">Clientes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-gray-500">Filtrar:</span>
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterType === 'all'
              ? 'bg-amber-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilterType('partner')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterType === 'partner'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Parceiros
        </button>
        <button
          onClick={() => setFilterType('client')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterType === 'client'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Clientes
        </button>
      </div>

      {/* Partners Grid */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="text-center py-12">
            <Handshake className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum cadastro encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {filteredPartners.map((partner) => (
              <div
                key={partner.id}
                className={`relative bg-gray-50 rounded-xl p-4 group ${
                  !partner.is_active ? 'opacity-50' : ''
                }`}
              >
                {/* Logo */}
                <div className="aspect-video bg-white rounded-lg flex items-center justify-center overflow-hidden mb-3 border border-gray-100">
                  {partner.logo_url ? (
                    <Image
                      src={partner.logo_url}
                      alt={partner.name}
                      width={200}
                      height={100}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <Building2 className="w-12 h-12 text-gray-300" />
                  )}
                </div>

                {/* Name */}
                <p className="font-medium text-gray-900 text-sm truncate text-center">
                  {partner.name}
                </p>

                {/* Type Badge */}
                <div className="flex justify-center mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[partner.type]}`}>
                    {TYPE_LABELS[partner.type]}
                  </span>
                </div>

                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleToggleActive(partner)}
                    className={`p-2 rounded-lg transition-colors ${
                      partner.is_active
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                    title={partner.is_active ? 'Desativar' : 'Ativar'}
                  >
                    {partner.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEditModal(partner)}
                    className="p-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(partner.id)}
                    disabled={deleting === partner.id}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                    title="Excluir"
                  >
                    {deleting === partner.id ? (
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
                {editingPartner ? 'Editar' : 'Novo'} {formData.type === 'partner' ? 'Parceiro' : 'Cliente'}
              </h2>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'client' })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-colors ${
                      formData.type === 'client'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    Cliente
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'partner' })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-colors ${
                      formData.type === 'partner'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    Parceiro
                  </button>
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
                  placeholder="Nome da empresa"
                  required
                />
              </div>

              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo
                </label>

                {/* Preview */}
                {formData.logo_url && (
                  <div className="mb-3 p-4 bg-gray-50 rounded-lg">
                    <div className="aspect-video bg-white rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                      <Image
                        src={formData.logo_url}
                        alt="Preview"
                        width={300}
                        height={150}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logo_url: '' })}
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
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-black"
                    placeholder="https://exemplo.com/logo.png"
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
                  disabled={saving || !formData.name}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  {editingPartner ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
