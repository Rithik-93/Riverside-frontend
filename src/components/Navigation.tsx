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
    <nav className="flex-shrink-0 z-50 border-b border-[#c58aff]/20 bg-[#0b0b0b]/95 backdrop-blur-2xl shadow-lg shadow-black/50 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8">
            <Link 
              to="/dashboard/home" 
              className="flex items-center gap-2 sm:gap-3 group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#972fff] to-[#c58aff] rounded-lg blur-sm group-hover:blur-md transition-all" />
                <div className="relative h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 rounded-lg bg-gradient-to-br from-[#972fff] to-[#c58aff] flex items-center justify-center">
                  <Sparkles className="h-4 w-4 sm:h-4.5 sm:w-4.5 lg:h-5 lg:w-5 text-white" />
                </div>
              </div>
              <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-[#c58aff] to-[#ebd7ff] bg-clip-text text-transparent">
                Lakeside
              </span>
            </Link>
            
            <div className="hidden sm:flex space-x-2">
              <Link
                to="/dashboard/home"
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  location.pathname === '/dashboard/home'
                    ? 'bg-[#972fff]/10 text-[#c58aff] border border-[#c58aff]/20'
                    : 'text-foreground/60 hover:text-foreground hover:bg-[#972fff]/5'
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden md:inline">Dashboard</span>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            <div className="hidden md:flex items-center gap-2 px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg bg-[#972fff]/5 border border-[#c58aff]/10">
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#c58aff]" />
              <span className="text-xs sm:text-sm font-medium text-foreground truncate max-w-[100px] lg:max-w-none">
                {user.username}
              </span>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 border border-red-500/20 text-red-400 font-medium text-xs sm:text-sm transition-all"
            >
              <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
