interface RequestConfig extends RequestInit {
  skipAuth?: boolean
}

class HttpClient {
  private isRefreshing = false
  private refreshPromise: Promise<boolean> | null = null

  private async makeRequest<T>(
    url: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { skipAuth = false, ...requestConfig } = config
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    }

    const finalConfig: RequestInit = {
      ...requestConfig,
      credentials: 'include',
      headers: {
        ...defaultHeaders,
        ...requestConfig.headers,
      },
    }

    try {
      const response = await fetch(url, finalConfig)
      
      if (response.status === 401 && !skipAuth) {
        const refreshed = await this.handleTokenRefresh()
        if (refreshed) {
          const retryResponse = await fetch(url, finalConfig)
          if (!retryResponse.ok) {
            const errorData = await retryResponse.json()
            throw new Error(errorData.error || `HTTP error! status: ${retryResponse.status}`)
          }
          return await retryResponse.json()
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Authentication failed')
      }
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  private async handleTokenRefresh(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return await this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = this.performTokenRefresh()

    try {
      const result = await this.refreshPromise
      return result
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  private async performTokenRefresh(): Promise<boolean> {
    try {
      const { config } = await import('../config/env')
      const apiBase = config.apiBaseUrl
      const response = await fetch(`${apiBase}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        console.log('Token refreshed successfully')
        return true
      }
      
      console.error('Token refresh failed with status:', response.status)
      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      return false
    }
  }

  async request(url: string, config?: RequestConfig): Promise<Response> {
    const { skipAuth = false, ...requestConfig } = config || {}
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    }

    const finalConfig: RequestInit = {
      ...requestConfig,
      credentials: 'include',
      headers: {
        ...defaultHeaders,
        ...requestConfig?.headers,
      },
    }

    const response = await fetch(url, finalConfig)
    
    if (response.status === 401 && !skipAuth) {
      const refreshed = await this.handleTokenRefresh()
      if (refreshed) {
        return fetch(url, finalConfig)
      }
    }

    return response
  }

  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(url, { ...config, method: 'GET' })
  }

  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(url, { ...config, method: 'DELETE' })
  }
}

export const httpClient = new HttpClient()
