import { formatLabel } from '@/helper/utils'
import { ChangeEvent, useRef, useState } from 'react'

interface MolFileInfo {
  isValid: boolean
  errors?: string[]
}

interface FileUploadInputFieldProps {
  name: string
  onChange: (content: string) => void
  readonly?: boolean
  value?: string
  acceptedTypes?: string
  maxFileSize?: number // in bytes
  onValidationChange?: (isValid: boolean) => void
}

const FileUploadInputField: React.FC<FileUploadInputFieldProps> = ({
  name,
  onChange,
  readonly = false,
  value = '',
  acceptedTypes = '.mol,.txt',
  maxFileSize = 1024 * 1024, // 1MB default
  onValidationChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [molInfo, setMolInfo] = useState<MolFileInfo | null>(null)

  // Basic MOL file validation
  const validateMolFile = (content: string): MolFileInfo => {
    const lines = content.split('\n')
    const errors: string[] = []

    // Check minimum lines (header block + counts line)
    if (lines.length < 4) {
      errors.push(
        'MOL file must have at least 4 lines (3 header lines + counts line)',
      )
      return { isValid: false, errors }
    }

    // Check for M  END terminator
    const hasEndTerminator = lines.some((line) =>
      line.trim().startsWith('M  END'),
    )
    if (!hasEndTerminator) {
      errors.push('Missing "M  END" terminator')
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    }
  }

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > maxFileSize) {
      alert(`File size must be less than ${maxFileSize / 1024 / 1024}MB`)
      return
    }

    // Validate file type
    const extension = file.name.toLowerCase().split('.').pop()
    if (!acceptedTypes.includes(`.${extension}`)) {
      alert(`Only ${acceptedTypes} files are allowed`)
      return
    }

    try {
      const content = await file.text()

      // Validate MOL file format for both .mol and .txt files
      if (extension === 'mol' || extension === 'txt') {
        const validation = validateMolFile(content)
        setMolInfo(validation)
        onValidationChange?.(validation.isValid)

        if (!validation.isValid) {
          const errorMsg =
            validation.errors?.join('\n') || 'Invalid MOL file format'
          alert(`MOL File Validation Error:\n\n${errorMsg}`)
          return
        }
      } else {
        // For other file types, clear validation info
        setMolInfo(null)
        onValidationChange?.(false)
      }

      onChange(content)
    } catch (error) {
      console.error('Error reading file:', error)
      alert('Error reading file content')
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClear = () => {
    onChange('')
    setMolInfo(null)
    onValidationChange?.(false)
  }

  return (
    <div className="flex flex-col text-sm">
      <p className="font-bold">{formatLabel(name)}</p>

      <div className="mt-2 space-y-2">
        {/* File Upload Button */}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            onChange={handleFileUpload}
            disabled={readonly}
            className="hidden"
            id={`file-upload-${name}`}
          />
          <label
            htmlFor={`file-upload-${name}`}
            className={`cursor-pointer rounded border px-3 py-1 text-xs font-medium ${
              readonly
                ? 'border-gray-300 bg-gray-100 text-gray-500'
                : 'border-kit-primary-full bg-kit-primary-full text-white hover:bg-kit-primary-dark'
            }`}
          >
            Upload File
          </label>

          {value && (
            <button
              type="button"
              onClick={handleClear}
              disabled={readonly}
              className="rounded border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Clear
            </button>
          )}
        </div>

        {/* MOL File Status */}
        {molInfo && molInfo.isValid && (
          <div className="rounded border border-green-200 bg-green-50 p-2">
            <p className="text-xs font-semibold text-green-800">
              ✓ Valid MOL file format
            </p>
          </div>
        )}

        {/* Validation Errors */}
        {molInfo && !molInfo.isValid && (
          <div className="rounded border border-red-200 bg-red-50 p-3">
            <h4 className="mb-2 text-xs font-semibold text-red-800">
              Validation Errors
            </h4>
            <ul className="space-y-1 text-xs text-red-700">
              {molInfo.errors?.map((error, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-1">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Content Preview */}
        <textarea
          className={`mt-2 h-96 w-full rounded border px-2 py-1 font-mono text-xs outline-gray-200 focus:border-kit-primary-full ${
            molInfo && molInfo.isValid
              ? 'border-green-300'
              : molInfo && !molInfo.isValid
              ? 'border-red-300'
              : 'border-gray-300'
          } ${
            readonly
              ? 'cursor-not-allowed bg-gray-100 hover:border-inherit'
              : 'bg-white hover:border-kit-primary-full'
          }`}
          placeholder="File content will appear here..."
          readOnly={readonly}
          value={value || ''}
          title={
            readonly ? 'File content (read-only)' : 'File content (editable)'
          }
          onChange={(e) => {
            if (!readonly) {
              const content = e.target.value
              onChange(content)

              // Validate on change
              if (content) {
                const validation = validateMolFile(content)
                setMolInfo(validation)
                onValidationChange?.(validation.isValid)
              } else {
                setMolInfo(null)
                onValidationChange?.(false)
              }
            }
          }}
        />

        {/* File Info */}
        <p className="text-xs text-gray-500">
          Accepted formats: {acceptedTypes} | Max size:{' '}
          {maxFileSize / 1024 / 1024}MB
        </p>
      </div>
    </div>
  )
}

export default FileUploadInputField
