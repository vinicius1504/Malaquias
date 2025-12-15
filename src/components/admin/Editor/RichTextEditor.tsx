'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { EditorToolbar } from './EditorToolbar'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Comece a escrever sua notícia...',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-amber-600 underline hover:text-amber-700',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: 'rounded-lg my-4 aspect-video w-full',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'prose prose-gray max-w-none min-h-[400px] p-4 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return (
      <div className="border border-gray-200 rounded-lg bg-white">
        <div className="h-12 border-b border-gray-200 bg-gray-50 animate-pulse" />
        <div className="min-h-[400px] p-4">
          <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <div className="relative z-10">
        <EditorToolbar editor={editor} />
      </div>
      <div className="overflow-hidden rounded-b-lg">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
