'use client'

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  memo,
  CSSProperties,
  KeyboardEvent,
} from 'react'
import { isEqual } from 'lodash'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

// Type definitions for Quill
type Sources = 'api' | 'user' | 'silent'
type Range = { index: number; length: number }
type Delta = {
  ops: any[]
  [key: string]: any
}

function postpone(fn: () => void) {
  Promise.resolve().then(fn)
}

const isDelta = (value: any): value is Delta => value && value.ops

const isEqualValue = (value: any, otherValue: any): boolean => {
  if (isDelta(value) && isDelta(otherValue)) {
    return isEqual(value.ops, otherValue.ops)
  }
  return isEqual(value, otherValue)
}

const makeUnprivilegedEditor = (editor: Quill) => ({
  getHTML: () => editor.root.innerHTML,
  getLength: editor.getLength.bind(editor),
  getText: editor.getText.bind(editor),
  getContents: editor.getContents.bind(editor),
  getSelection: editor.getSelection.bind(editor),
  getBounds: editor.getBounds.bind(editor),
})

const setEditorTabIndex = (editor: Quill, tabIndex: number) => {
  if (
    editor == null ||
    editor.scroll == null ||
    (editor.scroll as any).domNode == null
  ) {
    return
  }
  ;(editor.scroll as any).domNode.tabIndex = tabIndex
}

type UnprivilegedEditor = ReturnType<typeof makeUnprivilegedEditor>

export interface ReactQuillProps {
  bounds?: string | HTMLElement
  children?: React.ReactElement
  className?: string
  defaultValue?: string | Delta
  formats?: string[]
  id?: string
  modules?: Record<string, any>
  onChange?: (
    value: string,
    delta: Delta,
    source: Sources,
    editor: UnprivilegedEditor,
  ) => void
  onChangeSelection?: (
    range: Range,
    source: Sources,
    editor: UnprivilegedEditor,
  ) => void
  onFocus?: (range: Range, source: Sources, editor: UnprivilegedEditor) => void
  onBlur?: (
    range: Range | null,
    source: Sources,
    editor: UnprivilegedEditor,
  ) => void
  onKeyDown?: (event: KeyboardEvent) => void
  onKeyPress?: (event: KeyboardEvent) => void
  onKeyUp?: (event: KeyboardEvent) => void
  placeholder?: string
  preserveWhitespace?: boolean
  readOnly?: boolean
  scrollingContainer?: string | HTMLElement
  style?: CSSProperties
  tabIndex?: number
  theme?: string
  value?: string | Delta
}

export interface ReactQuillHandle {
  getEditor: () => Quill
  focus: () => void
  blur: () => void
}

