import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const StudioPreCheckPage: React.FC = () => {
  const { username, uuid } = useParams<{ username: string; uuid: string }>();
  const navigate = useNavigate();
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
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Failed to access camera and microphone:', error);
    }
  };

  const joinStudio = () => {
    navigate(`/studio/${username}/${uuid}/join`);
  };

  return (
    <div className="h-screen w-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full h-full flex items-center justify-center px-6">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-6xl w-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Studio - {username}
              </h1>
              <p className="text-gray-600">Studio ID: {uuid}</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/home')}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Back to Dashboard
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Let's check your cam and mic
              </h2>
              
              <div className="text-center">
                <button 
                  onClick={accessGranted ? joinStudio : requestAccess}
                  className={`font-bold py-4 px-8 rounded-lg text-xl ${
                    accessGranted
                      ? 'bg-green-500 hover:bg-green-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-700 text-white'
                  }`}
                >
                  {accessGranted ? 'Join studio' : 'Allow access'}
                </button>
              </div>
            </div>
            
            {accessGranted && localStream && (
              <div className="flex-shrink-0">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-80 h-60 bg-gray-200 rounded-lg shadow-md"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioPreCheckPage;
