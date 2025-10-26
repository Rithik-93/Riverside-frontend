import React from 'react'
import { toast } from 'sonner'

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
    targetUserId: string,
    sendMessage: (message: Message, wsRef: React.RefObject<WebSocket | null>) => void,
    wsRef: React.RefObject<WebSocket | null>,
    setRemoteStream: (value: MediaStream | null) => void,
    setIsInCall: (value: boolean) => void,
    endCall: () => void
  ) => {
    console.log('🟢 initializePeerConnection: Creating new RTCPeerConnection')
    console.log('🟢 initializePeerConnection: ICE servers:', iceServers)
    console.log('🟢 initializePeerConnection: Target user:', targetUserId)
    const pc = new RTCPeerConnection(iceServers)
    peerConnectionRef.current = pc

    pc.onicecandidate = async (event) => {
      if (event.candidate && targetUserId) {
        const candidateStr = event.candidate.candidate
        let candidateType = 'unknown'
        if (candidateStr.includes('typ host')) candidateType = 'host'
        else if (candidateStr.includes('typ srflx')) candidateType = 'srflx (STUN)'
        else if (candidateStr.includes('typ relay')) candidateType = 'relay (TURN)'
        else if (candidateStr.includes('typ prflx')) candidateType = 'prflx'
        
        console.log(`🟢 ICE candidate [${candidateType}] generated, sending to`, targetUserId)
        console.log('   Candidate:', candidateStr)
        
        sendMessage({
          type: 'ice-candidate',
          to: targetUserId,
          payload: {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex
          }
        }, wsRef)
      } else if (event.candidate === null) {
        console.log('🟢 ICE candidate gathering complete')
      } else if (!targetUserId) {
        console.warn('⚠️ ICE candidate generated but no targetUserId available')
      }
    }

    pc.ontrack = (event) => {
      console.log('🟢 Remote track received:', event.track.kind, event.track.id)
      setRemoteStream(event.streams[0])
    }

    pc.oniceconnectionstatechange = () => {
      console.log('🟢 ICE connection state:', pc.iceConnectionState)
    }

    pc.onicegatheringstatechange = () => {
      console.log('🟢 ICE gathering state:', pc.iceGatheringState)
    }

    pc.onsignalingstatechange = () => {
      console.log('🟢 Signaling state:', pc.signalingState)
    }

    pc.onconnectionstatechange = () => {
      console.log('🟢 Connection state:', pc.connectionState)
      if (pc.connectionState === 'connected') {
        console.log('✅ Peer connection established!')
        setIsInCall(true)
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        console.log('❌ Peer connection failed or disconnected')
        endCall()
      }
    }

    return pc
  }

export const startCall = async (
    targetUserId: string,
    setLocalStream: (value: MediaStream | null) => void,
    initializePeerConnection: (targetUserId: string) => RTCPeerConnection,
    sendMessage: (message: Message, wsRef: React.RefObject<WebSocket | null>) => void,
    wsRef: React.RefObject<WebSocket | null>,
    existingStream?: MediaStream | null
  ) => {
    try {
      console.log('🔵 startCall: Initiating call to', targetUserId)
      let stream: MediaStream
      
      if (existingStream) {
        stream = existingStream
        console.log('🔵 startCall: Using existing stream')
      } else {
        console.log('🔵 startCall: Getting new media stream')
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        setLocalStream(stream)
      }
      
      const pc = initializePeerConnection(targetUserId)
      
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
        console.log('🔵 startCall: Added track:', track.kind)
      })

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      console.log('🔵 startCall: Sending offer to', targetUserId)

      sendMessage({
        type: 'offer',
        to: targetUserId,
        payload: { sdp: offer.sdp }
      }, wsRef)

    } catch (error) {
      console.error('❌ startCall: Error:', error)
      toast.error('Error accessing camera/microphone: ' + error)
    }
  }

