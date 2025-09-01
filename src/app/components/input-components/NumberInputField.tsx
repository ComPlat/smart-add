import { formatLabel } from '@/helper/utils'

interface NumberInputFieldProps {
  autoFocus?: boolean
  className?: string
  id?: string
  max?: number
  min?: number
  name: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  placeholder?: string
  readonly?: boolean
  step?: number
  value?: number
}

const NumberInputField: React.FC<NumberInputFieldProps> = ({
  autoFocus = false,
  className = '',
  id,
  max,
  min,
  name,
  onChange,
  readonly = false,
  step,
  value,
}) => {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const newValue = event.target.valueAsNumber
    if (!isNaN(newValue) || event.target.value === '') {
      onChange(event)
    }
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
        max={max}
        min={min}
        name={name}
        onChange={handleChange}
        onInput={(e) =>
          e.currentTarget.validity.valid ? null : (e.currentTarget.value = '')
        }
        placeholder="Enter number..."
        readOnly={readonly}
        step={step}
        title={value ? value.toString() : ''}
        type="number"
        value={value || ''}
      />
    </label>
  )
}

export default NumberInputField
