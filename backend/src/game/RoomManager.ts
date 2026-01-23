import { Room, GameState } from '@chain-reaction/shared';
import { GameEngine } from './GameEngine';
import { v4 as uuidv4 } from 'uuid';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();

  public createRoom(boardSize: { rows: number; cols: number }): Room {
    const roomId = this.generateRoomId();
    const gameEngine = new GameEngine(roomId, boardSize);
    
    const room: Room = {
      id: roomId,
      gameState: gameEngine.getGameState(),
      playerIds: [],
      createdAt: new Date()
    };

    this.rooms.set(roomId, room);
    return room;
  }

  public getRoom(roomId: string): Room | null {
    return this.rooms.get(roomId) || null;
  }

  public deleteRoom(roomId: string): void {
    this.rooms.delete(roomId);
  }

  public addPlayerToRoom(roomId: string, playerId: string, playerName: string): GameState {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.playerIds.includes(playerId)) {
      return room.gameState;
    }

    if (room.playerIds.length >= 10) {
      throw new Error('Room is full');
    }

    const gameEngine = new GameEngine(roomId, room.gameState.boardSize);
    gameEngine.loadGameState(room.gameState);
    
    const player = gameEngine.addPlayer(playerId, playerName);
    room.playerIds.push(playerId);
    room.gameState = gameEngine.getGameState();

    return room.gameState;
  }

  public removePlayerFromRoom(roomId: string, playerId: string): void {
    const room = this.getRoom(roomId);
    if (!room) return;

    const gameEngine = new GameEngine(roomId, room.gameState.boardSize);
    gameEngine.loadGameState(room.gameState);
    gameEngine.removePlayer(playerId);
    
    room.playerIds = room.playerIds.filter(id => id !== playerId);
    room.gameState = gameEngine.getGameState();

    // Delete room if empty
    if (room.playerIds.length === 0) {
      this.deleteRoom(roomId);
    }
  }

  public getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  public cleanupOldRooms(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    for (const [roomId, room] of this.rooms.entries()) {
      if (now - room.createdAt.getTime() > maxAge) {
        this.deleteRoom(roomId);
      }
    }
  }

  private generateRoomId(): string {
    let roomId: string;
    do {
      roomId = uuidv4().substring(0, 8).toUpperCase();
    } while (this.rooms.has(roomId));
    return roomId;
  }
}