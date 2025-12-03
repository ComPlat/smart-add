'use client'

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

type Delta = {
  ops: any[]
}

type UnprivilegedEditor = {
  getHTML: () => string
  getLength: () => number
  getText: (index?: number, length?: number) => string
  getContents: (index?: number, length?: number) => Delta
  getSelection: (focus?: boolean) => { index: number; length: number } | null
  getBounds: (index: number, length?: number) => any
}

export interface ReactQuillProps {
  value?: string | Delta
  onChange?: (
    value: string,
    delta: Delta,
    source: 'api' | 'user' | 'silent',
    editor: UnprivilegedEditor,
  ) => void
  onBlur?: (
    range: { index: number; length: number } | null,
    source: 'api' | 'user' | 'silent',
    editor: UnprivilegedEditor,
  ) => void
  readOnly?: boolean
  placeholder?: string
  theme?: string
  className?: string
}

export interface ReactQuillHandle {
  getEditor: () => Quill
  focus: () => void
  blur: () => void
}

const ReactQuill = forwardRef<ReactQuillHandle, ReactQuillProps>(
  (
    {
      value,
      onChange,
      onBlur,
      readOnly,
      placeholder,
      theme = 'snow',
      className = '',
    },
    ref,
  ) => {
    const editorRef = useRef<Quill | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const makeUnprivilegedEditor = (editor: Quill): UnprivilegedEditor => ({
      getHTML: () => editor.root.innerHTML,
      getLength: () => editor.getLength(),
      getText: (index?: number, length?: number) =>
        editor.getText(index, length),
      getContents: (index?: number, length?: number) =>
        editor.getContents(index, length),
      getSelection: (focus?: boolean) => editor.getSelection(focus),
      getBounds: (index: number, length?: number) =>
        editor.getBounds(index, length),
    })

    // Initialize Quill
    useEffect(() => {
      if (!containerRef.current) {
        return
      }

      let editor: Quill

      // If editor already exists, reuse it; otherwise create new one
      if (editorRef.current) {
        editor = editorRef.current
      } else {
        editor = new Quill(containerRef.current, {
          theme,
          placeholder,
          readOnly,
          modules: {
            toolbar: [
              ['bold', 'italic', 'underline', 'strike'],
              ['blockquote', 'code-block'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              [{ script: 'sub' }, { script: 'super' }],
              [{ header: [1, 2, 3, false] }],
              ['clean'],
            ],
          },
        })

        editorRef.current = editor

        // Set initial value
        if (value) {
          if (typeof value === 'string') {
            editor.clipboard.dangerouslyPasteHTML(value)
          } else {
            editor.setContents(value as any)
          }
        }
      }

      // Set up event listeners (runs every time, even for existing editors)
      const handleTextChange = (delta: any, _oldDelta: any, source: any) => {
        if (onChange) {
          const unprivilegedEditor = makeUnprivilegedEditor(editor)
          onChange(editor.root.innerHTML, delta, source, unprivilegedEditor)
        }
      }

      editor.on('text-change', handleTextChange)

      // Handle blur
      editor.on('selection-change', (range, _oldRange, source) => {
        if (!range && onBlur) {
          const unprivilegedEditor = makeUnprivilegedEditor(editor)
          onBlur(range, source, unprivilegedEditor)
        }
      })

      return () => {
        editor.off('text-change', handleTextChange)
        editor.off('selection-change')
      }
    }, [])

    // Handle value changes from props
    useEffect(() => {
      if (!editorRef.current || value === undefined) return

      const editor = editorRef.current
      const currentContents = editor.getContents()

      // Check if value has actually changed
      const isDelta = (val: any): val is Delta =>
        val && typeof val === 'object' && 'ops' in val
      const isSame =
        isDelta(value) && isDelta(currentContents)
          ? JSON.stringify(value.ops) === JSON.stringify(currentContents.ops)
          : value === editor.root.innerHTML

      if (!isSame) {
        const selection = editor.getSelection()

        if (typeof value === 'string') {
          editor.clipboard.dangerouslyPasteHTML(value)
        } else {
          editor.setContents(value as any)
        }

        // Restore selection if possible
        if (selection) {
          setTimeout(() => {
            const length = editor.getLength()
            const safeIndex = Math.min(selection.index, length - 1)
            editor.setSelection(safeIndex, 0)
          }, 0)
        }
      }
    }, [value])

    // Handle readOnly changes
    useEffect(() => {
      if (!editorRef.current) return
      editorRef.current.enable(!readOnly)
    }, [readOnly])

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getEditor: () => {
        if (!editorRef.current) {
          throw new Error('Editor not initialized')
        }
        return editorRef.current
      },
      focus: () => editorRef.current?.focus(),
      blur: () => editorRef.current?.blur(),
    }))

    return (
      <div className={`quill-wrapper ${className}`}>
        <div ref={containerRef} />
      </div>
    )
  },
)

ReactQuill.displayName = 'ReactQuill'

export default ReactQuill
