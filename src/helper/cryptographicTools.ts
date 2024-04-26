import crypto from 'crypto'

// Generate a an MD5 checksum for a file
export async function generateMd5Checksum(blob: Blob) {
  const hash = crypto.createHash('md5')
  const reader = blob.stream().getReader()
  const content = await reader.read()

  if (!content.value) return ''

  const buffer = Buffer.from(content.value)
  hash.update(buffer)

  return hash.digest('hex')
}
