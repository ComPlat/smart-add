import { AutoComplete } from 'antd'
import { formatLabel } from '@/helper/utils'

export interface AutoCompleteOption {
  value: string
  label: string
}

interface AutoCompleteFieldProps {
  className?: string
  id?: string
  name: string
  onChange: (value: string) => void
  options: AutoCompleteOption[]
  placeholder?: string
  readonly?: boolean
  value?: string
}

const AutoCompleteField: React.FC<AutoCompleteFieldProps> = ({
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
      <div className="mt-2">
        <AutoComplete
          className={`custom-autocomplete ${className}`}
          disabled={readonly}
          id={id}
          onChange={onChange}
          options={options}
          placeholder={placeholder}
          value={value}
          filterOption={(inputValue, option) =>
            option?.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
          }
          style={{ width: '100%' }}
        />
      </div>
    </label>
  )
}

export default AutoCompleteField
