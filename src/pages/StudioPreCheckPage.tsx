import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const StudioPreCheckPage: React.FC = () => {
  const { username, uuid } = useParams<{ username: string; uuid: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
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
      toast.error('Failed to access camera and microphone. Please allow permissions and try again.');
    }
  };

  useEffect(() => {
    if (localStream && videoRef.current) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const joinStudio = () => {
    // Stop the preview stream before navigating
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    navigate(`/studio/${username}/${uuid}/live`);
  };

  const handleBackToDashboard = () => {
    // Clean up stream before navigating
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    navigate('/dashboard/home');
  };

  return (
    <div className="min-h-screen bg-luxury-darker text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#972fff]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#c58aff]/10 rounded-full blur-3xl" />

      <div className="w-full max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">
            Studio - {user?.full_name || user?.username || username}
          </h1>
          <p className="text-white/60">
            Studio ID: {uuid}
          </p>
        </div>

        {/* Preview Card */}
        <div className="bg-luxury-dark/50 backdrop-blur-xl border border-white/10 rounded-3xl max-w-2xl max-h-lg mx-auto p-8 shadow-luxury">
          <h2 className="text-2xl font-display font-semibold mb-6 text-center">
            Let's check your cam and mic
          </h2>

          {/* Video Preview */}
          <div className="relative aspect-video bg-luxury-darker rounded-2xl overflow-hidden mb-6 border border-white/10">
            {accessGranted ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 text-white/30 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-white/60">
                    Camera preview will appear here
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {!accessGranted ? (
              <button
                onClick={requestAccess}
                className="flex-1 py-1 bg-gradient-elegant h-12 rounded-xl font-semibold hover:shadow-glow transition-all"
              >
                Allow access
              </button>
            ) : (
              <button
                onClick={joinStudio}
                className="flex-1 py-4 bg-gradient-elegant rounded-xl font-semibold hover:shadow-glow transition-all"
              >
                Join studio
              </button>
            )}
            <button
              onClick={handleBackToDashboard}
              className="px-6 py-4 border border-white/10 rounded-xl font-semibold hover:bg-white/5 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioPreCheckPage;