export const handleOffer = async (
    message: Message,
    setLocalStream: (value: MediaStream | null) => void,
    initializePeerConnection: (targetUserId: string) => RTCPeerConnection,
    pendingICECandidates: React.MutableRefObject<RTCIceCandidate[]>,
    sendMessage: (message: Message, wsRef: React.RefObject<WebSocket | null>) => void,
    wsRef: React.RefObject<WebSocket | null>,
    existingStream?: MediaStream | null
  ) => {
    console.log('🔵 handleOffer: Starting to handle offer from', message.from)
    try {
      if (!message.from) {
        console.error('❌ handleOffer: No sender ID in offer message')
        return
      }

      let stream: MediaStream
      
      console.log('🔵 handleOffer: Getting media stream, existingStream:', !!existingStream)
      if (existingStream) {
        stream = existingStream
        console.log('🔵 handleOffer: Using existing stream with', stream.getTracks().length, 'tracks')
      } else {
        console.log('🔵 handleOffer: Requesting new user media')
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        setLocalStream(stream)
        console.log('🔵 handleOffer: Got new stream with', stream.getTracks().length, 'tracks')
      }
      
      console.log('🔵 handleOffer: Initializing peer connection with target:', message.from)
      const pc = initializePeerConnection(message.from)
      console.log('🔵 handleOffer: Peer connection created, state:', pc.signalingState)
      
      console.log('🔵 handleOffer: Adding tracks to peer connection')
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
        console.log('🔵 handleOffer: Added track:', track.kind, track.id)
      })

      console.log('🔵 handleOffer: Setting remote description (offer)')
      await pc.setRemoteDescription({
        type: 'offer',
        sdp: message.payload.sdp
      })
      console.log('🔵 handleOffer: Remote description set, state:', pc.signalingState)

      console.log('🔵 handleOffer: Adding', pendingICECandidates.current.length, 'pending ICE candidates')
      for (const candidate of pendingICECandidates.current) {
        await pc.addIceCandidate(candidate)
      }
      pendingICECandidates.current = []

      console.log('🔵 handleOffer: Creating answer')
      const answer = await pc.createAnswer()
      console.log('🔵 handleOffer: Answer created')
      
      console.log('🔵 handleOffer: Setting local description (answer)')
      await pc.setLocalDescription(answer)
      console.log('🔵 handleOffer: Local description set, state:', pc.signalingState)

      console.log('🔵 handleOffer: Sending answer to', message.from)
      sendMessage({
        type: 'answer',
        to: message.from!,
        payload: { sdp: answer.sdp }
      }, wsRef)
      console.log('✅ handleOffer: Answer sent successfully')

    } catch (error) {
      console.error('❌ handleOffer: Error at some step:', error)
      console.error('❌ handleOffer: Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      })
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
      const candidateStr = message.payload.candidate
      let candidateType = 'unknown'
      if (candidateStr.includes('typ host')) candidateType = 'host'
      else if (candidateStr.includes('typ srflx')) candidateType = 'srflx (STUN)'
      else if (candidateStr.includes('typ relay')) candidateType = 'relay (TURN)'
      else if (candidateStr.includes('typ prflx')) candidateType = 'prflx'
      
      console.log(`🔷 Received ICE candidate [${candidateType}] from ${message.from}`)
      
      const candidate = new RTCIceCandidate({
        candidate: message.payload.candidate,
        sdpMid: message.payload.sdpMid,
        sdpMLineIndex: message.payload.sdpMLineIndex
      })

      if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
        await peerConnectionRef.current.addIceCandidate(candidate)
        console.log(`✅ Added ICE candidate [${candidateType}] to peer connection`)
      } else {
        pendingICECandidates.current.push(candidate)
        console.log(`📌 Queued ICE candidate [${candidateType}] (no remote description yet), queue size:`, pendingICECandidates.current.length)
      }
    } catch (error) {
      console.error('❌ Error handling ICE candidate:', error)
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
      toast.error('No local stream available for recording')
      return
    }

    if (!window.MediaRecorder) {
      toast.error('MediaRecorder is not supported in this browser. Please use Chrome, Firefox, or Edge.')
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
        console.log('📹 MediaRecorder stopped, sending final chunk notification')
        uploadChunk(recordedChunksRef.current, true)
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
      toast.error('Error starting recording: ' + error + '\n\nThis might be due to browser compatibility. Try using Chrome or Firefox.')
    }
  }

export const stopRecording = (
    mediaRecorderRef: React.RefObject<MediaRecorder | null>,
    chunkUploadIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>,
    setIsRecording: (value: boolean) => void,
    setRecordingStartTime: (value: Date | null) => void,
    chunkCounterRef?: React.MutableRefObject<number>
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
    
    // Reset chunk counter for next recording
    if (chunkCounterRef) {
      console.log('🛑 Resetting chunk counter from', chunkCounterRef.current, 'to 0')
      chunkCounterRef.current = 0
    }
    
    console.log('🛑 Setting isRecording to false')
    setIsRecording(false)
    setRecordingStartTime(null)
  }