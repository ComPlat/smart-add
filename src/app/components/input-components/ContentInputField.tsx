'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { debounce } from 'lodash'
import { ReactQuillHandle } from './ReactQuill'

const ReactQuill = dynamic(() => import('./ReactQuill'), {
  ssr: false,
  loading: () => <div className="h-32 animate-pulse bg-gray-100 rounded" />,
})

interface ContentInputFieldProps {
  fieldKey: string
  value: any
  updateMetadata: (key: string, value: any) => void
  readonly?: boolean
}

const ContentInputField = ({
  fieldKey,
  value,
  updateMetadata,
  readonly = false,
}: ContentInputFieldProps) => {
  const [content, setContent] = useState(value)
  const quillRef = useRef<ReactQuillHandle>(null)

  useEffect(() => {
    setContent(value)
  }, [value])

  // Debounced save - saves 1 second after user stops typing
  const debouncedSave = useCallback(
    debounce((newContent: any) => {
      if (JSON.stringify(newContent) !== JSON.stringify(value)) {
        updateMetadata(fieldKey, newContent)
      }
    }, 1000),
    [fieldKey, value, updateMetadata],
  )

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel()
    }
  }, [debouncedSave])

  const handleChange = (html: string, delta: any, source: any, editor: any) => {
    if (source === 'user') {
      const newContent = delta.ops ? editor.getContents() : html
      setContent(newContent)
      // Trigger debounced save
      debouncedSave(newContent)
    }
  }

  const handleBlur = () => {
    // Flush any pending debounced save immediately
    debouncedSave.flush()
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium capitalize text-gray-700">
        {fieldKey.replace(/_/g, ' ')}
      </label>
      <ReactQuill
        ref={quillRef}
        value={content}
        onChange={handleChange}
        onBlur={handleBlur}
        readOnly={readonly}
        theme="snow"
        className="bg-white"
      />
    </div>
  )
}

export default ContentInputField
