import React, { useState, useEffect, useRef } from 'react';
import { SocketService } from '../services/SocketService';
import { Player, ChatMessage } from '@chain-reaction/shared';

interface ChatProps {
  socketService: SocketService;
  currentPlayer: Player | null;
}

export const Chat: React.FC<ChatProps> = ({ socketService, currentPlayer }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socketService.on('chat-message', (chatMessage: ChatMessage) => {
      setMessages(prev => [...prev, chatMessage]);
    });

    return () => {
      socketService.off('chat-message');
    };
  }, [socketService]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && currentPlayer) {
      socketService.sendChat(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="card" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ color: 'white', marginBottom: '1rem' }}>Chat</h3>
      
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: '1rem',
          padding: '0.5rem',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '8px'
        }}
      >
        {messages.length === 0 ? (
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center' }}>
            No messages yet...
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                marginBottom: '0.5rem',
                padding: '0.5rem',
                backgroundColor: msg.playerId === currentPlayer?.id 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {msg.playerName}
                </span>
                <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem' }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: 0, wordBreak: 'break-word' }}>
                {msg.message}
              </p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          className="input"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ flex: 1, padding: '8px 12px' }}
        />
        <button type="submit" className="btn" style={{ padding: '8px 16px' }}>
          Send
        </button>
      </form>
    </div>
  );
};