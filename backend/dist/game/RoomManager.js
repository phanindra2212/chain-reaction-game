"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
const GameEngine_1 = require("./GameEngine");
const uuid_1 = require("uuid");
class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    createRoom(boardSize) {
        const roomId = this.generateRoomId();
        const gameEngine = new GameEngine_1.GameEngine(roomId, boardSize);
        const room = {
            id: roomId,
            gameState: gameEngine.getGameState(),
            playerIds: [],
            createdAt: new Date()
        };
        this.rooms.set(roomId, room);
        return room;
    }
    getRoom(roomId) {
        return this.rooms.get(roomId) || null;
    }
    deleteRoom(roomId) {
        this.rooms.delete(roomId);
    }
    addPlayerToRoom(roomId, playerId, playerName) {
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
        const gameEngine = new GameEngine_1.GameEngine(roomId, room.gameState.boardSize);
        gameEngine.loadGameState(room.gameState);
        const player = gameEngine.addPlayer(playerId, playerName);
        room.playerIds.push(playerId);
        room.gameState = gameEngine.getGameState();
        return room.gameState;
    }
    removePlayerFromRoom(roomId, playerId) {
        const room = this.getRoom(roomId);
        if (!room)
            return;
        const gameEngine = new GameEngine_1.GameEngine(roomId, room.gameState.boardSize);
        gameEngine.loadGameState(room.gameState);
        gameEngine.removePlayer(playerId);
        room.playerIds = room.playerIds.filter(id => id !== playerId);
        room.gameState = gameEngine.getGameState();
        // Delete room if empty
        if (room.playerIds.length === 0) {
            this.deleteRoom(roomId);
        }
    }
    getAllRooms() {
        return Array.from(this.rooms.values());
    }
    cleanupOldRooms(maxAge = 24 * 60 * 60 * 1000) {
        const now = Date.now();
        for (const [roomId, room] of this.rooms.entries()) {
            if (now - room.createdAt.getTime() > maxAge) {
                this.deleteRoom(roomId);
            }
        }
    }
    generateRoomId() {
        let roomId;
        do {
            roomId = (0, uuid_1.v4)().substring(0, 8).toUpperCase();
        } while (this.rooms.has(roomId));
        return roomId;
    }
}
exports.RoomManager = RoomManager;
