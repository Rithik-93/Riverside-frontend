import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, LayoutDashboard, LogOut, User } from 'lucide-react';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return null; // Don't show navigation for unauthenticated users
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-[#c58aff]/20 bg-[#0b0b0b]/95 backdrop-blur-2xl shadow-lg shadow-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link 
              to="/dashboard/home" 
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#972fff] to-[#c58aff] rounded-lg blur-sm group-hover:blur-md transition-all" />
                <div className="relative h-9 w-9 rounded-lg bg-gradient-to-br from-[#972fff] to-[#c58aff] flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-[#c58aff] to-[#ebd7ff] bg-clip-text text-transparent">
                Lakeside
              </span>
            </Link>
            
            <div className="hidden md:flex space-x-2">
              <Link
                to="/dashboard/home"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === '/dashboard/home'
                    ? 'bg-[#972fff]/10 text-[#c58aff] border border-[#c58aff]/20'
                    : 'text-foreground/60 hover:text-foreground hover:bg-[#972fff]/5'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-[#972fff]/5 border border-[#c58aff]/10">
              <User className="h-4 w-4 text-[#c58aff]" />
              <span className="text-sm font-medium text-foreground">
                {user.username}
              </span>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 border border-red-500/20 text-red-400 font-medium text-sm transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
