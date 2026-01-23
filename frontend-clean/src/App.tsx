import React, { useState, useEffect } from 'react';
import { SocketService } from './services/SocketService';
import { Lobby } from './components/Lobby';
import { GameBoard } from './components/GameBoard';
import { GameState, Player } from '@chain-reaction/shared';

const App: React.FC = () => {
  const [socketService] = useState(() => new SocketService());
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isInGame, setIsInGame] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    socketService.connect();

    socketService.on('game-state-updated', (data: { gameState: GameState }) => {
      setGameState(data.gameState);
    });

    socketService.on('game-started', (data: { gameState: GameState }) => {
      setGameState(data.gameState);
      setIsInGame(true);
    });

    socketService.on('move-made', (data: { gameState: GameState }) => {
      setGameState(data.gameState);
    });

    socketService.on('game-ended', (data: { winner: Player | null }) => {
      console.log('Game ended. Winner:', data.winner);
    });

    socketService.on('player-left', (data: { playerId: string }) => {
      console.log('Player left:', data.playerId);
    });

    return () => {
      socketService.disconnect();
    };
  }, [socketService]);

  const handleJoinRoom = (playerName: string, roomIdToJoin?: string) => {
    socketService.joinRoom(playerName, roomIdToJoin).then((response) => {
      if (response.success) {
        setGameState(response.gameState);
        setRoomId(response.room.id);
        setCurrentPlayer(response.gameState.players.find(p => p.id === socketService.getPlayerId()) || null);
      }
    });
  };

  const handleCreateRoom = (playerName: string, boardSize: { rows: number; cols: number }) => {
    socketService.createRoom(playerName, boardSize).then((response) => {
      if (response.success) {
        setGameState(response.gameState);
        setRoomId(response.room.id);
        setCurrentPlayer(response.gameState.players.find(p => p.id === socketService.getPlayerId()) || null);
      }
    });
  };

  const handleStartGame = () => {
    if (roomId) {
      socketService.startGame();
    }
  };

  const handleMakeMove = (position: { row: number; col: number }) => {
    if (roomId) {
      socketService.makeMove(position);
    }
  };

  if (!gameState) {
    return (
      <div className="container">
        <Lobby
          onJoinRoom={handleJoinRoom}
          onCreateRoom={handleCreateRoom}
        />
      </div>
    );
  }

  return (
    <div className="container">
      <GameBoard
        gameState={gameState}
        currentPlayer={currentPlayer}
        onStartGame={handleStartGame}
        onMakeMove={handleMakeMove}
        socketService={socketService}
      />
    </div>
  );
};

export default App;
