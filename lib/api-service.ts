import { APIError } from '@/types'

export class ApiService {
  private baseURL: string

  constructor(baseURL: string = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000') {
    this.baseURL = baseURL
  }

  /**
   * Safely parse JSON response with error handling
   */
  private async safeParseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type')

    if (!contentType || !contentType.includes('application/json')) {
      const textContent = await response.text()
      throw new Error(`Expected JSON response but got: ${contentType}. Content: ${textContent.slice(0, 200)}`)
    }

    try {
      const text = await response.text()

      if (!text.trim()) {
        throw new Error('Empty response body')
      }

      return JSON.parse(text) as T
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown JSON parsing error'
      throw new Error(`Failed to parse JSON response: ${errorMessage}`)
    }
  }

  /**
   * Generic method to make API requests with proper error handling
   */
  async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        let errorDetails = 'Unknown error'

        try {
          const errorText = await response.text()
          errorDetails = errorText || `HTTP ${response.status}`
        } catch (textError) {
          console.warn('Failed to read error response:', textError)
          errorDetails = `HTTP ${response.status} - Unable to read error details`
        }

        const error = new Error(`API error: ${response.status} - ${errorDetails}`) as APIError
        error.status = response.status
        error.code = response.status.toString()
        throw error
      }

      return await this.safeParseResponse<T>(response)
    } catch (error) {
      if (error instanceof Error) {
        const apiError = error as APIError
        if (!apiError.status) {
          apiError.status = 500
          apiError.code = 'NETWORK_ERROR'
        }
        throw apiError
      }
      throw new Error('Unknown error occurred')
    }
  }
}

export const apiService = new ApiService()
