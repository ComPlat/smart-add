import { formatLabel } from '@/helper/utils'

interface NumberInputFieldProps {
  autoFocus?: boolean
  className?: string
  id?: string
  name: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  placeholder?: string
  readonly?: boolean
  value?: number
}

const NumberInputField: React.FC<NumberInputFieldProps> = ({
  autoFocus = false,
  className = '',
  id,
  name,
  onChange,
  readonly = false,
  value,
}) => (
  <label className="flex flex-col text-sm">
    <p className="font-bold">{formatLabel(name)}</p>
    <input
      className={`mt-2 rounded border px-2 py-1 outline-gray-200 focus:border-kit-primary-full 
      ${
        readonly
          ? 'cursor-not-allowed bg-gray-100 hover:border-inherit'
          : 'bg-white hover:border-kit-primary-full'
      } ${className}`}
      autoFocus={autoFocus}
      id={id}
      name={name}
      onChange={onChange}
      placeholder="Enter number..."
      readOnly={readonly}
      type="number"
      value={value || ''}
    />
  </label>
)

export default NumberInputField
