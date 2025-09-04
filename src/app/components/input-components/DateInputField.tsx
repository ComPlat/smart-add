import { formatLabel } from '@/helper/utils'
import { MdAccessTime } from 'react-icons/md'
import { DatePicker } from 'antd'
import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

// Extend dayjs with required plugins
dayjs.extend(customParseFormat)

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
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [displayValue, setDisplayValue] = useState('')

  // Update display value when prop value changes
  useEffect(() => {
    if (name.startsWith('timestamp_')) {
      // For timestamp fields, store as DD/MM/YYYY HH:mm:ss format directly
      setDisplayValue(value || '')
    } else {
      // For other date fields, convert from ISO to display format
      setDisplayValue(formatDisplayValue(value))
    }
  }, [value, name])

  // Convert ISO datetime to DD/MM/YYYY HH:mm:ss format for display
  const formatDisplayValue = (isoValue: string): string => {
    if (!isoValue) return ''
    try {
      const date = new Date(isoValue)
      if (isNaN(date.getTime())) return ''

      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const seconds = date.getSeconds().toString().padStart(2, '0')

      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
    } catch {
      return ''
    }
  }

  // Handle input change - only allow valid date characters
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filteredValue = e.target.value.replace(/[^0-9\/: ]/g, '')
    setDisplayValue(filteredValue)
    
    // For timestamp fields, store DD/MM/YYYY HH:mm:ss format directly
    // For other fields (read-only), they will be processed by InspectorSidebar
    onChange({
      target: { value: filteredValue, name: e.target.name },
    } as React.ChangeEvent<HTMLInputElement>)
  }

  const handleDatePickerChange = (date: Dayjs | null) => {
    const displayFormat = date ? date.format('DD/MM/YYYY HH:mm:ss') : ''
    setDisplayValue(displayFormat)
    onChange({
      target: { value: displayFormat, name },
    } as React.ChangeEvent<HTMLInputElement>)
    setShowDatePicker(false)
  }

  const toggleDatePicker = () => {
    if (!readonly) setShowDatePicker(!showDatePicker)
  }

  const getDayjsValue = (): Dayjs | null => {
    if (!value) return null
    const dayjsValue = dayjs(value, 'DD/MM/YYYY HH:mm:ss')
    return dayjsValue.isValid() ? dayjsValue : null
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
            onClick={toggleDatePicker}
            className="mt-2 rounded border border-gray-300 bg-gray-50 px-3 py-1 text-sm hover:bg-gray-100 focus:border-kit-primary-full flex items-center justify-center"
            title="Open date picker"
          >
            <MdAccessTime />
          </button>
        )}
      </div>
      
      {showDatePicker && !readonly && (
        <div className="mt-2 relative">
          <DatePicker
            open={showDatePicker}
            format="DD/MM/YYYY HH:mm:ss"
            onChange={handleDatePickerChange}
            onOpenChange={setShowDatePicker}
            placeholder="DD/MM/YYYY HH:mm:ss"
            showTime={{ format: 'HH:mm:ss' }}
            style={{ width: '100%' }}
            value={getDayjsValue()}
          />
        </div>
      )}
    </label>
  )
}

export default DateInputField
