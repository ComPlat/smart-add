export const validateMolFile = (content: string): boolean => {
  if (!content || typeof content !== 'string') return false

  const lines = content.split('\n')

  // Check minimum lines (header block + counts line)
  if (lines.length < 4) return false

  // Check for M  END terminator
  const hasEndTerminator = lines.some((line) =>
    line.trim().startsWith('M  END'),
  )

  return hasEndTerminator
}
