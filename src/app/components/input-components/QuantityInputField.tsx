import { formatLabel } from '@/helper/utils'
import { MetadataValue } from '@/database/db'

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
              readonly
                ? 'cursor-not-allowed bg-gray-100 hover:border-inherit'
                : 'bg-white hover:border-kit-primary-full'
            }`}
            disabled={readonly}
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

          {/* Custom chevron */}
          <svg
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </label>
  )
}

export default QuantityInputField
