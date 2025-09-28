import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import OAuthCallbackPage from '../pages/OAuthCallbackPage';
import DashboardHomePage from '../pages/DashboardHomePage';
import StudioPreCheckPage from '../pages/StudioPreCheckPage';
import StudioPage from '../pages/StudioPage';
import PodcastDetailsPage from '../pages/PodcastDetailsPage';

const AppRouter: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Navigation />}
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <LoginPage /> : <Navigate to="/dashboard/home" replace />} 
          />
          <Route 
            path="/signup" 
            element={!user ? <SignupPage /> : <Navigate to="/dashboard/home" replace />} 
          />
          <Route 
            path="/auth/google/callback" 
            element={<OAuthCallbackPage />} 
          />
          
          <Route 
            path="/dashboard/home" 
            element={user ? <DashboardHomePage /> : <Navigate to="/login" replace />} 
          />
          
          <Route 
            path="/studio/:username/:uuid" 
            element={user ? <StudioPreCheckPage /> : <Navigate to="/login" replace />} 
          />
          
          <Route 
            path="/studio/:username/:uuid/join" 
            element={user ? <StudioPage /> : <Navigate to="/login" replace />} 
          />
          
          <Route 
            path="/dashboard/studios/:username-:studioId/projects/:projectId" 
            element={user ? <PodcastDetailsPage /> : <Navigate to="/login" replace />} 
          />
          
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard/home" replace /> : <LandingPage />} 
          />
          
          <Route 
            path="*" 
            element={<Navigate to={user ? "/dashboard/home" : "/login"} replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default AppRouter;
