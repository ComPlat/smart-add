import { formatLabel } from '@/helper/utils'
import { MdAccessTime } from 'react-icons/md'

interface DateInputFieldProps {
  autoFocus?: boolean
  className?: string
  id?: string
  name: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  raw?: boolean
  readonly?: boolean
  value?: string
}

const DateInputField: React.FC<DateInputFieldProps> = ({
  autoFocus = false,
  className = '',
  id,
  name,
  onChange,
  readonly = false,
  value = '',
}) => {
  // Convert ISO datetime to DD/MM/YYYY HH:mm:ss format for display
  const formatDisplayValue = (isoValue: string): string => {
    if (!isoValue) return ''
    try {
      const date = new Date(isoValue)
      if (isNaN(date.getTime())) return isoValue // Return original if invalid

      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const seconds = date.getSeconds().toString().padStart(2, '0')

      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
    } catch {
      return isoValue
    }
  }

  // Convert DD/MM/YYYY HH:mm:ss format to ISO datetime
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // Check if input matches DD/MM/YYYY HH:mm:ss format
    const dateTimeRegex = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/
    const match = inputValue.match(dateTimeRegex)

    if (match) {
      const [, day, month, year, hours, minutes, seconds] = match
      // Convert to ISO format (YYYY-MM-DDTHH:mm:ss.000Z)
      const isoDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
        parseInt(seconds),
      )
      if (!isNaN(isoDate.getTime())) {
        e.target.value = isoDate.toISOString()
      }
    }

    onChange(e)
  }

  const displayValue = formatDisplayValue(value)

  const setCurrentTime = () => {
    const now = new Date()

    // Create synthetic event with ISO format for storage
    const syntheticEvent = {
      target: { value: now.toISOString(), name },
    } as React.ChangeEvent<HTMLInputElement>

    onChange(syntheticEvent)
  }

  return (
    <label className="flex flex-col text-sm">
      <p className="font-bold">{formatLabel(name)}</p>
      <div className="flex gap-2">
        <input
          className={`mt-2 flex-1 rounded border border-gray-300 px-2 py-1 outline-gray-200 focus:border-kit-primary-full
          ${
            readonly
              ? 'cursor-not-allowed bg-gray-100 hover:border-inherit'
              : 'bg-white hover:border-kit-primary-full'
          } ${className}`}
          autoFocus={autoFocus}
          id={id}
          name={name}
          onChange={handleChange}
          placeholder="DD/MM/YYYY HH:mm:ss"
          readOnly={readonly}
          type="text"
          value={displayValue}
        />
        {!readonly && (
          <button
            type="button"
            onClick={setCurrentTime}
            className="mt-2 rounded border border-gray-300 bg-gray-50 px-3 py-1 text-sm hover:bg-gray-100 focus:border-kit-primary-full flex items-center justify-center"
            title="Set current time"
          >
            <MdAccessTime />
          </button>
        )}
      </div>
    </label>
  )
}

export default DateInputField