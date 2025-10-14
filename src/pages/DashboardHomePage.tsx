import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plus, LogIn, Sparkles, Mic, Video, Clock } from 'lucide-react';

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
    <div className="min-h-screen bg-background">
      {/* Background Gradient */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#972fff]/5 via-background to-[#c58aff]/5" />
      
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#c58aff]/20 bg-[#972fff]/5 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-[#c58aff]" />
              <span className="text-xs text-foreground/70">Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome back, <span className="bg-gradient-to-r from-[#c58aff] to-[#ebd7ff] bg-clip-text text-transparent">{user?.username}</span>!
            </h1>
            <p className="text-foreground/60">Ready to create something amazing?</p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
            {/* Create Studio Card */}
            <div className="group relative overflow-hidden">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#972fff] to-[#c58aff] rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
              <div className="relative bg-background/80 backdrop-blur-xl rounded-xl border border-[#c58aff]/20 p-6 hover:border-[#c58aff]/40 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#972fff] to-[#c58aff] flex items-center justify-center shadow-lg shadow-[#972fff]/25">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-[#972fff]/10 border border-[#972fff]/20">
                    <span className="text-xs font-semibold text-[#c58aff]">New</span>
                  </div>
                </div>
                
                <h2 className="text-xl font-bold mb-2">Start New Studio</h2>
                <p className="text-sm text-foreground/60 mb-4 leading-relaxed">
                  Create a new studio session and start recording your podcast in studio quality
                </p>
                
                <button
                  onClick={handleCreateStudio}
                  disabled={isCreatingRoom}
                  className="w-full py-2.5 bg-gradient-to-r from-[#972fff] to-[#c58aff] hover:opacity-90 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#972fff]/25 flex items-center justify-center gap-2"
                >
                  {isCreatingRoom ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Video className="h-4 w-4" />
                      Create New Studio
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Join Studio Card */}
            <div className="group relative overflow-hidden">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#c58aff] to-[#ebd7ff] rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
              <div className="relative bg-background/80 backdrop-blur-xl rounded-xl border border-[#c58aff]/20 p-6 hover:border-[#c58aff]/40 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#c58aff] to-[#ebd7ff] flex items-center justify-center shadow-lg shadow-[#c58aff]/25">
                    <LogIn className="h-6 w-6 text-[#0b0b0b]" />
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-[#c58aff]/10 border border-[#c58aff]/20">
                    <span className="text-xs font-semibold text-[#c58aff]">Join</span>
                  </div>
                </div>
                
                <h2 className="text-xl font-bold mb-2">Join Studio</h2>
                <p className="text-sm text-foreground/60 mb-4 leading-relaxed">
                  Enter a studio ID to join an existing recording session
                </p>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Studio ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="flex-1 px-3 py-2.5 text-sm bg-background/50 border border-[#c58aff]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#972fff]/50 focus:border-[#972fff] transition-all placeholder:text-foreground/40 text-foreground"
                    onKeyPress={(e) => e.key === 'Enter' && handleJoinStudio()}
                  />
                  <button
                    onClick={handleJoinStudio}
                    disabled={!roomId.trim()}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#c58aff] to-[#ebd7ff] hover:opacity-90 text-[#0b0b0b] text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#c58aff]/25"
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Podcasts Section */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#972fff]/20 to-[#c58aff]/20 rounded-xl blur opacity-10" />
            <div className="relative bg-background/80 backdrop-blur-xl rounded-xl border border-[#c58aff]/20 overflow-hidden">
              <div className="px-6 py-4 border-b border-[#c58aff]/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="h-5 w-5 text-[#c58aff]" />
                  <h2 className="text-xl font-bold">Recent Podcasts</h2>
                </div>
                <Clock className="h-4 w-4 text-foreground/40" />
              </div>
              
              <div className="p-8">
                <div className="text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#972fff]/10 to-[#c58aff]/10 border border-[#c58aff]/20 mb-4">
                    <Mic className="h-8 w-8 text-[#c58aff]/50" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1.5">No podcasts yet</h3>
                  <p className="text-sm text-foreground/50 mb-5">Start recording to see your podcasts here</p>
                  <button
                    onClick={handleCreateStudio}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#972fff] to-[#c58aff] hover:opacity-90 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-[#972fff]/25 inline-flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Your First Studio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHomePage;
