import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardHomePage: React.FC = () => {
  const [roomId, setRoomId] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleCreateStudio = () => {
    setIsCreatingRoom(true);
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    
    navigate(`/studio/${user?.username}/${newRoomId}`);
  };

  const handleJoinStudio = () => {
    if (roomId.trim()) {
      navigate(`/studio/${user?.username}/${roomId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-gray-600">Manage your podcast studios and start recording</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Start New Studio</h2>
              <p className="text-gray-600 mb-4">Create a new studio session for podcast recording</p>
              <button
                onClick={handleCreateStudio}
                disabled={isCreatingRoom}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingRoom ? 'Creating...' : 'Create New Studio'}
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Join Studio</h2>
              <p className="text-gray-600 mb-4">Enter a studio ID to join an existing session</p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter Studio ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinStudio()}
                />
                <button
                  onClick={handleJoinStudio}
                  disabled={!roomId.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Podcasts</h2>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <p className="text-gray-500">No recent podcasts</p>
                <p className="text-sm text-gray-400">Start recording to see your podcasts here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHomePage;
