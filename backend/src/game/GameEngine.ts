import { GameState, Cell, Player, Position, Move, ChainReaction } from '@chain-reaction/shared';
import { GAME_CONFIG } from '@chain-reaction/shared';

export class GameEngine {
  private gameState: GameState;

  public loadGameState(gameState: GameState): void {
    this.gameState = JSON.parse(JSON.stringify(gameState));
  }

  constructor(roomId: string, boardSize: { rows: number; cols: number }) {
    this.gameState = this.createInitialGameState(roomId, boardSize);
  }

  private createInitialGameState(roomId: string, boardSize: { rows: number; cols: number }): GameState {
    const board: Cell[][] = [];
    for (let row = 0; row < boardSize.rows; row++) {
      board[row] = [];
      for (let col = 0; col < boardSize.cols; col++) {
        board[row][col] = {
          dots: 0,
          playerId: null,
          position: { row, col }
        };
      }
    }

    return {
      id: roomId,
      board,
      players: [],
      currentPlayerIndex: 0,
      isGameOver: false,
      winner: null,
      boardSize,
      maxDotsPerCell: GAME_CONFIG.MAX_DOTS_PER_CELL,
      initialDotsPerPlayer: GAME_CONFIG.INITIAL_DOTS_PER_PLAYER
    };
  }

  public addPlayer(playerId: string, playerName: string): Player {
    if (this.gameState.players.length >= GAME_CONFIG.MAX_PLAYERS) {
      throw new Error('Game is full');
    }

    const existingPlayer = this.gameState.players.find(p => p.id === playerId);
    if (existingPlayer) {
      return existingPlayer;
    }

    const colorIndex = this.gameState.players.length;
    const player: Player = {
      id: playerId,
      name: playerName,
      color: this.getPlayerColor(colorIndex),
      isActive: true,
      dotCount: 0
    };

    this.gameState.players.push(player);
    return player;
  }

  public removePlayer(playerId: string): void {
    const playerIndex = this.gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    const player = this.gameState.players[playerIndex];
    player.isActive = false;

    // Remove player's dots from board
    for (let row = 0; row < this.gameState.boardSize.rows; row++) {
      for (let col = 0; col < this.gameState.boardSize.cols; col++) {
        if (this.gameState.board[row][col].playerId === playerId) {
          this.gameState.board[row][col].dots = 0;
          this.gameState.board[row][col].playerId = null;
        }
      }
    }

    this.updatePlayerDotCounts();
    this.checkWinCondition();
  }

  public startGame(): void {
    if (this.gameState.players.length < GAME_CONFIG.MIN_PLAYERS) {
      throw new Error('Not enough players to start');
    }

    // Place initial dots for each player
    const activePlayers = this.gameState.players.filter(p => p.isActive);
    const emptyCells: Position[] = [];

    for (let row = 0; row < this.gameState.boardSize.rows; row++) {
      for (let col = 0; col < this.gameState.boardSize.cols; col++) {
        emptyCells.push({ row, col });
      }
    }

    // Shuffle empty cells
    for (let i = emptyCells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [emptyCells[i], emptyCells[j]] = [emptyCells[j], emptyCells[i]];
    }

    // Place dots
    let cellIndex = 0;
    for (const player of activePlayers) {
      for (let i = 0; i < this.gameState.initialDotsPerPlayer; i++) {
        if (cellIndex < emptyCells.length) {
          const pos = emptyCells[cellIndex++];
          this.gameState.board[pos.row][pos.col].dots = 1;
          this.gameState.board[pos.row][pos.col].playerId = player.id;
        }
      }
    }

    this.updatePlayerDotCounts();
  }

