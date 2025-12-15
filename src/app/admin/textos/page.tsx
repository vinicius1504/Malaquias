'use client'

import { useState, useEffect } from 'react'
import {
  Globe,
  FileText,
  Save,
  Loader2,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Check,
  Download,
  Upload,
} from 'lucide-react'

interface TranslationFile {
  locale: string
  files: string[]
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

const LOCALE_NAMES: Record<string, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español'
}

const FILE_NAMES: Record<string, string> = {
  home: 'Página Inicial',
  about: 'Sobre Nós',
  services: 'Serviços',
  servicesPages: 'Páginas de Serviços',
  contact: 'Contato',
  news: 'Notícias',
  common: 'Textos Comuns',
  faq: 'FAQ'
}

export default function TextosPage() {
  const [translations, setTranslations] = useState<TranslationFile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLocale, setSelectedLocale] = useState<string>('pt')
  const [selectedFile, setSelectedFile] = useState<string>('')
  const [content, setContent] = useState<Record<string, JsonValue> | null>(null)
  const [loadingContent, setLoadingContent] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchTranslations()
  }, [])

  useEffect(() => {
    if (selectedLocale && selectedFile) {
      fetchContent()
    }
  }, [selectedLocale, selectedFile])

  const fetchTranslations = async () => {
    try {
      const response = await fetch('/api/admin/translations')
      const data = await response.json()

      if (response.ok) {
        setTranslations(data.translations)
        // Selecionar primeiro arquivo disponível
        const ptFiles = data.translations.find((t: TranslationFile) => t.locale === 'pt')
        if (ptFiles && ptFiles.files.length > 0) {
          setSelectedFile(ptFiles.files[0])
        }
      }
    } catch (error) {
      console.error('Erro ao buscar traduções:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchContent = async () => {
    try {
      setLoadingContent(true)
      const response = await fetch(`/api/admin/translations?locale=${selectedLocale}&file=${selectedFile}`)
      const data = await response.json()

      if (response.ok) {
        setContent(data.content)
        // Expandir primeiro nível por padrão
        const firstLevelKeys = Object.keys(data.content)
        setExpandedKeys(new Set(firstLevelKeys))
      }
    } catch (error) {
      console.error('Erro ao buscar conteúdo:', error)
    } finally {
      setLoadingContent(false)
    }
  }

  const handleSave = async () => {
    if (!content) return

    try {
      setSaving(true)
      setSaveMessage(null)

      const response = await fetch('/api/admin/translations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale: selectedLocale,
          file: selectedFile,
          content
        })
      })

      if (response.ok) {
        setSaveMessage({ type: 'success', text: 'Arquivo salvo com sucesso!' })
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        setSaveMessage({ type: 'error', text: 'Erro ao salvar arquivo' })
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setSaveMessage({ type: 'error', text: 'Erro ao salvar arquivo' })
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    if (!content) return

    const jsonString = JSON.stringify(content, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedFile}_${selectedLocale}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setSaveMessage({ type: 'success', text: 'Arquivo exportado com sucesso!' })
    setTimeout(() => setSaveMessage(null), 3000)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const importedContent = JSON.parse(text)

        // Validar se é um objeto
        if (typeof importedContent !== 'object' || importedContent === null || Array.isArray(importedContent)) {
          setSaveMessage({ type: 'error', text: 'Arquivo inválido. Deve ser um objeto JSON.' })
          return
        }

        setContent(importedContent)
        // Expandir primeiro nível
        const firstLevelKeys = Object.keys(importedContent)
        setExpandedKeys(new Set(firstLevelKeys))

        setSaveMessage({ type: 'success', text: 'Arquivo importado! Clique em "Salvar Alterações" para confirmar.' })
        setTimeout(() => setSaveMessage(null), 5000)
      } catch {
        setSaveMessage({ type: 'error', text: 'Erro ao ler arquivo. Verifique se é um JSON válido.' })
      }
    }

    input.click()
  }

  const toggleExpanded = (key: string) => {
    const newExpanded = new Set(expandedKeys)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedKeys(newExpanded)
  }

  const updateValue = (path: string[], value: string) => {
    if (!content) return

    const newContent = JSON.parse(JSON.stringify(content))
    let current: Record<string, JsonValue> = newContent

    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]] as Record<string, JsonValue>
    }

    current[path[path.length - 1]] = value
    setContent(newContent)
  }

  const renderValue = (value: JsonValue, path: string[] = [], level: number = 0): React.ReactNode => {
    const key = path.join('.')

    if (value === null) {
      return <span className="text-black italic">null</span>
    }

    if (typeof value === 'string') {
      const isLongText = value.length > 100
      return (
        <div className="flex-1">
          {isLongText ? (
            <textarea
              value={value}
              onChange={(e) => updateValue(path, e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-black resize-y min-h-[80px]"
              rows={3}
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => updateValue(path, e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-black"
            />
          )}
        </div>
      )
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return (
        <input
          type="text"
          value={String(value)}
          onChange={(e) => updateValue(path, e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-black"
        />
      )
    }

    if (Array.isArray(value)) {
      const isExpanded = expandedKeys.has(key)
      return (
        <div className="w-full">
          <button
            onClick={() => toggleExpanded(key)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span className="font-medium">Array [{value.length} itens]</span>
          </button>
          {isExpanded && (
            <div className="ml-4 mt-2 space-y-2 border-l-2 border-gray-100 pl-4">
              {value.map((item, index) => (
                <div key={index} className="space-y-1">
                  <span className="text-xs text-gray-400">[{index}]</span>
                  {renderValue(item, [...path, String(index)], level + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (typeof value === 'object') {
      const isExpanded = expandedKeys.has(key)
      const entries = Object.entries(value)

      return (
        <div className="w-full">
          <button
            onClick={() => toggleExpanded(key)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span className="font-medium">Objeto {`{${entries.length} campos}`}</span>
          </button>
          {isExpanded && (
            <div className="ml-4 mt-2 space-y-3 border-l-2 border-gray-100 pl-4">
              {entries.map(([k, v]) => (
                <div key={k}>
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-medium text-gray-700 min-w-[120px] pt-2">
                      {k}
                    </span>
                    {renderValue(v, [...path, k], level + 1)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    return null
  }

  const currentFiles = translations.find(t => t.locale === selectedLocale)?.files || []

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Textos do Site</h1>
          <p className="text-gray-500 mt-1">Gerencie os textos de todas as páginas por idioma</p>
        </div>

        {content && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              title="Exportar JSON para edição externa (ex: IA)"
            >
              <Download className="w-5 h-5" />
              Exportar
            </button>
            <button
              onClick={handleImport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              title="Importar JSON editado"
            >
              <Upload className="w-5 h-5" />
              Importar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Salvar
            </button>
          </div>
        )}
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            saveMessage.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {saveMessage.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {saveMessage.text}
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          {/* Locale Selector */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Idioma
            </h3>
            <div className="space-y-1">
              {translations.map((t) => (
                <button
                  key={t.locale}
                  onClick={() => setSelectedLocale(t.locale)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedLocale === t.locale
                      ? 'bg-amber-100 text-amber-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {LOCALE_NAMES[t.locale] || t.locale}
                </button>
              ))}
            </div>
          </div>

          {/* File Selector */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Página
            </h3>
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
              </div>
            ) : (
              <div className="space-y-1">
                {currentFiles.map((file) => (
                  <button
                    key={file}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedFile === file
                        ? 'bg-amber-100 text-amber-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {FILE_NAMES[file] || file}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Editor */}
        <div className="flex-1">
          <div className="bg-white border border-gray-200 rounded-xl">
            {/* Content Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">
                {FILE_NAMES[selectedFile] || selectedFile}
              </h2>
              <p className="text-sm text-gray-500">
                {LOCALE_NAMES[selectedLocale]} • {selectedFile}.json
              </p>
            </div>

            {/* Content Body */}
            <div className="p-6">
              {loadingContent ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
              ) : content ? (
                <div className="space-y-4">
                  {Object.entries(content).map(([key, value]) => (
                    <div key={key} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-sm font-semibold text-gray-800 min-w-[120px] pt-2">
                          {key}
                        </span>
                        {renderValue(value, [key], 0)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione um arquivo para editar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
