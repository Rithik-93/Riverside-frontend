interface User {
  id: string
  email: string
  username: string
  full_name: string
  created_at: string
  updated_at: string
}

interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
  expires_in: number
}

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  email: string
  username: string
  full_name: string
  password: string
}

interface OAuthSession {
  provider: string
  code: string
  state: string
}

interface OAuthURLResponse {
  auth_url: string
  state: string
}

import { httpClient } from './httpClient'
import { config } from '../config/env'

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

class AuthService {
  private baseURL = config.apiBaseUrl

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    try {
      const response = await httpClient.request(url, options)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }
      
      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Login failed')
    }
    
    return response.data
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Registration failed')
    }
    
    return response.data
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('/auth/refresh', {
      method: 'POST',
    })
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Token refresh failed')
    }
    
    return response.data
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('/auth/logout', {
        method: 'POST',
      })
    } catch (error) {
      console.warn('Logout request failed:', error)
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/auth/validate', {
        method: 'GET',
      })
      return response.success
    } catch {
      return false
    }
  }

  async getOAuthURL(provider: string): Promise<OAuthURLResponse> {
    const response = await this.makeRequest<OAuthURLResponse>(`/auth/${provider}`, {
      method: 'GET',
    })
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get OAuth URL')
    }
    
    return response.data
  }

  async oauthLogin(oauthData: OAuthSession): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('/auth/oauth', {
      method: 'POST',
      body: JSON.stringify(oauthData),
    })
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'OAuth login failed')
    }
    
    return response.data
  }
}

export const authService = new AuthService()
export type { User, AuthResponse, LoginRequest, RegisterRequest, OAuthSession, OAuthURLResponse }
