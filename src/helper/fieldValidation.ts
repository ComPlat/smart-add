import { MetadataValue } from '@/database/db'

// Format temperature fields for export/download (append ..Infinity to single numbers)
export const formatForExport = (
  fieldName: string,
  value: MetadataValue,
): string | null => {
  // Handle undefined/null values
  if (value === undefined || value === null) {
    return null
  }

  if (
    (fieldName === 'boiling_point' || fieldName === 'melting_point') &&
    typeof value === 'string' &&
    value
  ) {
    // Handle space-separated ranges: "25 30" -> "25..30"
    // Also handles negative numbers: "-20 500" -> "-20..500"
    if (value.includes(' ') && !value.includes('..')) {
      const parts = value.trim().split(/\s+/)
      if (
        parts.length === 2 &&
        !isNaN(Number(parts[0])) &&
        !isNaN(Number(parts[1]))
      ) {
        return `${parts[0]}..${parts[1]}`
      }
    }

    // Handle dash-separated ranges: "25-30" -> "25..30"
    if (value.includes('-') && !value.includes('..')) {
      // Use regex to properly split on dash while handling negative numbers
      const match = value.match(/^(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/)
      if (match) {
        const [, firstNum, secondNum] = match
        return `${firstNum}..${secondNum}`
      }
    }

    // Handle single number: "12" -> "12..Infinity" (if no .. already present)
    if (!value.includes('..') && !isNaN(Number(value))) {
      return `${value}..Infinity`
    }
  }

  // Return as string if it's a string, otherwise convert to string
  return typeof value === 'string' ? value : String(value)
}
