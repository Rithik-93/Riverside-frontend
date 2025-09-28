import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const storedState = localStorage.getItem('oauth_state')

        if (!code || !state) {
          throw new Error('Missing OAuth parameters')
        }

        if (state !== storedState) {
          throw new Error('Invalid state parameter')
        }

        localStorage.removeItem('oauth_state')

        const response = await fetch('http://localhost:8081/auth/oauth', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            provider: 'google',
            code,
            state
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'OAuth authentication failed')
        }

        if (data.success && data.data) {
          // Store tokens and user data
          localStorage.setItem('accessToken', data.data.access_token)
          localStorage.setItem('refreshToken', data.data.refresh_token)
          localStorage.setItem('user', JSON.stringify(data.data.user))
          
          // Update auth context
          login(data.data.access_token, data.data.user)
          
          // Redirect to dashboard
          navigate('/dashboard/home')
        } else {
          throw new Error('OAuth authentication failed')
        }
      } catch (err) {
        console.error('OAuth callback error:', err)
        setError(err instanceof Error ? err.message : 'OAuth authentication failed')
        setLoading(false)
      }
    }

    handleOAuthCallback()
  }, [searchParams, navigate, login])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Completing authentication...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-4">Authentication Failed</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default OAuthCallbackPage
