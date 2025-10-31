/**
 * Chemotion ELN API Service
 * Handles authentication and data upload to Chemotion ELN
 * Makes direct API calls to Chemotion ELN server
 */

export interface ChemotionAuthResponse {
  success: boolean
  message?: string
}

export interface ChemotionUploadResponse {
  success: boolean
  message?: string
}

export interface ChemotionPingResponse {
  success: boolean
  message?: string
}

class ChemotionApiService {
  private serverUrl: string = ''
  private authToken: string | null = null
  private isAuthenticating: boolean = false

  /**
   * Ping the Chemotion ELN server to check availability
   * Makes direct call to Chemotion ELN /api/v1/public/ping endpoint
   */
  async ping(serverUrl: string): Promise<ChemotionPingResponse> {
    try {
      const response = await fetch(`${serverUrl}/api/v1/public/ping`, {
        method: 'GET',
      })

      if (response.ok) {
        return { success: true, message: 'Server is reachable' }
      }

      return {
        success: false,
        message: `Server responded with status ${response.status}`,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Server unreachable',
      }
    }
  }

  /**
   * Authenticate with Chemotion ELN server
   * Makes direct call to Chemotion ELN /api/v1/public/token endpoint
   */
  async authenticate(
    serverUrl: string,
    email: string,
    password: string,
  ): Promise<ChemotionAuthResponse> {
    if (this.isAuthenticating) {
      return {
        success: false,
        message: 'Authentication already in progress',
      }
    }

    this.isAuthenticating = true

    try {
      const response = await fetch(`${serverUrl}/api/v1/public/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      })

      if (!response.ok) {
        // Provide more specific error messages based on status code
        if (response.status === 401) {
          return {
            success: false,
            message: 'Invalid email or password',
          }
        }
        return {
          success: false,
          message: `Authentication failed with status ${response.status}`,
        }
      }

      const data = await response.json()
      const token = data.token

      if (token) {
        this.serverUrl = serverUrl
        this.authToken = `Bearer ${token}`
        return { success: true, message: 'Authentication successful' }
      }

      return {
        success: false,
        message: 'No token received',
      }
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Authentication failed',
      }
    } finally {
      this.isAuthenticating = false
    }
  }

  /**
   * Upload zip file to Chemotion ELN
   * Makes direct call to Chemotion ELN /api/v1/collections/imports endpoint
   */
  async uploadToChemotion(
    zipBlob: Blob,
    filename: string,
  ): Promise<ChemotionUploadResponse> {
    try {
      if (!this.serverUrl || !this.authToken) {
        throw new Error('Not authenticated')
      }

      const formData = new FormData()
      formData.append('file', zipBlob, filename)

      const response = await fetch(
        `${this.serverUrl}/api/v1/collections/imports`,
        {
          method: 'POST',
          mode: 'cors',
          credentials: 'omit',
          headers: {
            Authorization: this.authToken,
          },
          body: formData,
        },
      )

      if (response.ok) {
        return { success: true, message: 'Upload successful' }
      }

      // Handle unauthorized/expired token
      if (response.status === 401) {
        this.clearSession()
        return {
          success: false,
          message: 'Authentication expired. Please login again.',
        }
      }

      const errorText = await response.text()
      return {
        success: false,
        message: errorText || `Upload failed with status ${response.status}`,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed',
      }
    }
  }

  /**
   * Clear authentication session
   */
  clearSession() {
    this.serverUrl = ''
    this.authToken = null
  }

  /**
   * Check if currently authenticated
   */
  isAuthenticated(): boolean {
    return !!this.serverUrl && !!this.authToken
  }
}

// Export singleton instance
export const chemotionApi = new ChemotionApiService()
