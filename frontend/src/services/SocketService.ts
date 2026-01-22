import { io, Socket } from 'socket.io-client';
import { GameState, Move, ChatMessage, VoiceChatSignal } from '@chain-reaction/shared';

export class SocketService {
  private socket: Socket | null = null;
  private playerId: string = '';

  public connect(): void {
    const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';
    this.socket = io(serverUrl);
    this.playerId = this.socket.id;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getPlayerId(): string {
    return this.playerId;
  }

  public createRoom(playerName: string, boardSize: { rows: number; cols: number }): Promise<any> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve({ success: false, error: 'Not connected' });
        return;
      }

      this.socket.emit('create-room', { playerName, boardSize }, (response: any) => {
        resolve(response);
      });
    });
  }

  public joinRoom(playerName: string, roomId?: string): Promise<any> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve({ success: false, error: 'Not connected' });
        return;
      }

      this.socket.emit('join-room', { playerName, roomId }, (response: any) => {
        resolve(response);
      });
    });
  }

  public leaveRoom(roomId: string): void {
    if (this.socket) {
      this.socket.emit('leave-room', { roomId });
    }
  }

  public startGame(): Promise<any> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve({ success: false, error: 'Not connected' });
        return;
      }

      this.socket.emit('start-game', {}, (response: any) => {
        resolve(response);
      });
    });
  }

  public makeMove(position: { row: number; col: number }): Promise<any> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve({ success: false, error: 'Not connected' });
        return;
      }

      this.socket.emit('make-move', { position }, (response: any) => {
        resolve(response);
      });
    });
  }

  public sendChat(message: string): void {
    if (this.socket) {
      this.socket.emit('send-chat', { message });
    }
  }

  public sendVoiceSignal(signal: VoiceChatSignal): void {
    if (this.socket) {
      this.socket.emit('voice-signal', signal);
    }
  }

  public on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  public off(event: string, callback?: (data: any) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}