'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { debounce } from 'lodash'

const ReactQuill = dynamic(() => import('./ReactQuill'), {
  ssr: false,
  loading: () => <div className="h-32 animate-pulse bg-gray-100 rounded" />,
})

interface ContentInputFieldProps {
  fieldKey: string
  value: any
  updateMetadata: (key: string, value: any, targetFullPath?: string) => void
  readonly?: boolean
  itemId?: string
}

const ContentInputField = ({
  fieldKey,
  value,
  updateMetadata,
  readonly = false,
  itemId,
}: ContentInputFieldProps) => {
  const [content, setContent] = useState(value)
  const savedItemIdRef = useRef(itemId)

  // Update ref when itemId changes
  useEffect(() => {
    savedItemIdRef.current = itemId
  }, [itemId])

  useEffect(() => {
    setContent(value)
  }, [value])

  // Debounced save - saves 1 second after user stops typing
  const debouncedSave = useRef(
    debounce((newContent: any, savedItemId: string) => {
      updateMetadata(fieldKey, newContent, savedItemId)
    }, 1000),
  ).current

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
      // Trigger debounced save with current itemId
      debouncedSave(newContent, savedItemIdRef.current || '')
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
