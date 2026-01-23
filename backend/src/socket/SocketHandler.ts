import { Server, Socket } from 'socket.io';
import { RoomManager } from '../game/RoomManager';
import { GameEngine } from '../game/GameEngine';
import { Move, ChatMessage, VoiceChatSignal } from '@chain-reaction/shared';

export class SocketHandler {
  private io: Server;
  private roomManager: RoomManager;
  private gameEngines: Map<string, GameEngine> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.roomManager = new RoomManager();
  }

  public handleConnection(socket: Socket): void {
    console.log(`User connected: ${socket.id}`);

    // Room events
    socket.on('create-room', (data, callback) => {
      this.handleCreateRoom(socket, data, callback);
    });

    socket.on('join-room', (data, callback) => {
      this.handleJoinRoom(socket, data, callback);
    });

    socket.on('leave-room', (data) => {
      this.handleLeaveRoom(socket, data);
    });

    // Game events
    socket.on('start-game', (data, callback) => {
      this.handleStartGame(socket, data, callback);
    });

    socket.on('make-move', (data, callback) => {
      this.handleMakeMove(socket, data, callback);
    });

    // Chat events
    socket.on('send-chat', (data) => {
      this.handleSendChat(socket, data);
    });

    // Voice chat events
    socket.on('voice-signal', (data) => {
      this.handleVoiceSignal(socket, data);
    });

    socket.on('disconnect', () => {
      this.handleDisconnect(socket);
    });
  }

  private handleCreateRoom(socket: Socket, data: any, callback: Function): void {
    try {
      const { boardSize = { rows: 8, cols: 10 } } = data;
      const room = this.roomManager.createRoom(boardSize);
      
      socket.join(room.id);
      socket.data.roomId = room.id;
      socket.data.playerId = socket.id;
      socket.data.playerName = data.playerName || `Player ${socket.id.substring(0, 4)}`;

      const gameState = this.roomManager.addPlayerToRoom(room.id, socket.id, socket.data.playerName);
      const gameEngine = new GameEngine(room.id, room.gameState.boardSize);
      this.gameEngines.set(room.id, gameEngine);

      callback({ success: true, room, gameState });
      
      // Notify other players
      socket.to(room.id).emit('player-joined', { player: gameState.players[gameState.players.length - 1] });
    } catch (error) {
      callback({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  private handleJoinRoom(socket: Socket, data: any, callback: Function): void {
    try {
      const { roomId, playerName } = data;
      const room = this.roomManager.getRoom(roomId);
      
      if (!room) {
        callback({ success: false, error: 'Room not found' });
        return;
      }

      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.playerId = socket.id;
      socket.data.playerName = playerName || `Player ${socket.id.substring(0, 4)}`;

      const gameState = this.roomManager.addPlayerToRoom(roomId, socket.id, socket.data.playerName);
      
      // Update game engine
      const gameEngine = this.gameEngines.get(roomId);
      if (gameEngine) {
        gameEngine.loadGameState(gameState);
      } else {
        const newGameEngine = new GameEngine(roomId, gameState.boardSize);
        newGameEngine.loadGameState(gameState);
        this.gameEngines.set(roomId, newGameEngine);
      }

      callback({ success: true, room, gameState });
      
      // Notify other players
      socket.to(roomId).emit('player-joined', { player: gameState.players.find(p => p.id === socket.id) });
      socket.to(roomId).emit('game-state-updated', { gameState });
    } catch (error) {
      callback({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  private handleLeaveRoom(socket: Socket, data: any): void {
    const { roomId } = data;
    if (!roomId) return;

    socket.leave(roomId);
    this.roomManager.removePlayerFromRoom(roomId, socket.id);
    
    const room = this.roomManager.getRoom(roomId);
    if (room) {
      socket.to(roomId).emit('player-left', { playerId: socket.id });
      socket.to(roomId).emit('game-state-updated', { gameState: room.gameState });
    }

    socket.data.roomId = null;
  }

  private handleStartGame(socket: Socket, data: any, callback: Function): void {
    try {
      const roomId = socket.data.roomId;
      if (!roomId) {
        callback({ success: false, error: 'Not in a room' });
        return;
      }

      const gameEngine = this.gameEngines.get(roomId);
      if (!gameEngine) {
        callback({ success: false, error: 'Game not found' });
        return;
      }

      gameEngine.startGame();
      const gameState = gameEngine.getGameState();
      
      // Update room game state
      const room = this.roomManager.getRoom(roomId);
      if (room) {
        room.gameState = gameState;
      }

      callback({ success: true, gameState });
      
      // Notify all players
      this.io.to(roomId).emit('game-started', { gameState });
    } catch (error) {
      callback({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  private handleMakeMove(socket: Socket, data: any, callback: Function): void {
    try {
      const roomId = socket.data.roomId;
      if (!roomId) {
        callback({ success: false, error: 'Not in a room' });
        return;
      }

      const gameEngine = this.gameEngines.get(roomId);
      if (!gameEngine) {
        callback({ success: false, error: 'Game not found' });
        return;
      }

      const move: Move = {
        playerId: socket.id,
        position: data.position
      };

      if (!gameEngine.isValidMove(move)) {
        callback({ success: false, error: 'Invalid move' });
        return;
      }

      const reactions = gameEngine.makeMove(move);
      const gameState = gameEngine.getGameState();
      
      // Update room game state
      const room = this.roomManager.getRoom(roomId);
      if (room) {
        room.gameState = gameState;
      }

      callback({ success: true, gameState, reactions });
      
      // Notify all players
      this.io.to(roomId).emit('move-made', { move, reactions, gameState });
      
      if (gameState.isGameOver) {
        this.io.to(roomId).emit('game-ended', { winner: gameState.winner });
      }
    } catch (error) {
      callback({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  private handleSendChat(socket: Socket, data: any): void {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    const chatMessage: ChatMessage = {
      id: Date.now().toString(),
      playerId: socket.id,
      playerName: socket.data.playerName || 'Unknown',
      message: data.message,
      timestamp: new Date()
    };

    socket.to(roomId).emit('chat-message', chatMessage);
  }

  private handleVoiceSignal(socket: Socket, data: VoiceChatSignal): void {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    // Forward WebRTC signal to target player
    socket.to(data.to).emit('voice-signal', {
      ...data,
      from: socket.id
    });
  }

  private handleDisconnect(socket: Socket): void {
    console.log(`User disconnected: ${socket.id}`);
    
    const roomId = socket.data.roomId;
    if (roomId) {
      this.roomManager.removePlayerFromRoom(roomId, socket.id);
      
      const room = this.roomManager.getRoom(roomId);
      if (room) {
        socket.to(roomId).emit('player-left', { playerId: socket.id });
        socket.to(roomId).emit('game-state-updated', { gameState: room.gameState });
      }
    }

    // Clean up game engine if room is deleted
    if (!this.roomManager.getRoom(roomId)) {
      this.gameEngines.delete(roomId);
    }
  }

  public startCleanupInterval(): void {
    // Clean up old rooms every hour
    setInterval(() => {
      this.roomManager.cleanupOldRooms();
    }, 60 * 60 * 1000);
  }
}