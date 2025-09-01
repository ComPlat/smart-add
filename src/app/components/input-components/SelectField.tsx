import { formatLabel } from '@/helper/utils'

export interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  className?: string
  id?: string
  name: string
  onChange: React.ChangeEventHandler<HTMLSelectElement>
  options: SelectOption[]
  placeholder?: string
  readonly?: boolean
  value?: string
}

const SelectField: React.FC<SelectFieldProps> = ({
  className = '',
  id,
  name,
  onChange,
  options,
  placeholder,
  readonly = false,
  value = '',
}) => {
  return (
    <label className="flex flex-col text-sm">
      <p className="font-bold">{formatLabel(name)}</p>
      <select
        className={`mt-2 rounded border border-gray-300 px-2 py-1 outline-gray-200 focus:border-kit-primary-full
        ${
          readonly
            ? 'cursor-not-allowed bg-gray-100 hover:border-inherit'
            : 'bg-white hover:border-kit-primary-full'
        } ${className}`}
        disabled={readonly}
        id={id}
        name={name}
        onChange={onChange}
        value={value}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export default SelectField
