import React, { useState, useEffect, useRef } from 'react';
import { GameState, Player, Position, ChainReaction } from '@chain-reaction/shared';
import { SocketService } from '../services/SocketService';
import { Chat } from './Chat';
import { VoiceChat } from './VoiceChat';

interface GameBoardProps {
  gameState: GameState;
  currentPlayer: Player | null;
  onStartGame: () => void;
  onMakeMove: (position: Position) => void;
  socketService: SocketService;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  currentPlayer,
  onStartGame,
  onMakeMove,
  socketService
}) => {
  const [hoveredCell, setHoveredCell] = useState<Position | null>(null);
  const [animatingReactions, setAnimatingReactions] = useState<ChainReaction[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    socketService.on('move-made', (data: { reactions: ChainReaction[] }) => {
      setAnimatingReactions(data.reactions);
      
      // Clear animations after they complete
      setTimeout(() => {
        setAnimatingReactions([]);
      }, 1000);
    });

    return () => {
      socketService.off('move-made');
    };
  }, [socketService]);

  const handleCellClick = (row: number, col: number) => {
    if (!gameState.isGameOver && currentPlayer && gameState.currentPlayerIndex === gameState.players.findIndex((p: any) => p.id === currentPlayer.id)) {
      onMakeMove({ row, col });
    }
  };

  const getCellColor = (cell: any) => {
    if (!cell.playerId) return 'rgba(255, 255, 255, 0.1)';
    const player = gameState.players.find((p: any) => p.id === cell.playerId);
    return player ? player.color : 'rgba(255, 255, 255, 0.1)';
  };

  const isCellClickable = (row: number, col: number) => {
    if (!currentPlayer || gameState.isGameOver) return false;
    const isCurrentPlayerTurn = gameState.currentPlayerIndex === gameState.players.findIndex((p: any) => p.id === currentPlayer.id);
    if (!isCurrentPlayerTurn) return false;
    
    const cell = gameState.board[row][col];
    return !cell.playerId || cell.playerId === currentPlayer.id;
  };

  const renderDots = (cell: any) => {
    const dots = [];
    const dotSize = 8;
    const spacing = 4;
    
    for (let i = 0; i < cell.dots; i++) {
      let top = 50, left = 50;
      
      if (cell.dots === 1) {
        top = left = 50;
      } else if (cell.dots === 2) {
        top = i === 0 ? 30 : 70;
        left = 50;
      } else if (cell.dots === 3) {
        top = i === 0 ? 30 : i === 1 ? 70 : 50;
        left = i === 0 ? 30 : i === 1 ? 70 : 50;
      } else if (cell.dots === 4) {
        top = i === 0 || i === 1 ? 30 : 70;
        left = i === 0 || i === 2 ? 30 : 70;
      }
      
      dots.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            backgroundColor: 'white',
            borderRadius: '50%',
            top: `${top}%`,
            left: `${left}%`,
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}
        />
      );
    }
    
    return dots;
  };

  const isExploding = (row: number, col: number) => {
    return animatingReactions.some(reaction => 
      reaction.position.row === row && reaction.position.col === col
    );
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', height: '100vh', padding: '1rem 0' }}>
      <div style={{ flex: 1 }}>
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ color: 'white', margin: 0 }}>
              Room: {gameState.id}
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn"
                onClick={() => setShowChat(!showChat)}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                💬 Chat
              </button>
              <button
                className="btn"
                onClick={() => setShowVoice(!showVoice)}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                🎤 Voice
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                Players: {gameState.players.filter((p: any) => p.isActive).length} / {gameState.players.length}
              </p>
              {gameState.isGameOver && (
                <p style={{ color: '#4ECDC4', margin: '0.5rem 0', fontWeight: 'bold' }}>
                  {gameState.winner ? `🏆 ${gameState.winner.name} Wins!` : '🤝 Draw!'}
                </p>
              )}
            </div>
            
            {!gameState.isGameOver && gameState.players.filter((p: any) => p.isActive).length >= 2 && !gameState.board.some((row: any) => row.some((cell: any) => cell.dots > 0)) && (
              <button className="btn" onClick={onStartGame}>
                Start Game
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${gameState.boardSize.cols}, 1fr)`,
            gap: '4px',
            padding: '1rem',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '8px'
          }}>
            {gameState.board.map((row: any, rowIndex: number) =>
              row.map((cell: any, colIndex: number) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                  onMouseLeave={() => setHoveredCell(null)}
                  style={{
                    aspectRatio: '1',
                    backgroundColor: getCellColor(cell),
                    border: hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex && isCellClickable(rowIndex, colIndex)
                      ? '2px solid white'
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    cursor: isCellClickable(rowIndex, colIndex) ? 'pointer' : 'default',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    transform: isExploding(rowIndex, colIndex) ? 'scale(1.2)' : 'scale(1)',
                    boxShadow: isExploding(rowIndex, colIndex) 
                      ? `0 0 20px ${getCellColor(cell)}` 
                      : '0 2px 8px rgba(0, 0, 0, 0.2)',
                    animation: isExploding(rowIndex, colIndex) ? 'explode 0.5s ease-out' : 'none'
                  }}
                >
                  {renderDots(cell)}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={{ width: '300px' }}>
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ color: 'white', marginBottom: '1rem' }}>Players</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {gameState.players.map((player: any, index: number) => (
              <div
                key={player.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem',
                  backgroundColor: index === gameState.currentPlayerIndex ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  border: index === gameState.currentPlayerIndex ? '2px solid white' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: player.color,
                      borderRadius: '50%',
                      border: player.isActive ? '2px solid white' : '2px solid transparent'
                    }}
                  />
                  <span style={{ color: 'white' }}>
                    {player.name}
                    {player.id === currentPlayer?.id && ' (You)'}
                  </span>
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {player.dotCount} dots
                </div>
              </div>
            ))}
          </div>
        </div>

        {showChat && (
          <Chat socketService={socketService} currentPlayer={currentPlayer} />
        )}

        {showVoice && (
          <VoiceChat socketService={socketService} currentPlayer={currentPlayer} />
        )}
      </div>

      <style>{`
        @keyframes explode {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};