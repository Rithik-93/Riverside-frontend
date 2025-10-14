import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { httpClient } from '../services/httpClient';
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

const RecordingTimer = ({ startTime }: { startTime: Date }) => {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  return <div className="recording-info">Recording: {elapsed}s</div>
}

interface Message {
  type: string
  podcastId?: string
  from?: string
  to?: string
  payload?: any
  timestamp?: number
}

const WebRTCCall: React.FC = () => {
  const { username, uuid } = useParams<{ username: string; uuid: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isConnected, setIsConnected] = useState(false)
  const [podcastId, setPodcastId] = useState(uuid || '')
  const [ _, setRecordingId] = useState('')
  const [clientId, setClientId] = useState('')
  const [isInPodcast, setIsInPodcast] = useState(false)
  const [isInCall, setIsInCall] = useState(false)
  const [remoteUsers, setRemoteUsers] = useState<string[]>([])
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null)
  const [isHost, setIsHost] = useState(false)
  const [storedHostUserId, setStoredHostUserId] = useState<string | null>(null)
  const [isProcessingRecording, setIsProcessingRecording] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  
  const localStreamRef = useRef<MediaStream | null>(null)
  const recordingIdRef = useRef<string>('')
  const callInitiatedRef = useRef<boolean>(false) // Track if we've already initiated a call
  
  const wsRef = useRef<WebSocket | null>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const pendingICECandidates = useRef<RTCIceCandidate[]>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const chunkUploadIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  }

  useEffect(() => {
    connectWebSocket()
    
    const handleBeforeUnload = () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      const currentLocalStream = localVideoRef.current?.srcObject as MediaStream
      if (currentLocalStream) {
        currentLocalStream.getTracks().forEach(track => track.stop())
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      const currentLocalStream = localVideoRef.current?.srcObject as MediaStream
      if (currentLocalStream) {
        currentLocalStream.getTracks().forEach(track => track.stop())
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null
      }
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  useEffect(() => {
    if (isConnected && podcastId && !isInPodcast) {
      console.log('Auto-joining podcast:', podcastId)
      handleJoinPodcast()
    }
  }, [isConnected, podcastId, isInPodcast])

  useEffect(() => {
    const startLocalMedia = async () => {
      if (isInPodcast && !localStream && !localStreamRef.current) {
        try {
          console.log('📹 Auto-starting local media stream...')
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          })
          console.log('📹 Got local media stream:', stream)
          localStreamRef.current = stream
          setLocalStream(stream)
        } catch (error) {
          console.error('❌ Failed to get local media:', error)
        }
      }
    }
    
    startLocalMedia()
  }, [isInPodcast])

  useEffect(() => {
    if (isInPodcast && !isInCall && remoteUsers.length > 0 && localStream && clientId && !peerConnectionRef.current && !callInitiatedRef.current) {
      const shouldInitiate = clientId > remoteUsers[0]
      
      if (shouldInitiate) {
        console.log('📞 Auto-starting call with remote user:', remoteUsers[0])
        callInitiatedRef.current = true
        setTimeout(() => {
          if (!peerConnectionRef.current) {
            handleStartCall(remoteUsers[0])
          }
        }, 500)
      } else {
        console.log('📞 Waiting for remote user to initiate call')
      }
    }
  }, [isInPodcast, isInCall, remoteUsers.length, localStream && localStream.id, clientId])

  useEffect(() => {
    if (podcastId && username) {
      const link = `${window.location.origin}/studio/${username}/${podcastId}`
      setInviteLink(link)
    }
  }, [podcastId, username])

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      console.log('Invite link copied to clipboard')
    } catch (err) {
      console.error('Failed to copy invite link:', err)
    }
  }

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  useEffect(() => {
    if (user?.id && storedHostUserId) {
      const isHostUser = storedHostUserId === user.id
      console.log('Host check - userId:', user.id, 'storedHostUserId:', storedHostUserId, 'isHost:', isHostUser)
      setIsHost(isHostUser)
    }
  }, [user?.id, storedHostUserId])

  const connectWebSocket = () => {
    const ws = new WebSocket('ws://localhost:8080/ws')
    wsRef.current = ws

    ws.onopen = () => {
      console.log('Connected to signaling server')
      setIsConnected(true)
    }

    ws.onclose = () => {
      console.log('Disconnected from signaling server')
      setIsConnected(false)
      setTimeout(connectWebSocket, 3000)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.onmessage = (event) => {
      const message: Message = JSON.parse(event.data)
      handleSignalingMessage(message)
    }
  }

  const handleSignalingMessage = async (message: Message) => {
    console.log('Received message:', message)

    switch (message.type) {
      case 'connected':
        setClientId(message.payload.clientId)
        break

      case 'podcast-joined':
        setIsInPodcast(true)
        setRemoteUsers(message.payload.users || [])
        if (message.payload.podcastId) {
          setPodcastId(message.payload.podcastId)
        }
        console.log('Podcast joined - userId:', user?.id, 'hostUserId:', message.payload.hostUserId)
        if (message.payload.hostUserId) {
          setStoredHostUserId(message.payload.hostUserId)
        }
        
        // If recording is already in progress when joining, set the recording ID
        if (message.payload.isRecording && message.payload.recordingId) {
          console.log('📡 Recording already in progress, setting recording ID:', message.payload.recordingId)
          setRecordingId(message.payload.recordingId)
          recordingIdRef.current = message.payload.recordingId
        }
        break

      case 'user-joined':
        setRemoteUsers(prev => [...prev, message.from!])
        if (message.payload?.hostUserId) {
          console.log('User joined - updating host info:', message.payload.hostUserId)
          setStoredHostUserId(message.payload.hostUserId)
        }
        break

      case 'user-left':
        setRemoteUsers(prev => prev.filter(id => id !== message.from))
        if (message.payload?.hostUserId) {
          console.log('User left - updating host info:', message.payload.hostUserId)
          setStoredHostUserId(message.payload.hostUserId)
        }
        if (isInCall && message.from) {
          // Clean up peer connection and remote stream, but keep local stream
          console.log('Participant left, cleaning up peer connection')
          if (peerConnectionRef.current) {
            peerConnectionRef.current.close()
            peerConnectionRef.current = null
          }
          setRemoteStream(null)
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null
          }
          setIsInCall(false)
          callInitiatedRef.current = false // Reset so we can initiate again if they rejoin
          pendingICECandidates.current = []
        }
        break

      case 'offer':
        const currentStream = localStreamRef.current || localStream
        await handleOffer(
          message,
          (stream) => {
            localStreamRef.current = stream
            setLocalStream(stream)
          },
          handleInitializePeerConnection,
          pendingICECandidates,
          sendMessage,
          wsRef,
          currentStream // Pass existing stream
        )
        break

      case 'answer':
        await handleAnswer(message, peerConnectionRef, pendingICECandidates)
        break

      case 'ice-candidate':
        await handleICECandidate(message, peerConnectionRef, pendingICECandidates)
        break

      case 'recording-started':
        console.log('📡 Received recording-started message')
        console.log('📡 Host UserID:', message.payload?.hostUserId)
        console.log('📡 Current clientId:', clientId)
        console.log('📡 isRecording:', isRecording)
        console.log('📡 localStream (state):', localStream)
        console.log('📡 localStreamRef (ref):', localStreamRef.current)
        console.log('📡 isInCall:', isInCall)
        
        if (message.payload?.recordingId) {
          // Check if we already have this recording ID
          if (recordingIdRef.current === message.payload.recordingId) {
            console.log('ℹ️ Already have this recording ID, ignoring duplicate message')
            break
          }
          setRecordingId(message.payload.recordingId)
          recordingIdRef.current = message.payload.recordingId
          console.log('🎬 Set recording ID:', message.payload.recordingId)
        }
        
        if (message.payload?.hostUserId === user?.id) {
          console.log('ℹ️ Host received their own recording message, setting recording ID and continuing')
        }
        
        const currentLocalStream = localStreamRef.current
        
        if (!isRecording && currentLocalStream) {
          console.log('✅ Participant starting recording automatically')
          handleStartRecording()
        } else if (!isRecording && !currentLocalStream) {
          console.log('❌ Participant cannot start recording: No local stream available')
          console.log('💡 Participant needs to start a call first to enable recording')
        } else if (isRecording) {
          console.log('ℹ️ Already recording, ignoring message')
        }
        break

      case 'recording-stopped':
        console.log('📡 Received recording-stopped message')
        console.log('📡 Host UserID:', message.payload?.hostUserId)
        console.log('📡 Current clientId:', clientId)
        console.log('📡 isRecording:', isRecording)
        console.log('📡 localStream (state):', localStream)
        console.log('📡 localStreamRef (ref):', localStreamRef.current)
        
        if (message.payload?.hostUserId === user?.id) {
          console.log('ℹ️ Host received their own stop recording message, ignoring')
          break
        }
        
        console.log('✅ Participant stopping recording automatically')
        handleStopRecording()
        // Clear recording ID after stopping
        setRecordingId('')
        recordingIdRef.current = ''
        break
    }
  }

  const createRecordingSession = async () => {
    try {
      console.log('✅ Recording session created by signaling server - no additional upload session needed')
    } catch (error) {
      console.error('Error creating recording session:', error)
    }
  }

  const finalizeRecordingSession = async () => {
    try {
      console.log('✅ Recording session finalized by signaling server')
    } catch (error) {
      console.error('Error finalizing recording session:', error)
    }
  }

  const chunkCounterRef = useRef(0)

  const uploadChunk = async (chunks: Blob[], isFinal: boolean) => {
    console.log('uploadChunk called with', chunks.length, 'chunks, isFinal:', isFinal)
    if (chunks.length === 0) return

    // Don't upload if we don't have a valid recording ID
    if (!recordingIdRef.current) {
      console.log('⚠️ No recording ID available, skipping upload')
      return
    }

    try {
      const blob = new Blob(chunks, { type: 'video/webm' })
      console.log('Blob size:', blob.size, 'bytes')
      
      if (blob.size === 0 && !isFinal) {
        console.log('Empty chunk, not uploading')
        return
      }

      const timestamp = Date.now().toString()
      const currentChunkIndex = chunkCounterRef.current
      const fileName = `chunk_${currentChunkIndex}_${timestamp}.webm`

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
      }
      
      console.log('🔍 DEBUG: Sending presigned URL request with data:', requestData)
      
      const presignedData = await httpClient.post<{
        pre_signed_url: string;
        s3_key: string;
        chunk_index: number;
      }>('http://localhost:8082/api/v1/upload/presigned-url', requestData)
      console.log('Got presigned URL:', presignedData.s3_key, 'Chunk index:', presignedData.chunk_index)

      const uploadResponse = await fetch(presignedData.pre_signed_url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'video/webm',
          'x-amz-acl': 'public-read',
        },
        body: blob
      })

      if (!uploadResponse.ok) {
        throw new Error(`S3 upload failed: ${uploadResponse.statusText}`)
      }

      chunkCounterRef.current += 1

      console.log(`✅ Chunk ${currentChunkIndex} uploaded to S3 successfully: ${blob.size} bytes, S3 Key: ${presignedData.s3_key}`)
    } catch (error) {
      console.error('Error uploading chunk:', error)
    }
  }

  const handleJoinPodcast = () => {
    joinPodcast(podcastId, wsRef)
  }

  const handleLeavePodcast = () => {
    // Clear recording state when leaving
    if (isRecording) {
      handleStopRecording()
    }
    setRecordingId('')
    recordingIdRef.current = ''
    callInitiatedRef.current = false // Reset call initiation flag
    
    leavePodcast(
      wsRef,
      setIsInPodcast,
      setRemoteUsers,
      setPodcastId,
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
    )
    navigate('/dashboard/home')
  }

  const handleInitializePeerConnection = () => {
    return initializePeerConnection(
      iceServers,
      peerConnectionRef,
      remoteUsers,
      sendMessage,
      wsRef,
      setRemoteStream,
      setIsInCall,
      handleEndCall
    )
  }

  const handleStartCall = (targetUserId: string) => {
    const currentStream = localStreamRef.current || localStream
    startCall(
      targetUserId,
      (stream) => {
        localStreamRef.current = stream
        setLocalStream(stream)
      },
      handleInitializePeerConnection,
      sendMessage,
      wsRef,
      currentStream // Pass existing stream
    )
  }

  const handleEndCall = () => {
    callInitiatedRef.current = false // Reset call initiation flag
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
    )
  }

  const handleStartRecording = async () => {
    const currentLocalStream = localStreamRef.current || localStream
    
    if (!currentLocalStream) {
      console.log('❌ Cannot start recording: No local stream available')
      return
    }
    
    await createRecordingSession()
    
    startRecording(
      currentLocalStream,
      mediaRecorderRef,
      recordedChunksRef,
      uploadChunk,
      setIsRecording,
      setRecordingStartTime,
      chunkUploadIntervalRef
    )
  }

  const handleStopRecording = async () => {
    stopRecording(
      mediaRecorderRef,
      chunkUploadIntervalRef,
      setIsRecording,
      setRecordingStartTime,
      chunkCounterRef
    )
    
    await finalizeRecordingSession()
  }

  const handleHostStartRecording = () => {
    
    if (!isHost) {
      console.log('❌ Only the host can control recording')
      return
    }
    
    if (isProcessingRecording) {
      console.log('⏳ Recording command already being processed, ignoring')
      return
    }
    
    const currentLocalStream = localStreamRef.current || localStream
    
    if (!currentLocalStream) {
      console.log('❌ No local stream available')
      alert('Please start a call first to enable recording')
      return
    }
    
    setIsProcessingRecording(true)
    console.log('✅ Starting recording for host')
    handleStartRecording()
    
    console.log('✅ Sending start-recording message to participants')
    sendMessage({
      type: 'start-recording',
      podcastId: podcastId,
      payload: {
        hostUserId: user?.id,
        podcastId: podcastId,
        timestamp: Date.now()
      }
    }, wsRef)
    
    setTimeout(() => setIsProcessingRecording(false), 1000)
  }

  const handleHostStopRecording = () => {
    if (!isHost) {
      console.log('Only the host can control recording')
      return
    }
    
    if (isProcessingRecording) {
      console.log('⏳ Recording command already being processed, ignoring')
      return
    }
    
    setIsProcessingRecording(true)
    console.log('✅ Stopping recording for host')
    handleStopRecording()
    
    console.log('✅ Sending stop-recording message to participants')
    sendMessage({
      type: 'stop-recording',
      podcastId: podcastId,
      payload: {
        hostUserId: user?.id,
        podcastId: podcastId,
        timestamp: Date.now()
      }
    }, wsRef)
    
    // Clear recording ID after stopping
    setRecordingId('')
    recordingIdRef.current = ''
    
    setTimeout(() => setIsProcessingRecording(false), 1000)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">
                Studio - {username}
              </h1>
              <p className="text-gray-300">Studio ID: {uuid}</p>
              <div className="connection-status text-sm text-gray-400 mt-2">
                Status: {isConnected ? 'Connected' : 'Disconnected'}
                {clientId && <span> | Client ID: {clientId}</span>}
                {user && <span> | User: {user.username}</span>}
              </div>
            </div>

            <main className="app-main">
              {!isInPodcast ? (
                <div className="room-section">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    {isConnected ? 'Joining Podcast...' : 'Connecting...'}
                  </h2>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Enter podcast ID"
                      value={podcastId}
                      onChange={(e) => setPodcastId(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleJoinPodcast()}
                      className="flex-1 px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button 
                      onClick={handleJoinPodcast} 
                      disabled={!isConnected || !podcastId.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Join Podcast
                    </button>
                  </div>
                  {isConnected && (
                    <div className="mt-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                      <p className="text-gray-300 mt-2">Auto-joining your studio...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="call-section">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      {isHost && (
                        <div className="bg-yellow-600 text-white px-4 py-2 rounded-lg inline-block">
                          <span className="font-bold">🎙️ You are the Host</span>
                          <span className="text-sm ml-2">- You control recording and manage the studio</span>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={handleLeavePodcast} 
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Leave Podcast
                    </button>
                  </div>

                  {/* Two Video Boxes Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Your Video */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-white mb-2">You</h4>
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full aspect-video bg-gray-600 rounded"
                      />
                    </div>
                    
                    {/* Participant Video or Invite Section */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-white mb-2">Participants</h4>
                      {remoteUsers.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-white mb-2">Invite people</h3>
                            <p className="text-gray-300 mb-4">Share this link to invite guests to your studio.</p>
                          </div>
                          
                          <div className="w-full max-w-md">
                            <div className="flex space-x-2 mb-4">
                              <input
                                type="text"
                                value={inviteLink}
                                readOnly
                                className="flex-1 px-3 py-2 bg-gray-600 text-white border border-gray-500 rounded-md text-sm"
                              />
                              <button 
                                onClick={copyInviteLink}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                              >
                                Copy Link
                              </button>
                            </div>
                            <p className="text-gray-400 text-xs">
                              Studio ID: {podcastId}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full aspect-video bg-gray-600 rounded"
                          />
                          {remoteUsers.length > 0 && !isInCall && (
                            <div className="text-center">
                              <button 
                                onClick={() => handleStartCall(remoteUsers[0])}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                              >
                                Start Call
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Recording Controls */}
                  {isInCall && (
                    <div className="call-controls bg-gray-700 rounded-lg p-4">
                      <button 
                        onClick={handleEndCall} 
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-4"
                      >
                        End Call
                      </button>
                      
                      <div className="debug-info text-xs text-gray-400 mb-4">
                        UserID: {user?.id} | Host: {isHost ? 'Yes' : 'No'} | Podcast: {podcastId}
                      </div>
                      
                      {isHost ? (
                        <div className="host-controls bg-yellow-900 bg-opacity-30 p-4 rounded-lg border border-yellow-600">
                          <div className="host-indicator text-yellow-400 mb-3 font-bold text-lg">🎙️ You are the Host</div>
                          <div className="mb-4">
                            <button 
                              onClick={isRecording ? handleHostStopRecording : handleHostStartRecording}
                              className={`record-btn host-record-btn ${isRecording ? 'recording' : ''} ${!localStream ? 'disabled' : ''} bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                              disabled={!localStream}
                            >
                              {!localStream ? 'Start Call First' : (isRecording ? '🛑 Stop Recording (All)' : '🎬 Start Recording (All)')}
                            </button>
                          </div>
                          {!localStream && (
                            <div className="recording-hint text-yellow-200 text-sm">
                              💡 Start a call with another user first to enable recording
                            </div>
                          )}
                          {localStream && !isRecording && (
                            <div className="recording-hint text-green-200 text-sm">
                              ✅ Ready to record! Click the button above to start recording for all participants.
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="participant-controls">
                          <div className="participant-indicator text-blue-400 mb-2">
                            Participant - Recording controlled by host
                          </div>
                          {!localStream && (
                            <div className="participant-hint text-gray-400 text-sm">
                              Start a call to enable recording
                            </div>
                          )}
                          {isRecording && (
                            <div className="recording-status text-red-400 text-sm">
                              Recording in progress...
                            </div>
                          )}
                        </div>
                      )}
                      
                      {isRecording && recordingStartTime && (
                        <RecordingTimer startTime={recordingStartTime} />
                      )}
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WebRTCCall
