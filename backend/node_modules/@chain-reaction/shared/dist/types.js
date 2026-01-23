"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GAME_CONFIG = exports.BOARD_SIZES = exports.PLAYER_COLORS = void 0;
exports.PLAYER_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#85C1E2', '#F8B739'
];
exports.BOARD_SIZES = [
    { rows: 6, cols: 8, name: 'Small' },
    { rows: 8, cols: 10, name: 'Medium' },
    { rows: 10, cols: 12, name: 'Large' }
];
exports.GAME_CONFIG = {
    MAX_DOTS_PER_CELL: 4,
    INITIAL_DOTS_PER_PLAYER: 3,
    MIN_PLAYERS: 2,
    MAX_PLAYERS: 10,
    CHAIN_REACTION_DELAY: 200
};
//# sourceMappingURL=types.js.map