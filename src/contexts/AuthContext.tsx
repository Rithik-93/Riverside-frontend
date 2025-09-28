import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface User {
  id: string
  email: string
  username: string
  full_name: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  refreshToken: () => Promise<boolean>
  oauthLogin: (provider: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!token

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await fetch('http://localhost:8081/auth/validate', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            const claims = data.data
            const user: User = {
              id: claims.user_id,
              email: claims.email,
              username: claims.username,
              full_name: claims.full_name || '',
              created_at: claims.created_at || '',
              updated_at: claims.updated_at || ''
            }
            setUser(user)
            setToken('cookie-based')
          }
        } else {
          const refreshed = await refreshAccessToken()
          if (!refreshed) {
            clearAuthState()
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        clearAuthState()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

 

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8081/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          const user: User = {
            id: data.data.user.id,
            email: data.data.user.email,
            username: data.data.user.username,
            full_name: data.data.user.full_name,
            created_at: data.data.user.created_at,
            updated_at: data.data.user.updated_at
          }
          setUser(user)
          setToken('cookie-based')
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Error refreshing token:', error)
      return false
    }
  }

  const clearAuthState = () => {
    setUser(null)
    setToken(null)
  }

  const login = (newToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
  }

  const logout = async () => {
    try {
      await fetch('http://localhost:8081/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      clearAuthState()
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    const success = await refreshAccessToken()
    if (!success) {
      clearAuthState()
    }
    return success
  }

  const oauthLogin = async (provider: string): Promise<void> => {
    window.location.href = `http://localhost:8081/auth/${provider}`
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
    oauthLogin
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
