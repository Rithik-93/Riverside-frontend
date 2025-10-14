import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { Sparkles, Mail, Lock, User, ArrowLeft } from 'lucide-react';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, oauthLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await authService.register(registerData);
      
      localStorage.setItem('accessToken', response.access_token);
      localStorage.setItem('refreshToken', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      login(response.access_token, response.user);
      
      navigate('/dashboard/home');
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: string) => {
    try {
      setIsLoading(true);
      setError('');
      await oauthLogin(provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OAuth login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-12">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#972fff]/10 via-background to-[#c58aff]/10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#972fff]/5 via-transparent to-transparent" />
      
      {/* Back to Home */}
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      <div className="relative w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#972fff] to-[#c58aff] rounded-lg blur-md opacity-75" />
              <div className="relative h-9 w-9 rounded-lg bg-gradient-to-br from-[#972fff] to-[#c58aff] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold">Lakeside</span>
          </div>
        </div>

        {/* Card */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#972fff] to-[#c58aff] rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
          <div className="relative bg-background/95 backdrop-blur-xl rounded-2xl border border-[#c58aff]/20 p-6 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-1">
                Create Your Account
              </h2>
              <p className="text-sm text-foreground/60">
                Start creating amazing content today
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-xs backdrop-blur-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2.5">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 bg-background/50 border border-[#c58aff]/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#972fff]/50 focus:border-[#972fff] transition-all placeholder:text-foreground/40 text-foreground"
                    placeholder="Username"
                  />
                </div>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 bg-background/50 border border-[#c58aff]/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#972fff]/50 focus:border-[#972fff] transition-all placeholder:text-foreground/40 text-foreground"
                    placeholder="Full Name"
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 bg-background/50 border border-[#c58aff]/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#972fff]/50 focus:border-[#972fff] transition-all placeholder:text-foreground/40 text-foreground"
                    placeholder="Email address"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 bg-background/50 border border-[#c58aff]/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#972fff]/50 focus:border-[#972fff] transition-all placeholder:text-foreground/40 text-foreground"
                    placeholder="Password (min. 6 characters)"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 bg-background/50 border border-[#c58aff]/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#972fff]/50 focus:border-[#972fff] transition-all placeholder:text-foreground/40 text-foreground"
                    placeholder="Confirm Password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-gradient-to-r from-[#972fff] to-[#c58aff] hover:opacity-90 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#972fff]/25 mt-4"
              >
                {isLoading ? 'Creating account...' : 'Sign up'}
              </button>
            </form>

            <div className="mt-5">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#c58aff]/20" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-background/95 text-foreground/50">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                disabled={isLoading}
                className="mt-3 w-full flex justify-center items-center gap-2 py-2.5 border border-[#c58aff]/20 rounded-lg text-sm bg-background/50 hover:bg-[#972fff]/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium text-foreground text-sm">Continue with Google</span>
              </button>
            </div>

            <p className="mt-5 text-center text-xs text-foreground/60">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-[#c58aff] hover:text-[#ebd7ff] transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
