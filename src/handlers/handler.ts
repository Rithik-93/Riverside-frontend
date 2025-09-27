import React from 'react'

interface Message {
  type: string
  podcastId?: string
  from?: string
  to?: string
  payload?: any
}

export const sendMessage = (message: Message, wsRef: React.RefObject<WebSocket | null>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }

export const joinPodcast = (
    podcastId: string, 
    wsRef: React.RefObject<WebSocket | null>
  ) => {
    if (podcastId.trim() && wsRef.current) {
      sendMessage({
        type: 'join-podcast',
        payload: { podcastId: podcastId.trim() }
      }, wsRef)
    }
  }

export const leavePodcast = (
    wsRef: React.RefObject<WebSocket | null>,
    setIsInPodcast: (value: boolean) => void,
    setRemoteUsers: (value: string[]) => void,
    setPodcastId: (value: string) => void,
    isRecording: boolean,
    stopRecording: () => void,
    localStream: MediaStream | null,
    setLocalStream: (value: MediaStream | null) => void,
    peerConnectionRef: React.RefObject<RTCPeerConnection | null>,
    localVideoRef: React.RefObject<HTMLVideoElement | null>,
    remoteVideoRef: React.RefObject<HTMLVideoElement | null>,
    setRemoteStream: (value: MediaStream | null) => void,
    setIsInCall: (value: boolean) => void,
    pendingICECandidates: React.MutableRefObject<RTCIceCandidate[]>
  ) => {
    sendMessage({ type: 'leave-podcast' }, wsRef)
    setIsInPodcast(false)
    setRemoteUsers([])
    setPodcastId('')
    
    if (isRecording) {
      stopRecording()
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }
    
    setRemoteStream(null)
    setIsInCall(false)
    pendingICECandidates.current = []
  }

export const initializePeerConnection = (
    iceServers: RTCConfiguration,
    peerConnectionRef: React.RefObject<RTCPeerConnection | null>,
    remoteUsers: string[],
    sendMessage: (message: Message, wsRef: React.RefObject<WebSocket | null>) => void,
    wsRef: React.RefObject<WebSocket | null>,
    setRemoteStream: (value: MediaStream | null) => void,
    setIsInCall: (value: boolean) => void,
    endCall: () => void
  ) => {
    const pc = new RTCPeerConnection(iceServers)
    peerConnectionRef.current = pc

    pc.onicecandidate = async (event) => {
      if (event.candidate && remoteUsers.length > 0) {
        sendMessage({
          type: 'ice-candidate',
          to: remoteUsers[0],
          payload: {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex
          }
        }, wsRef)
      }
    }

    pc.ontrack = (event) => {
      console.log('Received remote stream')
      setRemoteStream(event.streams[0])
    }

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState)
      if (pc.connectionState === 'connected') {
        setIsInCall(true)
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        endCall()
      }
    }

    return pc
  }

export const startCall = async (
    targetUserId: string,
    setLocalStream: (value: MediaStream | null) => void,
    initializePeerConnection: () => RTCPeerConnection,
    sendMessage: (message: Message, wsRef: React.RefObject<WebSocket | null>) => void,
    wsRef: React.RefObject<WebSocket | null>
  ) => {
    console.log('📞 startCall function called')
    console.log('📞 targetUserId:', targetUserId)
    
    try {
      console.log('📞 Requesting user media...')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      console.log('📞 Got user media stream:', stream)
      console.log('📞 Stream tracks:', stream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled })))
      
      setLocalStream(stream)
      console.log('📞 setLocalStream called with stream')
      
      const pc = initializePeerConnection()
      
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
      })

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      sendMessage({
        type: 'offer',
        to: targetUserId,
        payload: { sdp: offer.sdp }
      }, wsRef)

    } catch (error) {
      console.error('Error starting call:', error)
      alert('Error accessing camera/microphone: ' + error)
    }
  }

export const handleOffer = async (
    message: Message,
    setLocalStream: (value: MediaStream | null) => void,
    initializePeerConnection: () => RTCPeerConnection,
    pendingICECandidates: React.MutableRefObject<RTCIceCandidate[]>,
    sendMessage: (message: Message, wsRef: React.RefObject<WebSocket | null>) => void,
    wsRef: React.RefObject<WebSocket | null>
  ) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      setLocalStream(stream)
      
      const pc = initializePeerConnection()
      
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
      })

      await pc.setRemoteDescription({
        type: 'offer',
        sdp: message.payload.sdp
      })

      for (const candidate of pendingICECandidates.current) {
        await pc.addIceCandidate(candidate)
      }
      pendingICECandidates.current = []

      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      sendMessage({
        type: 'answer',
        to: message.from!,
        payload: { sdp: answer.sdp }
      }, wsRef)

    } catch (error) {
      console.error('Error handling offer:', error)
    }
  }

export const handleAnswer = async (
    message: Message,
    peerConnectionRef: React.RefObject<RTCPeerConnection | null>,
    pendingICECandidates: React.MutableRefObject<RTCIceCandidate[]>
  ) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription({
          type: 'answer',
          sdp: message.payload.sdp
        })

        for (const candidate of pendingICECandidates.current) {
          await peerConnectionRef.current.addIceCandidate(candidate)
        }
        pendingICECandidates.current = []
      }
    } catch (error) {
      console.error('Error handling answer:', error)
    }
  }

