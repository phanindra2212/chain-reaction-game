export interface Position {
  row: number;
  col: number;
}

export interface Cell {
  dots: number;
  playerId: string | null;
  position: Position;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  dotCount: number;
}

export interface GameState {
  id: string;
  board: Cell[][];
  players: Player[];
  currentPlayerIndex: number;
  isGameOver: boolean;
  winner: Player | null;
  boardSize: {
    rows: number;
    cols: number;
  };
  maxDotsPerCell: number;
  initialDotsPerPlayer: number;
}

export interface Room {
  id: string;
  gameState: GameState;
  playerIds: string[];
  createdAt: Date;
}

export interface Move {
  playerId: string;
  position: Position;
}

export interface ChainReaction {
  position: Position;
  playerId: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
}

export interface VoiceChatSignal {
  type: 'offer' | 'answer' | 'ice-candidate';
  from: string;
  to: string;
  data: any;
}

export const PLAYER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#85C1E2', '#F8B739'
];

export const BOARD_SIZES = [
  { rows: 6, cols: 8, name: 'Small' },
  { rows: 8, cols: 10, name: 'Medium' },
  { rows: 10, cols: 12, name: 'Large' }
];

export const GAME_CONFIG = {
  MAX_DOTS_PER_CELL: 4,
  INITIAL_DOTS_PER_PLAYER: 3,
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 10,
  CHAIN_REACTION_DELAY: 200
} as const;