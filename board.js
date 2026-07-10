// board.js
// Représente le plateau 8x8 et la position des pièces.

class Board {
  constructor() {
    this.grid = this._createEmptyGrid();
    this.setupInitialPosition();
  }

  _createEmptyGrid() {
    return Array.from({ length: 8 }, () => Array(8).fill(null));
  }

  setupInitialPosition() {
    const backRank = [Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook];

    for (let col = 0; col < 8; col++) {
      this.grid[0][col] = new backRank[col]('black');
      this.grid[1][col] = new Pawn('black');
      this.grid[6][col] = new Pawn('white');
      this.grid[7][col] = new backRank[col]('white');
    }
  }

  isInBounds(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  getPiece(row, col) {
    if (!this.isInBounds(row, col)) return null;
    return this.grid[row][col];
  }

  setPiece(row, col, piece) {
    this.grid[row][col] = piece;
  }

  // Déplace une pièce et retourne la pièce capturée (ou null).
  movePiece(fromRow, fromCol, toRow, toCol) {
    const piece = this.getPiece(fromRow, fromCol);
    const captured = this.getPiece(toRow, toCol);

    this.grid[toRow][toCol] = piece;
    this.grid[fromRow][fromCol] = null;

    if (piece) {
      piece.hasMoved = true;

      // Promotion simple : un pion qui atteint la dernière rangée devient une Dame.
      if (piece.type === 'pawn') {
        const promotionRow = piece.color === 'white' ? 0 : 7;
        if (toRow === promotionRow) {
          this.grid[toRow][toCol] = new Queen(piece.color);
        }
      }
    }

    return captured;
  }

  // Trouve la position [row, col] du roi d'une couleur donnée.
  findKing(color) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.grid[r][c];
        if (piece && piece.type === 'king' && piece.color === color) {
          return [r, c];
        }
      }
    }
    return null;
  }

  // Une case est-elle attaquée par une pièce de attackerColor ?
  isSquareAttacked(row, col, attackerColor) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.grid[r][c];
        if (piece && piece.color === attackerColor) {
          const moves = piece.getPossibleMoves(this, r, c);
          if (moves.some(([mr, mc]) => mr === row && mc === col)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Copie profonde du plateau (utile pour simuler un coup sans le jouer réellement).
  clone() {
    const newBoard = new Board();
    newBoard.grid = this._createEmptyGrid();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.grid[r][c];
        if (piece) {
          const Cls = piece.constructor;
          const copy = new Cls(piece.color);
          copy.hasMoved = piece.hasMoved;
          newBoard.grid[r][c] = copy;
        }
      }
    }
    return newBoard;
  }
}