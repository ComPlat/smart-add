import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxy endpoint for Chemotion ELN file uploads
 * Bypasses CORS restrictions by making server-side requests
 *
 * Usage:
 * PUT /api/chemotion-proxy
 * Body (FormData):
 *   - serverUrl: Chemotion ELN server URL
 *   - endpoint: API endpoint path
 *   - token: Bearer authentication token
 *   - file: File to upload
 */

// Security: Validate server URL format
const isAllowedServer = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url)

    // Only allow HTTPS (no HTTP for security)
    if (parsedUrl.protocol !== 'https:') {
      return false
    }

    // Allow any HTTPS URL
    return true
  } catch {
    // Invalid URL format
    return false
  }
}

// Security: Whitelist of allowed endpoints
const ALLOWED_ENDPOINTS = ['/api/v1/collections/imports']

// Security: File constraints
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100 MB
const ALLOWED_MIME_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream', // Some browsers send this for ZIP
]

/**
 * Handle file uploads to Chemotion ELN
 */
export async function PUT(request: NextRequest) {
  try {
    // Extract form data
    const formData = await request.formData()
    const serverUrl = formData.get('serverUrl') as string
    const endpoint = formData.get('endpoint') as string
    const token = formData.get('token') as string
    const file = formData.get('file') as File

    // Validate required fields
    if (!serverUrl || !endpoint || !file) {
      return NextResponse.json(
        { error: 'Missing serverUrl, endpoint, or file' },
        { status: 400 },
      )
    }

    // Security: Validate server URL is allowed
    if (!isAllowedServer(serverUrl)) {
      console.warn('Blocked request to unauthorized server:', serverUrl)
      return NextResponse.json(
        { error: 'Unauthorized server URL' },
        { status: 403 },
      )
    }

    // Security: Validate endpoint is whitelisted
    if (!ALLOWED_ENDPOINTS.includes(endpoint)) {
      console.warn('Blocked request to unauthorized endpoint:', endpoint)
      return NextResponse.json(
        { error: 'Unauthorized endpoint' },
        { status: 403 },
      )
    }

    // Security: Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${
            MAX_FILE_SIZE / 1024 / 1024
          }MB`,
        },
        { status: 413 },
      )
    }

    // Security: Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only ZIP files are allowed.' },
        { status: 415 },
      )
    }

    // Prepare request to Chemotion ELN
    const url = `${serverUrl}${endpoint}`
    const proxyFormData = new FormData()
    proxyFormData.append('file', file)

    const headers: HeadersInit = {}
    if (token) {
      headers['Authorization'] = token
    }

    // Forward request to Chemotion ELN (server-side, no CORS)
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: proxyFormData,
    })

    // Handle 204 No Content (success with no body)
    if (response.status === 204) {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Parse response based on content type
    const contentType = response.headers.get('content-type')
    let data

    if (contentType?.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      data = text ? { message: text } : { success: true }
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    // Security: Don't log sensitive data (tokens, file contents)
    console.error('Proxy upload error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      // Don't log token or file data
    })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 },
    )
  }
}
