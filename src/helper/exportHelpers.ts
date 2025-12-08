/**
 * Formats reaction description from plain text to Delta format
 * Matches the pattern used in jsonGenerator (lines 218-226)
 */
export const formatReactionDescription = (
  description: string | null | undefined,
): { ops: Array<{ insert: string }> } | null => {
  if (!description) return null

  // If already in Delta format, return as-is
  if (typeof description === 'object' && 'ops' in description) {
    return description as { ops: Array<{ insert: string }> }
  }

  // Convert string to Delta format
  if (typeof description === 'string') {
    return {
      ops: [{ insert: description + '\n' }],
    }
  }

  return null
}
