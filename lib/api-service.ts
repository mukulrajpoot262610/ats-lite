import { APIError } from '@/types/api.types'

export class ApiService {
  private baseURL: string

  constructor(baseURL: string = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000') {
    this.baseURL = baseURL
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
        const errorText = await response.text()
        const error = new Error(`API error: ${response.status} - ${errorText}`) as APIError
        error.status = response.status
        error.code = response.status.toString()
        throw error
      }

      return await response.json()
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
