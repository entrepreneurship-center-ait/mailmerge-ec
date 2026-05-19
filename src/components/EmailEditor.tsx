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

  const toolbarBtn = (active: boolean) =>
    `rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
      active ? 'bg-[#f0a040]/10 text-[#f0a040]' : 'text-[#8e8e93] hover:bg-[#1e1e20] hover:text-[#f5f5f7]'
    }`

  return (
    <div className="rounded-xl border border-[#2a2a2e] bg-[#161618] overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[#2a2a2e] p-2">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={toolbarBtn(editor.isActive('bold'))}>
          <span className="font-bold">B</span>
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={toolbarBtn(editor.isActive('italic'))}>
          <span className="italic">I</span>
        </button>
        <button onClick={() => editor.chain().focus().toggleUnderline?.().run()} className={toolbarBtn(editor.isActive('underline'))}>
          <span className="underline">U</span>
        </button>
        <div className="mx-1 h-4 w-px bg-[#2a2a2e]" />
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={toolbarBtn(editor.isActive('heading', { level: 2 }))}>
          H2
        </button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={toolbarBtn(editor.isActive('bulletList'))}>
          &bull; List
        </button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={toolbarBtn(editor.isActive('orderedList'))}>
          1. List
        </button>
        <div className="mx-1 h-4 w-px bg-[#2a2a2e]" />
        <button onClick={addLink} className={toolbarBtn(false)}>Link</button>
        <button onClick={addImage} className={toolbarBtn(false)}>Image</button>
        <div className="mx-1 h-4 w-px bg-[#2a2a2e]" />
        <div className="relative">
          <button
            onClick={() => setShowPlaceholders(!showPlaceholders)}
            className="rounded-lg bg-[#f0a040]/10 px-2.5 py-1.5 text-xs font-medium text-[#f0a040] hover:bg-[#f0a040]/20 transition-all"
          >
            {'{{ }}'} Variable
          </button>
          {showPlaceholders && placeholders.length > 0 && (
            <div className="absolute left-0 top-full z-10 mt-1 w-52 rounded-xl border border-[#2a2a2e] bg-[#1e1e20] p-1.5 shadow-2xl">
              <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-[#636366]">Insert variable</p>
              {placeholders.map((p) => (
                <button
                  key={p}
                  onClick={() => insertPlaceholder(p)}
                  className="w-full rounded-lg px-3 py-1.5 text-left text-xs hover:bg-[#252528] transition-colors"
                >
                  <span className="font-mono text-[#f0a040]">{'{{'}{p}{'}}'}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="p-5 min-h-[320px] [&_.ProseMirror]:min-h-[320px] [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:text-[#f5f5f7] [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-[#3a3a3e] [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_h2]:text-lg [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h2]:text-[#f5f5f7] [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_a]:text-[#f0a040] [&_.ProseMirror_a]:underline [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded-lg [&_.ProseMirror_p]:text-[#d1d1d6] [&_.ProseMirror_li]:text-[#d1d1d6]"
      />
    </div>
  )
}