  public makeMove(move: Move): ChainReaction[] {
    if (this.gameState.isGameOver) {
      throw new Error('Game is over');
    }

    const currentPlayer = this.gameState.players[this.gameState.currentPlayerIndex];
    if (currentPlayer.id !== move.playerId) {
      throw new Error('Not your turn');
    }

    const cell = this.gameState.board[move.position.row][move.position.col];
    if (cell.playerId && cell.playerId !== move.playerId) {
      throw new Error('Cannot place dot on opponent\'s cell');
    }

    // Add dot to cell
    cell.dots++;
    cell.playerId = move.playerId;

    // Process chain reactions
    const reactions: ChainReaction[] = [];
    this.processChainReactions(move.position, move.playerId, reactions);

    // Update player dot counts
    this.updatePlayerDotCounts();

    // Check win condition
    this.checkWinCondition();

    // Move to next player if game isn't over
    if (!this.gameState.isGameOver) {
      this.nextTurn();
    }

    return reactions;
  }

  private processChainReactions(position: Position, playerId: string, reactions: ChainReaction[]): void {
    const cell = this.gameState.board[position.row][position.col];
    
    if (cell.dots >= this.gameState.maxDotsPerCell) {
      // Cell explodes
      reactions.push({
        position: { ...position },
        playerId,
        timestamp: Date.now()
      });

      // Reset cell
      cell.dots = 0;
      cell.playerId = null;

      // Get neighbors
      const neighbors = this.getNeighbors(position);
      
      // Spread dots to neighbors
      for (const neighbor of neighbors) {
        const neighborCell = this.gameState.board[neighbor.row][neighbor.col];
        neighborCell.dots++;
        neighborCell.playerId = playerId;

        // Recursively process chain reactions
        if (neighborCell.dots >= this.gameState.maxDotsPerCell) {
          this.processChainReactions(neighbor, playerId, reactions);
        }
      }
    }
  }

  private getNeighbors(position: Position): Position[] {
    const neighbors: Position[] = [];
    const { row, col } = position;

    // Up
    if (row > 0) neighbors.push({ row: row - 1, col });
    // Down
    if (row < this.gameState.boardSize.rows - 1) neighbors.push({ row: row + 1, col });
    // Left
    if (col > 0) neighbors.push({ row, col: col - 1 });
    // Right
    if (col < this.gameState.boardSize.cols - 1) neighbors.push({ row, col: col + 1 });

    return neighbors;
  }

  private updatePlayerDotCounts(): void {
    for (const player of this.gameState.players) {
      player.dotCount = 0;
    }

    for (let row = 0; row < this.gameState.boardSize.rows; row++) {
      for (let col = 0; col < this.gameState.boardSize.cols; col++) {
        const cell = this.gameState.board[row][col];
        if (cell.playerId && cell.dots > 0) {
          const player = this.gameState.players.find(p => p.id === cell.playerId);
          if (player) {
            player.dotCount += cell.dots;
          }
        }
      }
    }
  }

  private checkWinCondition(): void {
    const activePlayers = this.gameState.players.filter(p => p.isActive);
    const playersWithDots = activePlayers.filter(p => p.dotCount > 0);

    if (playersWithDots.length === 1) {
      this.gameState.isGameOver = true;
      this.gameState.winner = playersWithDots[0];
    } else if (playersWithDots.length === 0) {
      this.gameState.isGameOver = true;
      this.gameState.winner = null;
    }
  }

  private nextTurn(): void {
    const activePlayers = this.gameState.players.filter(p => p.isActive);
    
    do {
      this.gameState.currentPlayerIndex = (this.gameState.currentPlayerIndex + 1) % this.gameState.players.length;
    } while (!this.gameState.players[this.gameState.currentPlayerIndex].isActive);
  }

  private getPlayerColor(index: number): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
      '#85C1E2', '#F8B739'
    ];
    return colors[index % colors.length];
  }

  public getGameState(): GameState {
    return JSON.parse(JSON.stringify(this.gameState));
  }

  public isValidMove(move: Move): boolean {
    if (this.gameState.isGameOver) return false;
    
    const currentPlayer = this.gameState.players[this.gameState.currentPlayerIndex];
    if (currentPlayer.id !== move.playerId) return false;

    const cell = this.gameState.board[move.position.row][move.position.col];
    if (cell.playerId && cell.playerId !== move.playerId) return false;

    return true;
  }
}