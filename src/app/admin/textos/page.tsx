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
  FolderDown,
} from 'lucide-react'
import JSZip from 'jszip'

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
  contact: 'Contato',
  common: 'Textos Comuns',
  faq: 'FAQ'
}

// Labels amigáveis para campos comuns
const FIELD_LABELS: Record<string, string> = {
  pageTitle: 'Título da Página',
  title: 'Título',
  subtitle: 'Subtítulo',
  description: 'Descrição',
  content: 'Conteúdo',
  text: 'Texto',
  button: 'Botão',
  buttonText: 'Texto do Botão',
  link: 'Link',
  linkText: 'Texto do Link',
  name: 'Nome',
  email: 'E-mail',
  phone: 'Telefone',
  address: 'Endereço',
  message: 'Mensagem',
  placeholder: 'Placeholder',
  label: 'Rótulo',
  hero: 'Banner Principal',
  cta: 'Chamada para Ação',
  features: 'Recursos',
  items: 'Itens',
  question: 'Pergunta',
  answer: 'Resposta',
  history: 'Nossa História',
  mission: 'Missão',
  vision: 'Visão',
  values: 'Valores',
  team: 'Equipe',
  testimonials: 'Depoimentos',
  partners: 'Parceiros',
  clients: 'Clientes',
  services: 'Serviços',
  contact: 'Contato',
  about: 'Sobre',
  footer: 'Rodapé',
  header: 'Cabeçalho',
  menu: 'Menu',
  nav: 'Navegação',
  form: 'Formulário',
  success: 'Sucesso',
  error: 'Erro',
  loading: 'Carregando',
  send: 'Enviar',
  submit: 'Enviar',
  cancel: 'Cancelar',
  close: 'Fechar',
  back: 'Voltar',
  next: 'Próximo',
  previous: 'Anterior',
  readMore: 'Leia Mais',
  seeMore: 'Ver Mais',
  learnMore: 'Saiba Mais',
  accordion: 'Seções Expansíveis',
  cards: 'Cards',
  list: 'Lista',
  grid: 'Grade',
  section: 'Seção',
  intro: 'Introdução',
  outro: 'Conclusão',
  quote: 'Citação',
  author: 'Autor',
  date: 'Data',
  category: 'Categoria',
  tags: 'Tags',
  icon: 'Ícone',
  image: 'Imagem',
  imageAlt: 'Texto Alternativo da Imagem',
  meta: 'Meta Dados',
  seo: 'SEO',
  keywords: 'Palavras-chave',
}

// Função para obter label amigável
const getFieldLabel = (key: string): string => {
  // Primeiro verifica se existe um label direto
  if (FIELD_LABELS[key]) return FIELD_LABELS[key]

  // Transforma camelCase em palavras separadas com primeira letra maiúscula
  const formatted = key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()

  return formatted
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

  const handleExportAll = async () => {
    try {
      setSaveMessage({ type: 'success', text: 'Gerando ZIP com todos os arquivos...' })

      const zip = new JSZip()
      const locales = ['pt', 'en', 'es']

      for (const locale of locales) {
        const localeFiles = translations.find(t => t.locale === locale)?.files || []

        for (const file of localeFiles) {
          const res = await fetch(`/api/admin/translations?locale=${locale}&file=${file}`)
          if (res.ok) {
            const data = await res.json()
            zip.file(
              `locales/${locale}/${file}.json`,
              JSON.stringify(data.content, null, 2)
            )
          }
        }
      }

      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `locales_${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setSaveMessage({ type: 'success', text: 'ZIP exportado com sucesso!' })
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('Erro ao exportar ZIP:', error)
      setSaveMessage({ type: 'error', text: 'Erro ao gerar ZIP' })
    }
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
      return <span className="text-gray-400 italic text-sm">Vazio</span>
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

    // Para arrays - mostrar como lista de cards
    if (Array.isArray(value)) {
      const isExpanded = expandedKeys.has(key)
      return (
        <div className="w-full">
          <button
            onClick={() => toggleExpanded(key)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span className="font-medium text-amber-600">{value.length} {value.length === 1 ? 'item' : 'itens'}</span>
          </button>
          {isExpanded && (
            <div className="space-y-3">
              {value.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                    <span className="w-6 h-6 flex items-center justify-center bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                      Item {index + 1}
                    </span>
                  </div>
                  {renderValue(item, [...path, String(index)], level + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    // Para objetos - mostrar campos de forma mais limpa
    if (typeof value === 'object') {
      const entries = Object.entries(value)

      // Mostrar diretamente os campos sem botão de expansão
      return (
        <div className="w-full space-y-4">
          {entries.map(([k, v]) => {
            const isNestedObject = typeof v === 'object' && v !== null && !Array.isArray(v)
            const isNestedArray = Array.isArray(v)

            return (
              <div key={k}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {getFieldLabel(k)}
                </label>
                {isNestedObject ? (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    {renderValue(v, [...path, k], level + 1)}
                  </div>
                ) : isNestedArray ? (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    {renderValue(v, [...path, k], level + 1)}
                  </div>
                ) : (
                  renderValue(v, [...path, k], level + 1)
                )}
              </div>
            )
          })}
        </div>
      )
    }

    return null
  }

  // Filtrar arquivos que não devem aparecer (news vem do banco, servicesPages é duplicado)
  const currentFiles = (translations.find(t => t.locale === selectedLocale)?.files || [])
    .filter(file => !['news', 'servicesPages'].includes(file))

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
              onClick={handleExportAll}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors"
              title="Exportar pasta locales completa como ZIP"
            >
              <FolderDown className="w-5 h-5" />
              Exportar Tudo
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              title="Exportar apenas este arquivo JSON"
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
              <h2 className="font-semibold text-2xl text-gray-900">
                {FILE_NAMES[selectedFile] || selectedFile}
              </h2>
              <p className="text-xs text-gray-500">
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
                <div className="space-y-6">
                  {Object.entries(content).map(([key, value]) => {
                    const isSimpleValue = typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'

                    return (
                      <div key={key} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        {/* Section Header */}
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <h3 className="font-semibold text-2xl text-gray-800">
                            {getFieldLabel(key)}
                          </h3>
                        </div>

                        {/* Section Content */}
                        <div className="p-4">
                          {isSimpleValue ? (
                            renderValue(value, [key], 0)
                          ) : (
                            renderValue(value, [key], 0)
                          )}
                        </div>
                      </div>
                    )
                  })}
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
