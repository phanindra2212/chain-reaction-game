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
export declare const PLAYER_COLORS: string[];
export declare const BOARD_SIZES: {
    rows: number;
    cols: number;
    name: string;
}[];
export declare const GAME_CONFIG: {
    readonly MAX_DOTS_PER_CELL: 4;
    readonly INITIAL_DOTS_PER_PLAYER: 3;
    readonly MIN_PLAYERS: 2;
    readonly MAX_PLAYERS: 10;
    readonly CHAIN_REACTION_DELAY: 200;
};
//# sourceMappingURL=types.d.ts.map