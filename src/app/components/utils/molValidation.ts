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

export const validateSMILES = (smiles: string): boolean => {
  if (!smiles || typeof smiles !== 'string') return false

  const trimmedSmiles = smiles.trim()

  if (trimmedSmiles.length === 0) return false

  // Basic validation: SMILES should contain valid characters
  // Valid SMILES characters include: C, N, O, S, P, F, Cl, Br, I, c, n, o, s, p
  // and structural characters: (, ), [, ], =, #, -, +, @, /, \, %, digits
  const validSmilesPattern = /^[A-Za-z0-9@+\-\[\]()=#$:/\\%.]+$/

  if (!validSmilesPattern.test(trimmedSmiles)) return false

  // Check for balanced brackets and parentheses
  const brackets = { '[': 0, '(': 0 }
  for (const char of trimmedSmiles) {
    if (char === '[') brackets['[']++
    if (char === ']') brackets['[']--
    if (char === '(') brackets['(']++
    if (char === ')') brackets['(']--

    if (brackets['['] < 0 || brackets['('] < 0) return false
  }

  if (brackets['['] !== 0 || brackets['('] !== 0) return false

  // Check for isolated aromatic atoms (lowercase c, n, o, s, p not in ring context)
  // Pattern matches aromatic atoms that are NOT followed by a digit (ring closure)
  // and NOT inside brackets (explicit notation like [c+])
  const isolatedAromaticPattern = /(?<!\[|\d)[cnops](?!\d|\[)/g
  const hasIsolatedAromatics = isolatedAromaticPattern.test(trimmedSmiles)

  if (hasIsolatedAromatics) return false

  return true
}
