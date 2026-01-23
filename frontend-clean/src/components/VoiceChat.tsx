import React, { useState, useEffect, useRef } from 'react';
import { SocketService } from '../services/SocketService';
import { Player, VoiceChatSignal } from '@chain-reaction/shared';

interface VoiceChatProps {
  socketService: SocketService;
  currentPlayer: Player | null;
}

export const VoiceChat: React.FC<VoiceChatProps> = ({ socketService, currentPlayer }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  useEffect(() => {
    socketService.on('voice-signal', handleVoiceSignal);
    
    return () => {
      socketService.off('voice-signal');
      cleanup();
    };
  }, [socketService]);

  const cleanup = async () => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Close all peer connections
    for (const [peerId, pc] of peerConnectionsRef.current) {
      pc.close();
    }
    peerConnectionsRef.current.clear();

    // Remove audio elements
    for (const [peerId, audio] of audioElementsRef.current) {
      audio.remove();
    }
    audioElementsRef.current.clear();
  };

  const handleVoiceSignal = async (signal: VoiceChatSignal) => {
    const pc = peerConnectionsRef.current.get(signal.from);
    if (!pc) return;

    if (signal.type === 'offer') {
      await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      socketService.sendVoiceSignal({
        type: 'answer',
        from: currentPlayer?.id || '',
        to: signal.from,
        data: answer
      });
    } else if (signal.type === 'answer') {
      await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
    } else if (signal.type === 'ice-candidate') {
      await pc.addIceCandidate(new RTCIceCandidate(signal.data));
    }
  };

  const createPeerConnection = (peerId: string): RTCPeerConnection => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const pc = new RTCPeerConnection(configuration);

    // Add local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && currentPlayer) {
        socketService.sendVoiceSignal({
          type: 'ice-candidate',
          from: currentPlayer.id,
          to: peerId,
          data: event.candidate
        });
      }
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      const audio = new Audio();
      audio.srcObject = event.streams[0];
      audio.autoplay = true;
      audio.muted = false;
      document.body.appendChild(audio);
      audioElementsRef.current.set(peerId, audio);
    };

    // Handle connection state
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        peerConnectionsRef.current.delete(peerId);
        const audio = audioElementsRef.current.get(peerId);
        if (audio) {
          audio.remove();
          audioElementsRef.current.delete(peerId);
        }
        setParticipants(prev => prev.filter(id => id !== peerId));
      }
    };

    peerConnectionsRef.current.set(peerId, pc);
    return pc;
  };

  const connect = async () => {
    try {
      // Get local microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: false 
      });
      localStreamRef.current = stream;

      // Mute/unmute based on state
      stream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });

      setIsConnected(true);
    } catch (error) {
      console.error('Failed to access microphone:', error);
      alert('Failed to access microphone. Please check your permissions.');
    }
  };

  const disconnect = async () => {
    await cleanup();
    setIsConnected(false);
    setParticipants([]);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const newMutedState = !isMuted;
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !newMutedState;
      });
      setIsMuted(newMutedState);
    }
  };

  // Simulate connecting to other players (in real implementation, this would be handled by room events)
  useEffect(() => {
    if (isConnected && currentPlayer) {
      // This is a simplified version - in reality, you'd handle this through room events
      // when other players join/leave voice chat
    }
  }, [isConnected, currentPlayer]);

  return (
    <div className="card" style={{ height: '200px' }}>
      <h3 style={{ color: 'white', marginBottom: '1rem' }}>Voice Chat</h3>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>
          {isConnected ? '🎤 Connected' : '🔇 Disconnected'}
        </p>
        
        {participants.length > 0 && (
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
            {participants.length} participant(s)
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {!isConnected ? (
          <button className="btn" onClick={connect} style={{ flex: 1 }}>
            🎤 Join Voice
          </button>
        ) : (
          <>
            <button 
              className="btn" 
              onClick={toggleMute}
              style={{ 
                flex: 1,
                background: isMuted ? 'linear-gradient(45deg, #e74c3c, #c0392b)' : 'linear-gradient(45deg, #2ecc71, #27ae60)'
              }}
            >
              {isMuted ? '🔇 Unmute' : '🎤 Mute'}
            </button>
            <button 
              className="btn" 
              onClick={disconnect}
              style={{ background: 'linear-gradient(45deg, #e74c3c, #c0392b)' }}
            >
              📞 Leave
            </button>
          </>
        )}
      </div>

      <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px' }}>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem', textAlign: 'center' }}>
          Voice chat uses WebRTC for direct peer-to-peer communication
        </p>
      </div>
    </div>
  );
};