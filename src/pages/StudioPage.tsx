import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WebRTCCall from '../components/WebRTCCall';
import { Video, ArrowLeft, Check, Sparkles } from 'lucide-react';

const StudioPage: React.FC = () => {
  const { username, uuid } = useParams<{ username: string; uuid: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasJoined, setHasJoined] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const requestAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: true 
      });
      setLocalStream(stream);
      setAccessGranted(true);
    } catch (error) {
      console.error('Failed to access camera and microphone:', error);
    }
  };

  useEffect(() => {
    if (localStream && videoRef.current) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const joinStudio = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setHasJoined(true);
  };

  if (hasJoined) {
    return <WebRTCCall />;
  }

  return (
    <div className="h-screen w-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#972fff]/5 via-background to-[#c58aff]/5" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#972fff]/5 via-transparent to-transparent" />
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard/home')}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-background/80 backdrop-blur-xl border border-[#c58aff]/20 hover:border-[#c58aff]/40 transition-all text-foreground/70 hover:text-foreground group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Dashboard</span>
      </button>

      <div className="w-full max-w-6xl mx-auto px-6 relative">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#972fff] to-[#c58aff] rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
          <div className="relative bg-background/90 backdrop-blur-xl rounded-2xl border border-[#c58aff]/20 p-6 md:p-8 shadow-2xl">
            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#c58aff]/20 bg-[#972fff]/5 mb-3">
                <Sparkles className="h-3.5 w-3.5 text-[#c58aff]" />
                <span className="text-xs text-foreground/70">Studio Setup</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1.5">
                Studio - <span className="bg-gradient-to-r from-[#c58aff] to-[#ebd7ff] bg-clip-text text-transparent">{user?.full_name || user?.username || username}</span>
              </h1>
              <div className="flex items-center gap-2 text-foreground/60 text-sm">
                <span>Studio ID:</span>
                <code className="px-2 py-1 rounded-lg bg-[#972fff]/10 border border-[#c58aff]/20 text-xs font-mono text-[#c58aff]">{uuid}</code>
              </div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6 items-center">
              {/* Left Side - Instructions */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-3">
                    Let's check your setup
                  </h2>
                  <p className="text-foreground/60 mb-4">
                    Host: <span className="text-[#c58aff] font-semibold">{user?.full_name || user?.username || username}</span>
                  </p>
                </div>

                {!accessGranted ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-[#972fff]/5 border border-[#c58aff]/20">
                      <p className="text-xs text-foreground/70 leading-relaxed">
                        We need access to your camera and microphone to start the studio session. 
                        Your privacy is important - you can revoke access at any time.
                      </p>
                    </div>
                    
                    <button 
                      onClick={requestAccess}
                      className="w-full py-3 bg-gradient-to-r from-[#972fff] to-[#c58aff] hover:opacity-90 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-[#972fff]/25 flex items-center justify-center gap-2"
                    >
                      <Video className="h-4 w-4" />
                      Allow Camera & Microphone Access
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-green-400 mb-0.5">Access Granted!</p>
                        <p className="text-xs text-foreground/60">Your camera and microphone are ready</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={joinStudio}
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-green-600/25 flex items-center justify-center gap-2"
                    >
                      <Video className="h-4 w-4" />
                      Join Studio Session
                    </button>
                  </div>
                )}
              </div>
              
              {/* Right Side - Video Preview */}
              <div className="relative">
                {accessGranted && localStream ? (
                  <div className="relative group/video">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#972fff] to-[#c58aff] rounded-xl blur opacity-20" />
                    <div className="relative overflow-hidden rounded-xl border border-[#c58aff]/30 shadow-2xl">
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full aspect-video bg-background/50 object-cover"
                      />
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-background/90 backdrop-blur-sm border border-[#c58aff]/20">
                        <span className="text-xs font-semibold text-[#c58aff]">Preview</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#972fff]/50 to-[#c58aff]/50 rounded-xl blur opacity-20" />
                    <div className="relative aspect-video rounded-xl border border-[#c58aff]/20 bg-gradient-to-br from-[#972fff]/5 to-[#c58aff]/5 flex items-center justify-center backdrop-blur-xl">
                      <div className="text-center">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#972fff]/20 to-[#c58aff]/20 border border-[#c58aff]/30 mb-3">
                          <Video className="h-8 w-8 text-[#c58aff]/50" />
                        </div>
                        <p className="text-sm text-foreground/40 font-medium">Camera preview will appear here</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioPage;
