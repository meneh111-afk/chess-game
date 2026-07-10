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

  movePiece(fromRow, fromCol, toRow, toCol) {
    const piece = this.getPiece(fromRow, fromCol);
    const captured = this.getPiece(toRow, toCol);

    this.grid[toRow][toCol] = piece;
    this.grid[fromRow][fromCol] = null;

    if (piece) {
      if (piece.type === 'king' && Math.abs(toCol - fromCol) === 2) {
        const isKingSide = toCol > fromCol;
        const rookFromCol = isKingSide ? 7 : 0;
        const rookToCol = isKingSide ? toCol - 1 : toCol + 1;
        const rook = this.grid[fromRow][rookFromCol];
        if (rook) {
          this.grid[fromRow][rookToCol] = rook;
          this.grid[fromRow][rookFromCol] = null;
          rook.hasMoved = true;
        }
      }

      piece.hasMoved = true;

      if (piece.type === 'pawn') {
        const promotionRow = piece.color === 'white' ? 0 : 7;
        if (toRow === promotionRow) {
          this.grid[toRow][toCol] = new Queen(piece.color);
        }
      }
    }

    return captured;
  }

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

  isSquareAttacked(row, col, attackerColor) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.grid[r][c];
        if (piece && piece.color === attackerColor) {
          const moves = piece.getAttackSquares(this, r, c);
          if (moves.some(([mr, mc]) => mr === row && mc === col)) {
            return true;
          }
        }
      }
    }
    return false;
  }

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