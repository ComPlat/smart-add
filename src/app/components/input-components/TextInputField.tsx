import { formatLabel } from '@/helper/utils'

interface TextInputFieldProps {
  autoFocus?: boolean
  className?: string
  id?: string
  name: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  placeholder?: string
  readonly: boolean
  value?: string
  itemId?: string
}

const TextInputField: React.FC<TextInputFieldProps> = ({
  autoFocus = false,
  className = '',
  id,
  name,
  onChange,
  placeholder = 'Enter text...',
  readonly = false,
  value = '',
  itemId,
}) => {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    // Add itemId to dataset if provided
    if (itemId) {
      ;(event.target as any).dataset.itemId = itemId
    }
    onChange(event)
  }

  return (
    <label className="flex flex-col text-sm">
      <p className="font-bold">{formatLabel(name)}</p>
      <input
        className={`mt-2 rounded border border-gray-300 px-2 py-1 outline-gray-200 focus:border-kit-primary-full
        ${
          readonly
            ? 'cursor-not-allowed bg-gray-100 hover:border-inherit'
            : 'bg-white hover:border-kit-primary-full'
        } ${className}`}
        autoFocus={autoFocus}
        id={id}
        name={name}
        onChange={handleChange}
        placeholder={placeholder}
        readOnly={readonly}
        type="text"
        value={value}
      />
    </label>
  )
}

export default TextInputField
