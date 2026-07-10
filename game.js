// game.js
// Gère le déroulement de la partie : tours, coups légaux, échec/mat, historique.

class Game {
  constructor() {
    this.board = new Board();
    this.currentTurn = 'white';
    this.selectedSquare = null; // [row, col] ou null
    this.moveHistory = []; // liste de chaînes lisibles, ex: "e2-e4"
    this.capturedPieces = { white: [], black: [] }; // pièces capturées par couleur adverse
    this.isGameOver = false;
    this.statusMessage = '';
  }

  getOpponentColor(color) {
    return color === 'white' ? 'black' : 'white';
  }

  // Coups possibles pour une pièce, en excluant ceux qui laisseraient
  // son propre roi en échec.
  getLegalMoves(row, col) {
    const piece = this.board.getPiece(row, col);
    if (!piece || piece.color !== this.currentTurn) return [];

    const rawMoves = piece.getPossibleMoves(this.board, row, col);

    return rawMoves.filter(([toRow, toCol]) => {
      const simulatedBoard = this.board.clone();
      simulatedBoard.movePiece(row, col, toRow, toCol);
      const kingPos = simulatedBoard.findKing(piece.color);
      if (!kingPos) return false;
      return !simulatedBoard.isSquareAttacked(kingPos[0], kingPos[1], this.getOpponentColor(piece.color));
    });
  }

  // Existe-t-il au moins un coup légal pour la couleur donnée ?
  hasAnyLegalMove(color) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board.getPiece(r, c);
        if (piece && piece.color === color) {
          const savedTurn = this.currentTurn;
          this.currentTurn = color;
          const moves = this.getLegalMoves(r, c);
          this.currentTurn = savedTurn;
          if (moves.length > 0) return true;
        }
      }
    }
    return false;
  }

  isInCheck(color) {
    const kingPos = this.board.findKing(color);
    if (!kingPos) return false;
    return this.board.isSquareAttacked(kingPos[0], kingPos[1], this.getOpponentColor(color));
  }

  // Tente de jouer un coup. Retourne true si le coup a été joué.
  makeMove(fromRow, fromCol, toRow, toCol) {
    if (this.isGameOver) return false;

    const legalMoves = this.getLegalMoves(fromRow, fromCol);
    const isLegal = legalMoves.some(([r, c]) => r === toRow && c === toCol);
    if (!isLegal) return false;

    const piece = this.board.getPiece(fromRow, fromCol);
    const notation = this._toNotation(piece, fromRow, fromCol, toRow, toCol);

    const captured = this.board.movePiece(fromRow, fromCol, toRow, toCol);
    if (captured) {
      this.capturedPieces[captured.color].push(captured);
    }

    this.moveHistory.push(notation);
    this.currentTurn = this.getOpponentColor(this.currentTurn);
    this._updateStatus();

    return true;
  }

  _updateStatus() {
    const opponent = this.currentTurn;
    const inCheck = this.isInCheck(opponent);
    const hasMove = this.hasAnyLegalMove(opponent);

    if (inCheck && !hasMove) {
      this.isGameOver = true;
      const winner = this.getOpponentColor(opponent);
      this.statusMessage = `Échec et mat ! Les ${winner === 'white' ? 'White' : 'Black'} gagnent.`;
    } else if (!inCheck && !hasMove) {
      this.isGameOver = true;
      this.statusMessage = 'Pat ! Match nul.';
    } else if (inCheck) {
      this.statusMessage = `Échec aux ${opponent === 'white' ? 'White' : 'Black'} !`;
    } else {
      this.statusMessage = '';
    }
  }

  _toNotation(piece, fromRow, fromCol, toRow, toCol) {
    const files = 'abcdefgh';
    const from = files[fromCol] + (8 - fromRow);
    const to = files[toCol] + (8 - toRow);
    return `${piece.symbol} ${from}-${to}`;
  }

  reset() {
    this.board = new Board();
    this.currentTurn = 'white';
    this.selectedSquare = null;
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
    this.isGameOver = false;
    this.statusMessage = '';
  }
}