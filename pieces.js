class Piece {
  constructor(color) {
    this.color = color;
    this.hasMoved = false;
  }

  get symbol() {
    return '?';
  }

  get glyph() {
    return '?';
  }

  get type() {
    return 'piece';
  }

  getPossibleMoves(board, row, col) {
    return [];
  }

  _slidingMoves(board, row, col, directions) {
    const moves = [];
    for (const [dr, dc] of directions) {
      let r = row + dr;
      let c = col + dc;
      while (board.isInBounds(r, c)) {
        const occupant = board.getPiece(r, c);
        if (!occupant) {
          moves.push([r, c]);
        } else {
          if (occupant.color !== this.color) {
            moves.push([r, c]);
          }
          break;
        }
        r += dr;
        c += dc;
      }
    }
    return moves;
  }
}

class Pawn extends Piece {
  get symbol() {
    return this.color === 'white' ? '♙' : '♟';
  }

  get glyph() {
    return '♟\uFE0E';
  }

  get type() {
    return 'pawn';
  }

  getPossibleMoves(board, row, col) {
    const moves = [];
    const direction = this.color === 'white' ? -1 : 1;
    const startRow = this.color === 'white' ? 6 : 1;

    const oneStepRow = row + direction;
    if (board.isInBounds(oneStepRow, col) && !board.getPiece(oneStepRow, col)) {
      moves.push([oneStepRow, col]);

      const twoStepRow = row + direction * 2;
      if (row === startRow && !board.getPiece(twoStepRow, col)) {
        moves.push([twoStepRow, col]);
      }
    }

    for (const dc of [-1, 1]) {
      const r = row + direction;
      const c = col + dc;
      if (board.isInBounds(r, c)) {
        const occupant = board.getPiece(r, c);
        if (occupant && occupant.color !== this.color) {
          moves.push([r, c]);
        }
      }
    }

    return moves;
  }
}

class Rook extends Piece {
  get symbol() {
    return this.color === 'white' ? '♖' : '♜';
  }

  get glyph() {
    return '♜\uFE0E';
  }

  get type() {
    return 'rook';
  }

  getPossibleMoves(board, row, col) {
    return this._slidingMoves(board, row, col, [
      [1, 0], [-1, 0], [0, 1], [0, -1],
    ]);
  }
}

class Knight extends Piece {
  get symbol() {
    return this.color === 'white' ? '♘' : '♞';
  }

  get glyph() {
    return '♞\uFE0E';
  }

  get type() {
    return 'knight';
  }

  getPossibleMoves(board, row, col) {
    const offsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ];
    const moves = [];
    for (const [dr, dc] of offsets) {
      const r = row + dr;
      const c = col + dc;
      if (board.isInBounds(r, c)) {
        const occupant = board.getPiece(r, c);
        if (!occupant || occupant.color !== this.color) {
          moves.push([r, c]);
        }
      }
    }
    return moves;
  }
}

class Bishop extends Piece {
  get symbol() {
    return this.color === 'white' ? '♗' : '♝';
  }

  get glyph() {
    return '♝\uFE0E';
  }

  get type() {
    return 'bishop';
  }

  getPossibleMoves(board, row, col) {
    return this._slidingMoves(board, row, col, [
      [1, 1], [1, -1], [-1, 1], [-1, -1],
    ]);
  }
}

class Queen extends Piece {
  get symbol() {
    return this.color === 'white' ? '♕' : '♛';
  }

  get glyph() {
    return '♛\uFE0E';
  }

  get type() {
    return 'queen';
  }

  getPossibleMoves(board, row, col) {
    return this._slidingMoves(board, row, col, [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [1, -1], [-1, 1], [-1, -1],
    ]);
  }
}

class King extends Piece {
  get symbol() {
    return this.color === 'white' ? '♔' : '♚';
  }

  get glyph() {
    return '♚\uFE0E';
  }

  get type() {
    return 'king';
  }

  getPossibleMoves(board, row, col) {
    const moves = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = row + dr;
        const c = col + dc;
        if (board.isInBounds(r, c)) {
          const occupant = board.getPiece(r, c);
          if (!occupant || occupant.color !== this.color) {
            moves.push([r, c]);
          }
        }
      }
    }
    return moves;
  }
}