import { formatLabel } from '@/helper/utils'
import { useState } from 'react'
import SelectField from './SelectField'
import { allSolventOptions } from './solventOptions'
import { FaDeleteLeft } from 'react-icons/fa6'

export interface SolventItem {
  label: string
  smiles: string
  inchikey: string
  ratio: number
}

interface SolventInputFieldProps {
  name: string
  onChange: (newValue: SolventItem[]) => void
  readonly?: boolean
  values: SolventItem[]
}

const SolventInputField: React.FC<SolventInputFieldProps> = ({
  name,
  onChange,
  readonly = false,
  values = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const addSolventFromDropdown = (selectedOption: string) => {
    const option = allSolventOptions.find((opt) => opt.label === selectedOption)
    if (option) {
      const newSolvent: SolventItem = {
        label: option.value.external_label,
        smiles: option.value.smiles,
        inchikey: '',
        ratio: 1,
      }
      onChange([...values, newSolvent])
    }
  }

  const removeSolvent = (index: number) => {
    const newValues = values.filter((_, i) => i !== index)
    onChange(newValues)
  }

  const updateSolvent = (
    index: number,
    field: keyof SolventItem,
    value: string | number | undefined,
  ) => {
    const newValues = [...values]
    newValues[index] = { ...newValues[index], [field]: value }
    onChange(newValues)
  }

  const solventDropdownOptions = allSolventOptions.map((option) => ({
    value: option.label,
    label: option.label,
  }))

  return (
    <div className="flex flex-col text-sm">
      <div className="flex items-center justify-between">
        <p className="font-bold">{formatLabel(name)}</p>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-gray-500 hover:text-kit-primary-full"
        >
          {isExpanded ? 'Collapse' : `Expand (${values.length})`}
        </button>
      </div>

      {/* Solvent selection dropdown */}
      {!readonly && (
        <div className="mt-2">
          <SelectField
            name="add_solvent"
            options={solventDropdownOptions}
            placeholder="Select solvents or drag-n-drop molecules"
            value=""
            onChange={(e) => {
              if (e.target.value) {
                addSolventFromDropdown(e.target.value)
              }
            }}
          />
        </div>
      )}

      {/* Summary view when collapsed */}
      {!isExpanded && values.length > 0 && (
        <div className="mt-2 p-2 bg-gray-50 rounded border text-xs">
          {values.map((solvent, index) => (
            <div
              key={`summary-${solvent.inchikey}-${index}`}
              className="truncate"
            >
              {solvent.label || 'Unnamed solvent'} (ratio: {solvent.ratio})
            </div>
          ))}
        </div>
      )}

      {/* Detailed table view when expanded */}
      {isExpanded && values.length > 0 && (
        <div className="mt-2">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Label</th>
                <th className="border p-2 text-left">Ratio</th>
                <th className="border p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {values.map((solvent, index) => (
                <tr key={`${solvent.inchikey}-${index}`}>
                  <td className="border p-2">
                    <span className="text-xs">{solvent.label}</span>
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      value={solvent.ratio}
                      onChange={(e) =>
                        updateSolvent(
                          index,
                          'ratio',
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      readOnly={readonly}
                      step="0.1"
                      className={`w-full px-1 py-1 text-xs border ${
                        readonly
                          ? 'bg-gray-100 cursor-not-allowed'
                          : 'bg-transparent'
                      }`}
                    />
                  </td>
                  <td className="border p-2">
                    {!readonly && (
                      <button
                        type="button"
                        onClick={() => removeSolvent(index)}
                      >
                        <FaDeleteLeft className="text-red-500" size={20} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default SolventInputField
