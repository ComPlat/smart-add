import { formatLabel } from '@/helper/utils'

interface CheckboxFieldProps {
  checked: boolean
  className?: string
  disabled?: boolean
  id?: string
  name: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  checked = false,
  className = '',
  disabled = false,
  id,
  name,
  onChange,
}) => (
  <label className="flex gap-2">
    <input
      checked={checked}
      className={`rounded border px-2 py-1 outline-gray-200 hover:border-kit-primary-full focus:border-kit-primary-full ${className}`}
      disabled={disabled}
      id={id}
      name={name}
      onChange={onChange}
      type="checkbox"
    />
    <p className="text-sm">{formatLabel(name)}</p>
  </label>
)

export default CheckboxField
