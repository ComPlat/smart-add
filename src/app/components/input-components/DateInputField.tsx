import { formatLabel } from '@/helper/utils'

interface DateInputFieldProps {
  autoFocus?: boolean
  className?: string
  id?: string
  name: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  raw?: boolean
  readonly?: boolean
  value?: string
}

const DateInputField: React.FC<DateInputFieldProps> = ({
  autoFocus = false,
  className = '',
  id,
  name,
  onChange,
  readonly = false,
  value = '',
}) => {
  const formattedValue = value ? value.slice(0, -1) : ''

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
        onChange={onChange}
        readOnly={readonly}
        type="datetime-local"
        value={formattedValue}
      />
    </label>
  )
}

export default DateInputField
