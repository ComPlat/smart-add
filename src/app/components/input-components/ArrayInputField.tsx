import { formatLabel } from '@/helper/utils'

interface ArrayInputFieldProps {
  name: string
  onChange: (newValues: string[]) => void
  readonly: boolean
  values: string[]
}

const datalists: Record<string, string[]> = {
  dangerous_products: [
    'Causes cancer',
    'Mutagenic',
    'Damage to environment',
    'Explosive (Class 1)',
    'Pressure (Class 2)',
    'Flammable liquid (Class 3)',
    'Flammable solid (Class 4.1)',
    'Self-flammable solid (Class 4.2)',
    'Flammable/contact with water (Class 4.3)',
    'Oxidizing (Class 5.1)',
    'Peroxides (Class 5.2)',
    'Toxic and very toxic (Class 6.1)',
    'Infective (Class 6.2)',
    'Radioactive (Class 7)',
    'Corrosive (Class 8)',
    'Diverse (Class 9)',
  ],
  purification: [
    'Flash-Chromatography',
    'TLC',
    'HPLC',
    'Extraction',
    'Distillation',
    'Dialysis',
    'Filtration',
    'Sublimation',
    'Crystallisation',
    'Recrystallisation',
    'Precipitation',
  ],
}

const ArrayInputField: React.FC<ArrayInputFieldProps> = ({
  name,
  onChange,
  values,
}) => {
  const datalistValues = datalists[name] || []

  const handleItemChange = (value: string, index: number) => {
    const newValues = [...values]
    newValues[index] = value
    onChange(newValues)
  }

  const handleAddItem = () => {
    onChange([...values, ''])
  }

  const handleRemoveItem = (index: number) => {
    const newValues = values.filter((_, i) => i !== index)
    onChange(newValues)
  }

  return (
    <label className="flex flex-col text-sm">
      <p className="font-bold">{formatLabel(name)}</p>
      {values.map((value, index) => (
        <div className="mb-1 flex items-center" key={index}>
          <input
            className="mr-2 flex-1 rounded border border-gray-300 px-2 py-1 outline-gray-200 focus:border-kit-primary-full"
            list={`${name}-options-${index}`}
            onChange={(e) => handleItemChange(e.target.value, index)}
            value={value}
          />
          {datalistValues.length > 0 && (
            <datalist id={`${name}-options-${index}`}>
              {datalistValues.map((value) => (
                <option key={value} value={value} />
              ))}
            </datalist>
          )}
          <button
            className="rounded bg-red-600 px-2 py-1 text-sm text-white duration-150 
            hover:bg-red-400"
            onClick={() => handleRemoveItem(index)}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        className="mt-2 rounded bg-kit-primary-full px-2 py-1 text-sm text-white duration-150 hover:bg-kit-primary-full/90"
        onClick={handleAddItem}
      >
        Add Item
      </button>
    </label>
  )
}

export default ArrayInputField
