import React, { useState } from 'react';
import { BOARD_SIZES } from '@chain-reaction/shared';

interface LobbyProps {
  onJoinRoom: (playerName: string, roomId?: string) => void;
  onCreateRoom: (playerName: string, boardSize: { rows: number; cols: number }) => void;
}

export const Lobby: React.FC<LobbyProps> = ({ onJoinRoom, onCreateRoom }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [selectedBoardSize, setSelectedBoardSize] = useState(BOARD_SIZES[1]);
  const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onJoinRoom(playerName.trim(), roomId.trim() || undefined);
    }
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onCreateRoom(playerName.trim(), selectedBoardSize);
    }
  };

  return (
    <div className="fade-in">
      <div className="card" style={{ maxWidth: '500px', margin: '50px auto' }}>
        <h1 className="text-center mb-4" style={{ color: 'white', fontSize: '2.5rem' }}>
          ⚛️ Chain Reaction
        </h1>
        
        <div className="text-center mb-4">
          <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            A strategic multiplayer game where chain reactions determine the winner!
          </p>
        </div>

        <div style={{ display: 'flex', marginBottom: '2rem' }}>
          <button
            className={`btn ${activeTab === 'join' ? 'btn-primary' : ''}`}
            style={{ 
              flex: 1, 
              marginRight: '0.5rem',
              background: activeTab === 'join' ? 'linear-gradient(45deg, #667eea, #764ba2)' : 'rgba(255, 255, 255, 0.1)'
            }}
            onClick={() => setActiveTab('join')}
          >
            Join Room
          </button>
          <button
            className={`btn ${activeTab === 'create' ? 'btn-primary' : ''}`}
            style={{ 
              flex: 1, 
              marginLeft: '0.5rem',
              background: activeTab === 'create' ? 'linear-gradient(45deg, #667eea, #764ba2)' : 'rgba(255, 255, 255, 0.1)'
            }}
            onClick={() => setActiveTab('create')}
          >
            Create Room
          </button>
        </div>

        {activeTab === 'join' ? (
          <form onSubmit={handleJoinRoom}>
            <div className="mb-3">
              <input
                type="text"
                className="input"
                placeholder="Your Name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                className="input"
                placeholder="Room ID (optional)"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
            </div>
            
            <button type="submit" className="btn" style={{ width: '100%' }}>
              Join Game
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreateRoom}>
            <div className="mb-3">
              <input
                type="text"
                className="input"
                placeholder="Your Name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-4">
              <label style={{ color: 'white', marginBottom: '0.5rem', display: 'block' }}>
                Board Size:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {BOARD_SIZES.map((size) => (
                  <button
                    key={size.name}
                    type="button"
                    className="btn"
                    style={{
                      flex: 1,
                      background: selectedBoardSize.name === size.name 
                        ? 'linear-gradient(45deg, #667eea, #764ba2)' 
                        : 'rgba(255, 255, 255, 0.1)',
                      padding: '8px 12px',
                      fontSize: '14px'
                    }}
                    onClick={() => setSelectedBoardSize(size)}
                  >
                    {size.name}
                    <br />
                    <small>{size.rows}×{size.cols}</small>
                  </button>
                ))}
              </div>
            </div>
            
            <button type="submit" className="btn" style={{ width: '100%' }}>
              Create Room
            </button>
          </form>
        )}

        <div className="mt-4">
          <h4 style={{ color: 'white', marginBottom: '1rem' }}>How to Play:</h4>
          <ul style={{ color: 'rgba(255, 255, 255, 0.8)', paddingLeft: '1.5rem' }}>
            <li>Place dots on empty cells or your own cells</li>
            <li>When a cell reaches 4 dots, it explodes!</li>
            <li>Explosions spread dots to adjacent cells</li>
            <li>Chain reactions can eliminate opponents</li>
            <li>Last player with dots wins!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};