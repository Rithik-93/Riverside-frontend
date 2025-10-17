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

        const { config } = await import('../config/env')
        const response = await fetch(`${config.apiBaseUrl}/auth/oauth`, {
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
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-br from-[#972fff]/10 via-background to-[#c58aff]/10" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#972fff]/5 via-transparent to-transparent" />
        
        <div className="text-center relative">
          <div className="relative inline-block mb-5">
            <div className="absolute inset-0 bg-gradient-to-r from-[#972fff] to-[#c58aff] rounded-full blur-lg opacity-50 animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-20 w-20 border-4 border-[#c58aff]/20 border-t-[#972fff]"></div>
          </div>
          <h3 className="text-lg font-semibold mb-1.5">Completing authentication...</h3>
          <p className="text-sm text-foreground/60">Please wait while we sign you in</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-br from-[#972fff]/10 via-background to-[#c58aff]/10" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#972fff]/5 via-transparent to-transparent" />
        
        <div className="text-center relative max-w-md px-6">
          <div className="relative group inline-block">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-red-700 rounded-xl blur opacity-20" />
            <div className="relative bg-red-500/10 backdrop-blur-xl rounded-xl border border-red-500/20 p-6">
              <div className="h-14 w-14 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-red-400">Authentication Failed</h3>
              <p className="text-sm text-foreground/60 mb-5">{error}</p>
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 bg-gradient-to-r from-[#972fff] to-[#c58aff] hover:opacity-90 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-[#972fff]/25"
              >
                Return to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default OAuthCallbackPage