const ReactQuill = forwardRef<ReactQuillHandle, ReactQuillProps>(
  (props, ref) => {
    const {
      bounds,
      children,
      className = '',
      defaultValue,
      formats,
      id,
      modules = {},
      onChange,
      onChangeSelection,
      onFocus,
      onBlur,
      onKeyDown,
      onKeyPress,
      onKeyUp,
      placeholder,
      preserveWhitespace,
      readOnly,
      scrollingContainer,
      style,
      tabIndex,
      theme = 'snow',
      value,
    } = props

    const [generation, setGeneration] = useState(0)
    const editorRef = useRef<Quill | null>(null)
    const editingAreaRef = useRef<any>(null)
    const unprivilegedEditorRef = useRef<UnprivilegedEditor | null>(null)
    const valueRef = useRef<string | Delta | undefined>(
      value !== undefined ? value : defaultValue,
    )
    const selectionRef = useRef<Range | null>(null)
    const lastDeltaChangeSetRef = useRef<Delta | null>(null)
    const regenerationSnapshotRef = useRef<{
      delta: Delta
      selection: Range | null
    } | null>(null)

    const dirtyProps = ['modules', 'formats', 'bounds', 'theme', 'children']

    // Validation
    useEffect(() => {
      if (
        lastDeltaChangeSetRef.current &&
        lastDeltaChangeSetRef.current === value
      ) {
        throw new Error(
          'You are passing the `delta` object from the `onChange` event ' +
            'back as `value`. You most probably want `editor.getContents()` instead.',
        )
      }

      if (children) {
        const childCount = React.Children.count(children)
        if (childCount > 1) {
          throw new Error(
            'The Quill editing area can only be composed of a single React element.',
          )
        }

        const child = React.Children.only(children)
        if (child && (child as any).type === 'textarea') {
          throw new Error(
            'Quill does not support editing on a <textarea>. Use a <div> instead.',
          )
        }
      }
    }, [value, children])

    const getEditorConfig = () => ({
      bounds,
      formats,
      modules,
      placeholder,
      readOnly,
      scrollingContainer,
      tabIndex,
      theme,
    })

    const setEditorContents = (editor: Quill, newValue: string | Delta) => {
      if (!editor) return

      valueRef.current = newValue
      const sel = selectionRef.current

      if (typeof newValue === 'string') {
        editor.clipboard.dangerouslyPasteHTML(newValue)
      } else {
        editor.setContents(newValue as any)
      }

      postpone(() => {
        if (sel && editor) {
          const length = editor.getLength()
          const safeRange = {
            index: Math.max(0, Math.min(sel.index, length - 1)),
            length: Math.max(0, Math.min(sel.length, length - 1 - sel.index)),
          }
          editor.setSelection(safeRange.index, safeRange.length)
          selectionRef.current = safeRange
        }
      })
    }

    const setEditorReadOnly = (editor: Quill, isReadOnly: boolean) => {
      if (isReadOnly) {
        editor.disable()
      } else {
        editor.enable()
      }
    }

    const onEditorChangeText = (
      htmlValue: string,
      delta: Delta,
      source: Sources,
      editor: UnprivilegedEditor,
    ) => {
      if (!editorRef.current) return

      const nextContents = isDelta(valueRef.current)
        ? editor.getContents()
        : editor.getHTML()

      if (!isEqualValue(nextContents, valueRef.current)) {
        lastDeltaChangeSetRef.current = delta
        valueRef.current = nextContents

        if (onChange) {
          onChange(htmlValue, delta, source, editor)
        }
      }
    }

    const onEditorChangeSelection = (
      nextSelection: Range | null,
      source: Sources,
      editor: UnprivilegedEditor,
    ) => {
      if (!editorRef.current) return

      const currentSelection = selectionRef.current
      const hasGainedFocus = !currentSelection && nextSelection
      const hasLostFocus = currentSelection && !nextSelection

      if (isEqual(nextSelection, currentSelection)) return

      selectionRef.current = nextSelection

      if (onChangeSelection) {
        onChangeSelection(nextSelection as Range, source, editor)
      }

      if (hasGainedFocus && onFocus && nextSelection) {
        onFocus(nextSelection, source, editor)
      } else if (hasLostFocus && onBlur) {
        onBlur(nextSelection, source, editor)
      }
    }

    const onEditorChange = (
      eventName: string,
      rangeOrDelta: Range | Delta,
      _oldRangeOrDelta: Range | Delta,
      source: Sources,
    ) => {
      if (
        eventName === 'text-change' &&
        editorRef.current &&
        unprivilegedEditorRef.current
      ) {
        onEditorChangeText(
          editorRef.current.root.innerHTML,
          rangeOrDelta as Delta,
          source,
          unprivilegedEditorRef.current,
        )
      } else if (
        eventName === 'selection-change' &&
        unprivilegedEditorRef.current
      ) {
        onEditorChangeSelection(
          rangeOrDelta as Range,
          source,
          unprivilegedEditorRef.current,
        )
      }
    }

    const createEditor = (element: any, config: any) => {
      const editor = new Quill(element, config)

      if (config.tabIndex != null) {
        setEditorTabIndex(editor, config.tabIndex)
      }

      // Hook editor events
      unprivilegedEditorRef.current = makeUnprivilegedEditor(editor)
      editor.on('editor-change', onEditorChange as any)

      return editor
    }

    const destroyEditor = () => {
      if (!editorRef.current) return
      editorRef.current.off('editor-change', onEditorChange as any)

      // Remove Quill-added DOM elements (toolbar and editor container)
      const container = editorRef.current.container
      if (container && container.parentNode) {
        // Remove all Quill-related elements
        const toolbar = container.parentNode.querySelector('.ql-toolbar')
        if (toolbar) {
          toolbar.remove()
        }
      }

      editorRef.current = null
    }

    // Initial mount
    useEffect(() => {
      if (!editingAreaRef.current || editorRef.current) return

      editorRef.current = createEditor(
        editingAreaRef.current,
        getEditorConfig(),
      )
      setEditorContents(editorRef.current, valueRef.current || '')

      return () => {
        destroyEditor()
      }
    }, [generation])

    // Handle value changes
    useEffect(() => {
      if (!editorRef.current || value === undefined) return

      const prevContents = valueRef.current
      const nextContents = value || ''

      if (!isEqualValue(nextContents, prevContents)) {
        setEditorContents(editorRef.current, nextContents)
      }
    }, [value])

    // Handle readOnly changes
    useEffect(() => {
      if (!editorRef.current || readOnly === undefined) return
      setEditorReadOnly(editorRef.current, readOnly)
    }, [readOnly])

    // Handle dirty props changes (require regeneration)
    const prevPropsRef = useRef(props)
    useEffect(() => {
      const prevProps = prevPropsRef.current
      prevPropsRef.current = props

      const shouldRegenerate = dirtyProps.some(
        (prop) => !isEqual((props as any)[prop], (prevProps as any)[prop]),
      )

      if (shouldRegenerate && editorRef.current) {
        const delta = editorRef.current.getContents()
        const selection = editorRef.current.getSelection()
        regenerationSnapshotRef.current = { delta, selection }

        destroyEditor()
        setGeneration((prev) => prev + 1)
      }
    }, [modules, formats, bounds, theme, children])

    // Restore after regeneration
    useEffect(() => {
      if (regenerationSnapshotRef.current && editorRef.current) {
        const { delta, selection } = regenerationSnapshotRef.current
        regenerationSnapshotRef.current = null

        editorRef.current.setContents(delta as any)
        postpone(() => {
          if (editorRef.current && selection) {
            editorRef.current.setSelection(selection.index, selection.length)
          }
        })
      }
    }, [generation])

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getEditor: () => {
        if (!editorRef.current) {
          throw new Error('Accessing non-instantiated editor')
        }
        return editorRef.current
      },
      focus: () => {
        if (editorRef.current) {
          editorRef.current.focus()
        }
      },
      blur: () => {
        if (editorRef.current) {
          selectionRef.current = null
          editorRef.current.blur()
        }
      },
    }))

    const renderEditingArea = () => {
      const properties = {
        ref: editingAreaRef,
      }

      if (children && React.Children.count(children)) {
        return React.cloneElement(React.Children.only(children), {
          ...properties,
          key: generation,
        } as any)
      }

      return preserveWhitespace ? (
        <pre key={generation} {...properties} />
      ) : (
        <div key={generation} className="quill-resize" {...properties} />
      )
    }

    return (
      <div
        id={id}
        style={style}
        key={generation}
        className={`quill ${className}`}
        onKeyPress={onKeyPress}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
      >
        {renderEditingArea()}
      </div>
    )
  },
)

ReactQuill.displayName = 'ReactQuill'

export default memo(ReactQuill)
