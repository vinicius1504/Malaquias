'use client'

import { useState } from 'react'
import { Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Youtube,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Minus,
} from 'lucide-react'

interface EditorToolbarProps {
  editor: Editor
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [showImageInput, setShowImageInput] = useState(false)
  const [showYoutubeInput, setShowYoutubeInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl('')
      setShowLinkInput(false)
    }
  }

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl('')
      setShowImageInput(false)
    }
  }

  const addYoutube = () => {
    if (youtubeUrl) {
      editor.chain().focus().setYoutubeVideo({ src: youtubeUrl }).run()
      setYoutubeUrl('')
      setShowYoutubeInput(false)
    }
  }

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
  }: {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    children: React.ReactNode
    title: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-amber-100 text-amber-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )

  const Divider = () => <div className="w-px h-6 bg-gray-200 mx-1" />

  return (
    <div className="border-b border-gray-200 bg-gray-50 p-2">
      <div className="flex flex-wrap items-center gap-1">
        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Desfazer (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Refazer (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Título H2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Título H3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Negrito (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Itálico (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Sublinhado (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Riscado"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Alinhar à esquerda"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Centralizar"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Alinhar à direita"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Lista com marcadores"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Lista numerada"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Citação"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Linha horizontal"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <div className="relative">
          <ToolbarButton
            onClick={() => {
              if (editor.isActive('link')) {
                editor.chain().focus().unsetLink().run()
              } else {
                setShowLinkInput(!showLinkInput)
                setShowImageInput(false)
                setShowYoutubeInput(false)
              }
            }}
            isActive={editor.isActive('link')}
            title="Inserir link"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>

          {showLinkInput && (
            <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-72">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://exemplo.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                onKeyDown={(e) => e.key === 'Enter' && addLink()}
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={addLink}
                  className="flex-1 px-3 py-1.5 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600"
                >
                  Inserir
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkInput(false)}
                  className="px-3 py-1.5 text-gray-600 text-sm hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Image */}
        <div className="relative">
          <ToolbarButton
            onClick={() => {
              setShowImageInput(!showImageInput)
              setShowLinkInput(false)
              setShowYoutubeInput(false)
            }}
            title="Inserir imagem"
          >
            <ImageIcon className="w-4 h-4" />
          </ToolbarButton>

          {showImageInput && (
            <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-72">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="URL da imagem"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                onKeyDown={(e) => e.key === 'Enter' && addImage()}
              />
              <p className="text-xs text-gray-500 mt-1">
                Cole a URL de uma imagem do Supabase Storage
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={addImage}
                  className="flex-1 px-3 py-1.5 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600"
                >
                  Inserir
                </button>
                <button
                  type="button"
                  onClick={() => setShowImageInput(false)}
                  className="px-3 py-1.5 text-gray-600 text-sm hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* YouTube */}
        <div className="relative">
          <ToolbarButton
            onClick={() => {
              setShowYoutubeInput(!showYoutubeInput)
              setShowLinkInput(false)
              setShowImageInput(false)
            }}
            title="Inserir vídeo do YouTube"
          >
            <Youtube className="w-4 h-4" />
          </ToolbarButton>

          {showYoutubeInput && (
            <div className="absolute top-full right-0 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-80">
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                onKeyDown={(e) => e.key === 'Enter' && addYoutube()}
              />
              <p className="text-xs text-gray-500 mt-1">
                Cole o link do vídeo do YouTube
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={addYoutube}
                  className="flex-1 px-3 py-1.5 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600"
                >
                  Inserir
                </button>
                <button
                  type="button"
                  onClick={() => setShowYoutubeInput(false)}
                  className="px-3 py-1.5 text-gray-600 text-sm hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
