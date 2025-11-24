import React, { useState, useEffect, useRef } from 'react';
import { config } from '../config/env';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { httpClient } from '../services/httpClient';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Settings, 
  Users, 
  Copy, 
  Check, 
  ArrowLeft,
  MonitorPlay,
  StopCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchTurnCredentials } from '../utils/turnCredentials';
import { 
  sendMessage, 
  joinPodcast, 
  leavePodcast, 
  initializePeerConnection, 
  startCall, 
  handleOffer, 
  handleAnswer, 
  handleICECandidate, 
  endCall, 
  startRecording, 
  stopRecording 
} from '../handlers/handler';

interface Message {
  type: string;
  podcastId?: string;
  from?: string;
  to?: string;
  payload?: any;
  timestamp?: number;
}

const StudioPage: React.FC = () => {
  const { username, uuid } = useParams<{ username: string; uuid: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isConnected, setIsConnected] = useState(false);
  const [podcastId] = useState(uuid || '');
  const [, setRecordingId] = useState('');
  const [clientId, setClientId] = useState('');
  const [isInPodcast, setIsInPodcast] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<string[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [, setRecordingStartTime] = useState<Date | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [storedHostUserId, setStoredHostUserId] = useState<string | null>(null);
  const [isProcessingRecording, setIsProcessingRecording] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const localStreamRef = useRef<MediaStream | null>(null);
  const recordingIdRef = useRef<string>('');
  const callInitiatedRef = useRef<boolean>(false);
  const readySentRef = useRef<boolean>(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const pendingICECandidates = useRef<RTCIceCandidate[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const chunkUploadIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunkCounterRef = useRef(0);
  const isRecordingRef = useRef(false);
  const [iceServers, setIceServers] = useState<RTCConfiguration | null>(null);
  const iceServersRef = useRef<RTCConfiguration | null>(null);

  useEffect(() => {
    fetchTurnCredentials()
      .then((config) => {
        iceServersRef.current = config;
        setIceServers(config);
      })
      .catch((error) => {
        console.error('❌ Failed to load TURN credentials:', error);
        // Set fallback STUN servers
        const fallback = {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
          iceCandidatePoolSize: 10,
          bundlePolicy: 'max-bundle' as RTCBundlePolicy,
          rtcpMuxPolicy: 'require' as RTCRtcpMuxPolicy,
          iceTransportPolicy: 'all' as RTCIceTransportPolicy,
        };
        iceServersRef.current = fallback;
        setIceServers(fallback);
      });
  }, []);

  useEffect(() => {
    connectWebSocket();
    
    const handleBeforeUnload = () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      const currentLocalStream = localVideoRef.current?.srcObject as MediaStream;
      if (currentLocalStream) {
        currentLocalStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      const currentLocalStream = localVideoRef.current?.srcObject as MediaStream;
      if (currentLocalStream) {
        currentLocalStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (isConnected && podcastId && !isInPodcast) {
      handleJoinPodcast();
    }
  }, [isConnected, podcastId, isInPodcast]);

  useEffect(() => {
    const startLocalMedia = async () => {
      if (isInPodcast && !localStream && !localStreamRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
          localStreamRef.current = stream;
          setLocalStream(stream);
        } catch (error) {
          console.error('Failed to get local media:', error);
        }
      }
    };
    
    startLocalMedia();
  }, [isInPodcast]);

  // Send "ready" message when local stream is available
  useEffect(() => {
    if (isInPodcast && localStream && !readySentRef.current && wsRef.current && clientId) {
      console.log('🟢 Local stream ready, sending ready signal');
      readySentRef.current = true;
      sendMessage({
        type: 'ready',
        podcastId: podcastId,
        payload: {
          clientId: clientId,
          timestamp: Date.now()
        }
      }, wsRef);
    }
  }, [isInPodcast, localStream && localStream.id, clientId]);

  useEffect(() => {
    if (podcastId && username) {
      const link = `${window.location.origin}/studio/${username}/${podcastId}`;
      setInviteLink(link);
    }
  }, [podcastId, username]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (user?.id && storedHostUserId) {
      const isHostUser = storedHostUserId === user.id;
      console.log('Host check - userId:', user.id, 'storedHostUserId:', storedHostUserId, 'isHost:', isHostUser);
      setIsHost(isHostUser);
    }
  }, [user?.id, storedHostUserId]);

  // Handle mute/unmute
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted, localStream]);

  // Handle video on/off
  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOff;
      });
    }
  }, [isVideoOff, localStream]);

  const connectWebSocket = () => {
    const ws = new WebSocket(`${config.wsUrl}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to signaling server');
      setIsConnected(true);
    };

    ws.onclose = () => {
      console.log('Disconnected from signaling server');
      setIsConnected(false);
      setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onmessage = (event) => {
      const message: Message = JSON.parse(event.data);
      handleSignalingMessage(message);
    };
  };

  const handleSignalingMessage = async (message: Message) => {
    console.log('Received message:', message);

    switch (message.type) {
      case 'connected':
        setClientId(message.payload.clientId);
        break;

      case 'podcast-joined':
        setIsInPodcast(true);
        setRemoteUsers(message.payload.users || []);
        if (message.payload.podcastId) {
          // setPodcastId(message.payload.podcastId); // Don't update podcastId
        }
        console.log('Podcast joined - userId:', user?.id, 'hostUserId:', message.payload.hostUserId);
        if (message.payload.hostUserId) {
          setStoredHostUserId(message.payload.hostUserId);
        }
        
        if (message.payload.isRecording && message.payload.recordingId) {
          console.log('📡 Recording already in progress, setting recording ID:', message.payload.recordingId);
          setRecordingId(message.payload.recordingId);
          recordingIdRef.current = message.payload.recordingId;
        }
        break;

      case 'user-joined':
        setRemoteUsers(prev => [...prev, message.from!]);
        if (message.payload?.hostUserId) {
          console.log('User joined - updating host info:', message.payload.hostUserId);
          setStoredHostUserId(message.payload.hostUserId);
        }
        break;
      
      case 'both-ready':
        console.log('🎯 Both clients ready! Payload:', message.payload);
        if (message.payload?.shouldInitiate && message.payload?.targetUserId && !callInitiatedRef.current) {
          callInitiatedRef.current = true;
          console.log('🚀 Initiating call to:', message.payload.targetUserId);
          
          // Wait for iceServers to be loaded before starting call (check ref for immediate access)
          const attemptStartCall = async (retries = 10, delay = 500) => {
            const currentIceServers = iceServersRef.current;
            if (!currentIceServers) {
              if (retries > 0) {
                console.log(`⏳ Waiting for ICE servers... (${retries} retries left)`);
                setTimeout(() => attemptStartCall(retries - 1, delay), delay);
                return;
              } else {
                console.error('❌ ICE servers not loaded after retries');
                toast.error('Failed to load TURN credentials. Please refresh.');
                callInitiatedRef.current = false;
                return;
              }
            }
            
            // Start call immediately when ready
            if (!peerConnectionRef.current && currentIceServers) {
              console.log('✅ ICE servers ready, starting call...');
              handleStartCall(message.payload.targetUserId);
            }
          };
          
          attemptStartCall();
        } else if (message.payload) {
          console.log('✋ Waiting for offer from:', message.payload.targetUserId);
        }
        break;

      case 'user-left':
        setRemoteUsers(prev => prev.filter(id => id !== message.from));
        if (message.payload?.hostUserId) {
          console.log('User left - updating host info:', message.payload.hostUserId);
          setStoredHostUserId(message.payload.hostUserId);
        }
        if (isInCall && message.from) {
          console.log('Participant left, cleaning up peer connection');
          if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
          }
          setRemoteStream(null);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
          setIsInCall(false);
          callInitiatedRef.current = false;
          readySentRef.current = false;
          pendingICECandidates.current = [];
        }
        break;

      case 'offer':
        if (peerConnectionRef.current) {
          const pc = peerConnectionRef.current;
          const signalingState = pc.signalingState;
          const connectionState = pc.connectionState;
          const iceConnectionState = pc.iceConnectionState;
          
          console.log('Received offer while peer connection exists:', {
            signalingState,
            connectionState,
            iceConnectionState
          });
          
          if (signalingState === 'stable' && 
              (iceConnectionState === 'checking' || iceConnectionState === 'new' ||
               connectionState === 'connecting' || connectionState === 'new')) {
            console.log('⚠️ Ignoring duplicate offer - ICE negotiation in progress');
            break;
          }
          
          console.log('Closing existing peer connection to handle new offer');
          pc.close();
          peerConnectionRef.current = null;
        }
        
        const currentStream = localStreamRef.current || localStream;
        await handleOffer(
          message,
          (stream) => {
            localStreamRef.current = stream;
            setLocalStream(stream);
          },
          handleInitializePeerConnection,
          pendingICECandidates,
          sendMessage,
          wsRef,
          currentStream
        );
        break;

      case 'answer':
        if (!peerConnectionRef.current) {
          console.warn('Received answer but no peer connection exists');
          break;
        }
        await handleAnswer(message, peerConnectionRef, pendingICECandidates);
        break;

      case 'ice-candidate':
        if (!message.from) {
          console.warn('Received ICE candidate without sender info');
          break;
        }
        await handleICECandidate(message, peerConnectionRef, pendingICECandidates);
        break;

      case 'recording-started':
        console.log('📡 Received recording-started message');
        
        if (message.payload?.recordingId) {
          if (recordingIdRef.current === message.payload.recordingId) {
            console.log('ℹ️ Already have this recording ID, ignoring duplicate message');
            break;
          }
          setRecordingId(message.payload.recordingId);
          recordingIdRef.current = message.payload.recordingId;
          console.log('🎬 Set recording ID:', message.payload.recordingId);
        }
        
        if (message.payload?.hostUserId === user?.id) {
          console.log('ℹ️ Host received their own recording message, setting recording ID and continuing');
          break;
        }
        
        const currentLocalStream = localStreamRef.current;
        
        if (!isRecording && currentLocalStream && !mediaRecorderRef.current) {
          console.log('✅ Participant starting recording automatically');
          handleStartRecording();
        }
        break;

      case 'recording-stopped':
        console.log('📡 Received recording-stopped message');
        
        if (message.payload?.hostUserId === user?.id) {
          console.log('ℹ️ Host received their own stop recording message, ignoring');
          break;
        }
        
        console.log('✅ Participant stopping recording automatically');
        handleStopRecording();
        break;
    }
  };

  const uploadChunk = async (chunks: Blob[], isFinal: boolean): Promise<boolean> => {
    console.log(`📤 uploadChunk called: chunks=${chunks.length}, isFinal=${isFinal}, chunkCounter=${chunkCounterRef.current}`);
    
    // Allow final chunks to upload even if recording stopped (they come from onstop handler)
    if (!isFinal && !isRecordingRef.current) {
      console.log('⏹️ Recording stopped, skipping non-final chunk upload');
      return false;
    }
    
    if (chunks.length === 0 && !isFinal) {
      console.log('⚠️ Empty chunks array and not final, skipping upload');
      return false;
    }

    if (!recordingIdRef.current) {
      console.log('⚠️ No recording ID available, skipping upload');
      return false;
    }

    try {
      // Combine all chunks into a single blob for upload
      const blob = new Blob(chunks, { type: 'video/webm' });
      console.log(`📦 Blob details: size=${blob.size} bytes, type=${blob.type}, chunksInBlob=${chunks.length}`);
      
      if (blob.size === 0 && !isFinal) {
        console.log('⚠️ Empty blob and not final, skipping upload');
        return false;
      }

      const timestamp = Date.now().toString();
      const currentChunkIndex = chunkCounterRef.current;
      const fileName = `chunk_${currentChunkIndex}_${timestamp}.webm`;

      const requestData = {
        file_name: fileName,
        content_type: 'video/webm',
        user_id: clientId,
        podcast_id: podcastId,
        recording_id: recordingIdRef.current,
        timestamp: timestamp,
        is_final: isFinal,
        chunk_index: currentChunkIndex,
        file_size: blob.size
      };
      
      console.log(`🔗 Requesting presigned URL for chunk ${currentChunkIndex}:`, {
        fileName,
        size: blob.size,
        isFinal,
        chunksCount: chunks.length,
        recordingId: recordingIdRef.current
      });
      
      let presignedData
      try {
        presignedData = await httpClient.post<{
        pre_signed_url: string;
        s3_key: string;
        chunk_index: number;
      }>(`${config.uploadBaseUrl}/api/v1/upload/presigned-url`, requestData);
        console.log(`✅ Got presigned URL: S3 key=${presignedData.s3_key}, backend chunk_index=${presignedData.chunk_index}`);
      } catch (error: any) {
        if (error?.response?.status === 403 || error?.status === 403) {
          console.log('🚫 Backend rejected upload (recording ended), stopping chunk uploads');
          if (chunkUploadIntervalRef.current) {
            clearInterval(chunkUploadIntervalRef.current);
            chunkUploadIntervalRef.current = null;
          }
          isRecordingRef.current = false;
          return false;
        }
        throw error;
      }

      console.log(`⬆️ Uploading chunk ${currentChunkIndex} to S3: ${blob.size} bytes (contains ${chunks.length} MediaRecorder chunks)`);
      const uploadResponse = await fetch(presignedData.pre_signed_url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'video/webm',
        },
        body: blob
      });

      if (!uploadResponse.ok) {
        throw new Error(`S3 upload failed: ${uploadResponse.statusText}`);
      }

      chunkCounterRef.current += 1;

      console.log(`✅ Chunk ${currentChunkIndex} uploaded successfully: ${blob.size} bytes, S3 Key: ${presignedData.s3_key}, Next chunk index: ${chunkCounterRef.current}`);
      return true;
    } catch (error) {
      console.error(`❌ Error uploading chunk ${chunkCounterRef.current}:`, error);
      return false;
    }
  };

  const handleJoinPodcast = () => {
    joinPodcast(podcastId, wsRef);
  };

  const handleLeavePodcast = () => {
    if (isRecording) {
      handleStopRecording();
    }
    setRecordingId('');
    recordingIdRef.current = '';
    callInitiatedRef.current = false;
    readySentRef.current = false;
    
    leavePodcast(
      wsRef,
      setIsInPodcast,
      setRemoteUsers,
      () => {},
      isRecording,
      handleStopRecording,
      localStream,
      setLocalStream,
      peerConnectionRef,
      localVideoRef,
      remoteVideoRef,
      setRemoteStream,
      setIsInCall,
      pendingICECandidates
    );
    navigate('/dashboard/home');
  };

  const handleInitializePeerConnection = (targetUserId: string): RTCPeerConnection | null => {
    const currentIceServers = iceServersRef.current || iceServers;
    if (!currentIceServers) {
      console.error('❌ ICE servers not loaded yet, cannot initialize peer connection');
      return null;
    }
    try {
      return initializePeerConnection(
        currentIceServers,
        peerConnectionRef,
        targetUserId,
        sendMessage,
        wsRef,
        setRemoteStream,
        setIsInCall,
        handleEndCall
      );
    } catch (error) {
      console.error('❌ Failed to initialize peer connection:', error);
      return null;
    }
  };

  const handleStartCall = (targetUserId: string) => {
    const currentStream = localStreamRef.current || localStream;
    startCall(
      targetUserId,
      (stream) => {
        localStreamRef.current = stream;
        setLocalStream(stream);
      },
      handleInitializePeerConnection,
      sendMessage,
      wsRef,
      currentStream
    );
  };

  const handleEndCall = () => {
    callInitiatedRef.current = false;
    readySentRef.current = false;
    endCall(
      isRecording,
      handleStopRecording,
      localStream,
      setLocalStream,
      peerConnectionRef,
      localVideoRef,
      remoteVideoRef,
      setRemoteStream,
      setIsInCall,
      pendingICECandidates
    );
  };

  const handleStartRecording = async () => {
    const currentLocalStream = localStreamRef.current || localStream;
    
    if (!currentLocalStream) {
      console.log('❌ Cannot start recording: No local stream available');
      return;
    }
    
    startRecording(
      currentLocalStream,
      mediaRecorderRef,
      recordedChunksRef,
      uploadChunk,
      (value: boolean) => {
        setIsRecording(value);
        isRecordingRef.current = value;
      },
      setRecordingStartTime,
      chunkUploadIntervalRef,
      chunkCounterRef
    );
  };

  const handleStopRecording = async () => {
    stopRecording(
      mediaRecorderRef,
      chunkUploadIntervalRef,
      (value: boolean) => {
        setIsRecording(value);
        isRecordingRef.current = value;
      },
      setRecordingStartTime
    );
  };

  const handleHostStartRecording = () => {
    if (!isHost) {
      console.log('❌ Only the host can control recording');
      return;
    }
    
    if (isProcessingRecording) {
      return;
    }
    
    const currentLocalStream = localStreamRef.current || localStream;
    
    if (!currentLocalStream) {
      console.log('❌ No local stream available');
      toast.warning('Please start a call first to enable recording');
      return;
    }
    
    setIsProcessingRecording(true);
    handleStartRecording();
    
    sendMessage({
      type: 'start-recording',
      podcastId: podcastId,
      payload: {
        hostUserId: user?.id,
        podcastId: podcastId,
        timestamp: Date.now()
      }
    }, wsRef);
    
    setTimeout(() => setIsProcessingRecording(false), 1000);
  };

  const handleHostStopRecording = () => {
    if (!isHost) {
      return;
    }
    
    if (isProcessingRecording) {
      return;
    }
    
    setIsProcessingRecording(true);
    handleStopRecording();
    
    sendMessage({
      type: 'stop-recording',
      podcastId: podcastId,
      payload: {
        hostUserId: user?.id,
        podcastId: podcastId,
        timestamp: Date.now()
      }
    }, wsRef);
    
    setTimeout(() => setIsProcessingRecording(false), 1000);
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(podcastId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy invite link:', err);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-darker text-white flex flex-col">
      {/* Header */}
      <header className="backdrop-blur-xl bg-luxury-dark/80 border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-elegant flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-display font-bold">
                  Studio - {user?.full_name || user?.username || username}
                </h1>
                <p className="text-xs text-white/60">
                  ID: {uuid}
                </p>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                isConnected 
                  ? 'bg-green-500/10 border border-green-500/20' 
                  : 'bg-red-500/10 border border-red-500/20'
              }`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  isConnected ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <span className={`text-xs font-medium ${
                  isConnected ? 'text-green-400' : 'text-red-400'
                }`}>
                  {isConnected ? 'Connected' : 'Connecting...'}
                </span>
              </div>

              {isRecording && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-red-400">
                    Recording
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
                <Users className="w-4 h-4 text-white/60" />
                <span className="text-xs font-medium">
                  {remoteUsers.length + 1}
                </span>
              </div>

              {isHost && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <span className="text-xs font-medium text-yellow-400">
                    🎙️ Host
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleLeavePodcast}
            className="px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Leave Studio
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-6 pt-4 pb-2">
        <div className="max-w-7xl mx-auto h-full">
          {!isInPodcast ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-white/60">Connecting to studio...</p>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6 h-full">
              {/* Local Video */}
              <div className="relative">
                <div className="aspect-video bg-luxury-dark rounded-2xl overflow-hidden border border-white/10 shadow-luxury relative">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {isVideoOff && (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-luxury-darker">
                      <VideoOff className="w-16 h-16 text-white/30" />
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-luxury-dark/80 backdrop-blur-xl border border-white/10 rounded-lg">
                    <p className="text-sm font-medium">
                      You {isHost && "(Host)"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Remote Video / Invite Section */}
              <div className="relative">
                <div className="aspect-video bg-luxury-dark rounded-2xl overflow-hidden border border-white/10 shadow-luxury relative">
                  {remoteUsers.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center p-8">
                      <div className="text-center max-w-md">
                        <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
                        <h3 className="text-xl font-display font-semibold mb-2">
                          Invite participants
                        </h3>
                        <p className="text-white/60 mb-6">
                          Share this link to invite others to join your studio
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={inviteLink}
                            readOnly
                            className="flex-1 px-4 py-3 bg-luxury-darker/50 border border-white/10 rounded-xl text-white text-sm"
                          />
                          <button
                            onClick={copyInviteLink}
                            className="px-4 py-3 bg-gradient-elegant rounded-xl hover:shadow-glow transition-all"
                          >
                            {copied ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <Copy className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      {remoteUsers.length > 0 && !isInCall && (
                        <div className="absolute inset-0 flex items-center justify-center bg-luxury-darker/80">
                          <div className="text-center">
                            <div className="animate-pulse mb-2">
                              <div className="w-20 h-20 rounded-full bg-gradient-elegant flex items-center justify-center mx-auto">
                                <Users className="w-10 h-10" />
                              </div>
                            </div>
                            <p className="text-lg font-medium text-green-400">
                              🔗 Connecting...
                            </p>
                            <p className="text-sm text-white/60 mt-2">
                              Call will start automatically when both are ready
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-luxury-dark/80 backdrop-blur-xl border border-white/10 rounded-lg">
                    <p className="text-sm font-medium">
                      {remoteUsers.length > 0 ? 'Participant' : 'Waiting...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls Footer */}
      <footer className="backdrop-blur-xl bg-luxury-dark/80 border-t border-white/5 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              disabled={!localStream}
              className={`p-3 rounded-xl font-semibold transition-all ${
                isMuted
                  ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                  : 'bg-white/10 border border-white/10 hover:bg-white/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              disabled={!localStream}
              className={`p-3 rounded-xl font-semibold transition-all ${
                isVideoOff
                  ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                  : 'bg-white/10 border border-white/10 hover:bg-white/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isVideoOff ? 'Turn on video' : 'Turn off video'}
            >
              {isVideoOff ? (
                <VideoOff className="w-4 h-4" />
              ) : (
                <Video className="w-4 h-4" />
              )}
            </button>

            <button 
              className="p-3 bg-white/10 border border-white/10 rounded-xl hover:bg-white/20 transition-all" 
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Center Controls - End Call */}
          <div className="flex items-center gap-3">
            {isInCall && (
              <button
                onClick={handleEndCall}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <PhoneOff className="w-4 h-4" />
                End Call
              </button>
            )}
          </div>

          {/* Right Controls - Recording (Host Only) */}
          <div className="flex items-center gap-3">
            {isHost && isInCall && (
              <>
                {!isRecording ? (
                  <button
                    onClick={handleHostStartRecording}
                    disabled={!localStream}
                    className="px-5 py-3 bg-white/10 border border-white/10 rounded-xl hover:bg-white/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MonitorPlay className="w-4 h-4" />
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={handleHostStopRecording}
                    className="px-5 py-3 bg-red-500/20 border border-red-500/40 text-red-400 rounded-xl hover:bg-red-500/30 transition-all flex items-center gap-2"
                  >
                    <StopCircle className="w-4 h-4" />
                    Stop Recording
                  </button>
                )}
              </>
            )}
            {!isHost && isInCall && (
              <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-sm text-white/60">
                  {isRecording ? 'Recording in progress...' : 'Recording controlled by host'}
                </p>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StudioPage;
