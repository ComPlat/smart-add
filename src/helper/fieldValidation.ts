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
    value &&
    !value.includes('..') &&
    !isNaN(Number(value))
  ) {
    // Convert single number to range for export: "12" -> "12..Infinity"
    return `${value}..Infinity`
  }

  // Return as string if it's a string, otherwise convert to string
  return typeof value === 'string' ? value : String(value)
}
