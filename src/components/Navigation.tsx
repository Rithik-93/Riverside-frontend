import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return null; // Don't show navigation for unauthenticated users
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link 
              to="/dashboard/home" 
              className="text-xl font-bold text-gray-900"
            >
              Podcast Studio
            </Link>
            <div className="flex space-x-4">
              <Link
                to="/dashboard/home"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/dashboard/home'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Dashboard
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Welcome, {user.username}
            </span>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
