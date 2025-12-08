import { formatLabel } from '@/helper/utils'
import React, { useState, useRef, useEffect } from 'react'
import { debounce } from 'lodash'

interface TextAreaInputFieldProps {
  autoFocus?: boolean
  className?: string
  id?: string
  name: string
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>
  placeholder?: string
  readonly: boolean
  rows?: number
  value?: string
  itemId?: string // Full path of the item this field belongs to
}
const TextAreaInputField: React.FC<TextAreaInputFieldProps> = ({
  autoFocus = false,
  className = '',
  id,
  name,
  onChange,
  placeholder = 'Enter text...',
  readonly = false,
  rows = 3,
  value = '',
  itemId,
}) => {
  const [description, setDescription] = useState(value)

  const debouncedSave = useRef(
    debounce((value: string, name: string, savedItemId: string) => {
      const syntheticEvent = {
        target: { value, name, dataset: { itemId: savedItemId } },
      } as any
      onChange(syntheticEvent)
    }, 500),
  ).current

  // Update local state when value prop changes (switching items)
  useEffect(() => {
    setDescription(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value)
    debouncedSave(e.target.value, e.target.name, itemId || '')
  }

  return (
    <label className="flex flex-col text-sm">
      <p className="font-bold">{formatLabel(name)}</p>
      <textarea
        className={`mt-2 rounded border border-gray-300 px-2 py-1 outline-gray-200 focus:border-kit-primary-full resize-vertical
        ${
          readonly
            ? 'cursor-not-allowed bg-gray-100 hover:border-inherit'
            : 'bg-white hover:border-kit-primary-full'
        } ${className}`}
        autoFocus={autoFocus}
        id={id}
        name={name}
        placeholder={placeholder}
        readOnly={readonly}
        rows={rows}
        onChange={handleChange}
        value={description}
      />
    </label>
  )
}

export default TextAreaInputField
