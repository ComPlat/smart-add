import { formatLabel } from '@/helper/utils'

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
}) => {
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
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readonly}
        rows={rows}
        value={value}
      />
    </label>
  )
}

export default TextAreaInputField
