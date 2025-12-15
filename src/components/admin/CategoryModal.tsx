'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CategoryModal({ isOpen, onClose, onSuccess }: CategoryModalProps) {
  const [saving, setSaving] = useState(false)
  const [name_pt, setNamePt] = useState('')
  const [name_en, setNameEn] = useState('')
  const [name_es, setNameEs] = useState('')
  const [slug, setSlug] = useState('')
  const [color, setColor] = useState('#C9983A')

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (value: string) => {
    setNamePt(value)
    if (!slug || slug === generateSlug(name_pt)) {
      setSlug(generateSlug(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name_pt.trim() || !slug.trim()) {
      alert('Nome e slug são obrigatórios')
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name_pt,
          name_en: name_en || null,
          name_es: name_es || null,
          slug,
          color,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
        handleClose()
      } else {
        alert(data.error || 'Erro ao criar categoria')
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
      alert('Erro ao criar categoria')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setNamePt('')
    setNameEn('')
    setNameEs('')
    setSlug('')
    setColor('#C9983A')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Nova Categoria</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome PT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome (Português) *
            </label>
            <input
              type="text"
              value={name_pt}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex: Tecnologia"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="Ex: tecnologia"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 font-mono text-sm"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Identificador único (letras minúsculas, números e hífens)
            </p>
          </div>

          {/* Nome EN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome (Inglês)
            </label>
            <input
              type="text"
              value={name_en}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="Ex: Technology"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          {/* Nome ES */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome (Espanhol)
            </label>
            <input
              type="text"
              value={name_es}
              onChange={(e) => setNameEs(e.target.value)}
              placeholder="Ex: Tecnología"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          {/* Cor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cor
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Criar Categoria
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
