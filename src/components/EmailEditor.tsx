'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { useCallback, useState } from 'react'

interface EmailEditorProps {
  content: string
  onChange: (content: string) => void
  placeholders?: string[]
}

export default function EmailEditor({ content, onChange, placeholders = [] }: EmailEditorProps) {
  const [showPlaceholders, setShowPlaceholders] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Write your email here...' }),
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  const insertPlaceholder = useCallback((placeholder: string) => {
    if (!editor) return
    editor.commands.insertContent(`{{${placeholder}}}`)
    setShowPlaceholders(false)
  }, [editor])

  const addImage = useCallback(() => {
    if (!editor) return
    const url = window.prompt('Enter image URL:')
    if (url) editor.commands.setImage({ src: url })
  }, [editor])

  const addLink = useCallback(() => {
    if (!editor) return
    const url = window.prompt('Enter URL:')
    if (url) editor.commands.setLink({ href: url })
  }, [editor])

  if (!editor) return null

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 p-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded px-2 py-1 text-sm font-medium transition ${editor.isActive('bold') ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded px-2 py-1 text-sm italic transition ${editor.isActive('italic') ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
        >
          I
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline?.().run()}
          className={`rounded px-2 py-1 text-sm underline transition ${editor.isActive('underline') ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
        >
          U
        </button>
        <div className="mx-1 h-5 w-px bg-slate-300" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`rounded px-2 py-1 text-sm transition ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded px-2 py-1 text-sm transition ${editor.isActive('bulletList') ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
        >
          • List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rounded px-2 py-1 text-sm transition ${editor.isActive('orderedList') ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
        >
          1. List
        </button>
        <div className="mx-1 h-5 w-px bg-slate-300" />
        <button onClick={addLink} className="rounded px-2 py-1 text-sm hover:bg-slate-100">
          Link
        </button>
        <button onClick={addImage} className="rounded px-2 py-1 text-sm hover:bg-slate-100">
          Image
        </button>
        <div className="mx-1 h-5 w-px bg-slate-300" />
        <div className="relative">
          <button
            onClick={() => setShowPlaceholders(!showPlaceholders)}
            className="rounded bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100"
          >
            {'{{ }}'} Insert
          </button>
          {showPlaceholders && placeholders.length > 0 && (
            <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
              {placeholders.map((p) => (
                <button
                  key={p}
                  onClick={() => insertPlaceholder(p)}
                  className="w-full rounded px-3 py-1.5 text-left text-sm hover:bg-slate-100"
                >
                  <span className="font-mono text-blue-600">{'{{'}{p}{'}}'}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="p-4 min-h-[300px] focus:outline-none [&_.ProseMirror]:min-h-[300px] [&_.ProseMirror]:focus:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-slate-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_a]:text-blue-600 [&_.ProseMirror_a]:underline [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded"
      />
    </div>
  )
}
