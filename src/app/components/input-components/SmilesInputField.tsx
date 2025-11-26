import { formatLabel } from '@/helper/utils'
import { validateSMILES } from '../utils/molValidation'
import { useState, useEffect } from 'react'

interface SmilesInputFieldProps {
  name: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  readonly: boolean
  value?: string
  onValidationChange?: (isValid: boolean) => void
}

const SmilesInputField: React.FC<SmilesInputFieldProps> = ({
  name,
  onChange,
  readonly = false,
  value = '',
  onValidationChange,
}) => {
  const [isValid, setIsValid] = useState<boolean | null>(null)

  useEffect(() => {
    if (value && value.trim().length > 0) {
      const valid = validateSMILES(value)
      setIsValid(valid)
      onValidationChange?.(valid)
    } else {
      setIsValid(null)
      onValidationChange?.(false)
    }
  }, [value, onValidationChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e)
  }

  return (
    <div className="flex flex-col text-sm">
      <p className="font-bold">{formatLabel(name)}</p>

      <input
        className={`mt-2 rounded border px-2 py-1 outline-gray-200 focus:border-kit-primary-full
        ${
          isValid === true
            ? 'border-green-300'
            : isValid === false
            ? 'border-red-300'
            : 'border-gray-300'
        }
        ${
          readonly
            ? 'cursor-not-allowed bg-gray-100 hover:border-inherit'
            : 'bg-white hover:border-kit-primary-full'
        }`}
        name={name}
        onChange={handleChange}
        placeholder="Enter SMILES notation (e.g., CCO, C1(O)NC(=O)C2=CC=CC=C21)"
        readOnly={readonly}
        type="text"
        value={value}
      />

      {/* Validation Feedback */}
      {isValid === true && (
        <div className="mt-2 rounded border border-green-200 bg-green-50 p-2">
          <p className="text-xs font-semibold text-green-800">
            ✓ Valid SMILES format
          </p>
        </div>
      )}

      {isValid === false && (
        <div className="mt-2 rounded border border-red-200 bg-red-50 p-2">
          <p className="text-xs font-semibold text-red-800">
            ✗ Invalid SMILES format
          </p>
          <p className="mt-1 text-xs text-red-700">
            Check for balanced brackets [] and parentheses (), and ensure only
            valid SMILES characters are used.
          </p>
        </div>
      )}
    </div>
  )
}

export default SmilesInputField