export const handleICECandidate = async (
    message: Message,
    peerConnectionRef: React.RefObject<RTCPeerConnection | null>,
    pendingICECandidates: React.MutableRefObject<RTCIceCandidate[]>
  ) => {
    try {
      const candidate = new RTCIceCandidate({
        candidate: message.payload.candidate,
        sdpMid: message.payload.sdpMid,
        sdpMLineIndex: message.payload.sdpMLineIndex
      })

      if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
        await peerConnectionRef.current.addIceCandidate(candidate)
      } else {
        pendingICECandidates.current.push(candidate)
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error)
    }
  }

export const endCall = (
    isRecording: boolean,
    stopRecording: () => void,
    localStream: MediaStream | null,
    setLocalStream: (value: MediaStream | null) => void,
    peerConnectionRef: React.RefObject<RTCPeerConnection | null>,
    localVideoRef: React.RefObject<HTMLVideoElement | null>,
    remoteVideoRef: React.RefObject<HTMLVideoElement | null>,
    setRemoteStream: (value: MediaStream | null) => void,
    setIsInCall: (value: boolean) => void,
    pendingICECandidates: React.MutableRefObject<RTCIceCandidate[]>
  ) => {
    if (isRecording) {
      stopRecording()
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }
    
    setRemoteStream(null)
    setIsInCall(false)
    pendingICECandidates.current = []
  }

const getSupportedMimeType = (): string => {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4;codecs=h264,aac',
    'video/mp4',
  ]
  
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      console.log('Using MIME type:', type)
      return type
    }
  }
  
  console.warn('No supported MIME type found, using default')
  return ''
}

export const startRecording = async (
    localStream: MediaStream | null,
    mediaRecorderRef: React.RefObject<MediaRecorder | null>,
    recordedChunksRef: React.MutableRefObject<Blob[]>,
    uploadChunk: (chunks: Blob[], isFinal: boolean) => Promise<void>,
    setIsRecording: (value: boolean) => void,
    setRecordingStartTime: (value: Date | null) => void,
    chunkUploadIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>
  ) => {
    if (!localStream) {
      alert('No local stream available for recording')
      return
    }

    if (!window.MediaRecorder) {
      alert('MediaRecorder is not supported in this browser. Please use Chrome, Firefox, or Edge.')
      return
    }
  
    try {
      const mimeType = getSupportedMimeType()
      const options = mimeType ? { mimeType } : {}
      
      console.log('Creating MediaRecorder with options:', options)
      console.log('Local stream tracks:', localStream.getTracks().map(track => ({
        kind: track.kind,
        enabled: track.enabled,
        readyState: track.readyState
      })))
      
      const mediaRecorder = new MediaRecorder(localStream, options)
  
      mediaRecorderRef.current = mediaRecorder
      recordedChunksRef.current = []
  
      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available, size:', event.data.size, 'bytes')
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
          console.log('Total chunks:', recordedChunksRef.current.length)
        }
      }
  
      mediaRecorder.onstop = () => {
        if (recordedChunksRef.current.length > 0) {
          uploadChunk(recordedChunksRef.current, true)
        }
      }
  
      try {
        mediaRecorder.start(1000)
      } catch (startError) {
        console.warn('Failed to start with 1000ms timeslice, trying 2000ms:', startError)
        try {
          mediaRecorder.start(2000)
        } catch (secondError) {
          console.warn('Failed to start with 2000ms timeslice, trying without timeslice:', secondError)
          mediaRecorder.start()
        }
      }
      
      setIsRecording(true)
      setRecordingStartTime(new Date())

      chunkUploadIntervalRef.current = setInterval(() => {
        console.log('Upload interval triggered, chunks:', recordedChunksRef.current.length)
        if (recordedChunksRef.current.length > 0) {
          uploadChunk(recordedChunksRef.current, false)
          recordedChunksRef.current = []
        }
      }, 10000)

    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Error starting recording: ' + error + '\n\nThis might be due to browser compatibility. Try using Chrome or Firefox.')
    }
  }

export const stopRecording = (
    mediaRecorderRef: React.RefObject<MediaRecorder | null>,
    chunkUploadIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>,
    setIsRecording: (value: boolean) => void,
    setRecordingStartTime: (value: Date | null) => void
  ) => {
    console.log('🛑 stopRecording function called')
    console.log('🛑 mediaRecorderRef.current:', mediaRecorderRef.current)
    console.log('🛑 mediaRecorder state:', mediaRecorderRef.current?.state)
    console.log('🛑 chunkUploadIntervalRef.current:', chunkUploadIntervalRef.current)
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      console.log('🛑 Stopping MediaRecorder')
      mediaRecorderRef.current.stop()
    } else {
      console.log('🛑 MediaRecorder not recording or not available')
    }
    
    if (chunkUploadIntervalRef.current) {
      console.log('🛑 Clearing upload interval')
      clearInterval(chunkUploadIntervalRef.current)
      chunkUploadIntervalRef.current = null
    } else {
      console.log('🛑 No upload interval to clear')
    }
    
    console.log('🛑 Setting isRecording to false')
    setIsRecording(false)
    setRecordingStartTime(null)
  }