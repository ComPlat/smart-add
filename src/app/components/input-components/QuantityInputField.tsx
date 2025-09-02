import { formatLabel } from '@/helper/utils'
import { MetadataValue } from '@/database/db'
import { ChevronDownIcon } from '../workspace/icons/ChevronDownIcon'

interface QuantityInputFieldProps {
  valueKey: string
  unitKey: string
  value?: number
  unit?: string
  readonly?: boolean
  onValueChange: (e: React.ChangeEvent<HTMLInputElement>, key: string) => void
  onUnitChange: (e: React.ChangeEvent<HTMLSelectElement>, key: string) => void
  metadata?: Record<string, MetadataValue>
}

const unitOptions: Record<string, string[]> = {
  // Mass units
  mass: ['mg', 'g', 'μg'],
  // Volume units
  volume: ['μL', 'mL', 'L'],
  // Molarity units
  molarity: ['μM', 'mM', 'M'],
  // General units
  amount: ['mg', 'g', 'kg', 'μL', 'mL', 'L', 'μM', 'mM', 'M'],
}

const getUnitCategory = (fieldName: string): string => {
  if (fieldName.includes('molarity')) return 'molarity'
  if (fieldName.includes('density')) return 'mass'
  if (fieldName.includes('amount')) return 'amount'
  return 'amount'
}

const getDefaultUnit = (category: string): string => {
  switch (category) {
    case 'molarity':
      return 'M'
    case 'mass':
      return 'mg'
    case 'amount':
      return 'mg'
    default:
      return 'mg'
  }
}

const QuantityInputField: React.FC<QuantityInputFieldProps> = ({
  valueKey,
  unitKey,
  value,
  unit,
  readonly = false,
  onValueChange,
  onUnitChange,
}) => {
  const category = getUnitCategory(valueKey)
  const availableUnits = unitOptions[category] || unitOptions.amount
  const defaultUnit = getDefaultUnit(category)
  const isMolarityField = category === 'molarity'

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.valueAsNumber
    if (!isNaN(newValue) || e.target.value === '') {
      onValueChange(e, valueKey)
    }
  }

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUnitChange(e, unitKey)
  }

  // Extract base name for label (e.g., "target_amount_value" -> "Target Amount")
  const baseName = valueKey.replace(/_value$/, '').replace(/_unit$/, '')

  // Determine if this field should only accept positive values
  const isPositiveOnly = valueKey === 'molarity_value' || valueKey === 'density'

  return (
    <label className="flex flex-col text-sm">
      <p className="font-bold">{formatLabel(baseName)}</p>
      <div className="mt-2 flex gap-2">
        <input
          className={`flex-1 rounded border border-gray-300 px-2 py-1 outline-gray-200 focus:border-kit-primary-full
          ${
            readonly
              ? 'cursor-not-allowed bg-gray-100 hover:border-inherit'
              : 'bg-white hover:border-kit-primary-full'
          }`}
          min={isPositiveOnly ? 0 : undefined}
          name={valueKey}
          onChange={handleValueChange}
          placeholder="Enter number..."
          readOnly={readonly}
          type="number"
          value={value ?? ''}
        />
        <div className="relative">
          <select
            className={`w-20 appearance-none rounded border border-gray-300 px-2 py-1 pr-8 outline-gray-200 focus:border-kit-primary-full focus:outline-none
            ${
              readonly || isMolarityField
                ? 'cursor-not-allowed bg-gray-100 hover:border-inherit'
                : 'bg-white hover:border-kit-primary-full'
            }`}
            disabled={readonly || isMolarityField}
            name={unitKey}
            onChange={handleUnitChange}
            value={unit || defaultUnit}
          >
            {availableUnits.map((unitOption) => (
              <option key={unitOption} value={unitOption}>
                {unitOption}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="w-2 h-2 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 flex-shrink-0" />
        </div>
      </div>
    </label>
  )
}

export default QuantityInputField
