const game = new Game();

const boardEl = document.getElementById('board');
const turnTextEl = document.getElementById('turn-text');
const statusEl = document.getElementById('status');
const historyEl = document.getElementById('move-history');
const capturedWhiteEl = document.getElementById('captured-white-list');
const capturedBlackEl = document.getElementById('captured-black-list');
const restartBtn = document.getElementById('restart-btn');
const rankLabelsEl = document.getElementById('rank-labels');
const fileLabelsEl = document.getElementById('file-labels');
const promotionOverlayEl = document.getElementById('promotion-overlay');
const promotionChoicesEl = document.getElementById('promotion-choices');

// Coup en attente du choix de promotion du joueur (null si aucun).
let pendingPromotion = null;

// Un piece "vide" par type, juste pour récupérer son glyphe d'affichage
// (aucune règle de déplacement n'est utilisée ici).
const PIECE_CLASSES = { pawn: Pawn, rook: Rook, knight: Knight, bishop: Bishop, queen: Queen, king: King };

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function renderCoordinates() {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  for (let rank = 8; rank >= 1; rank--) {
    const span = document.createElement('span');
    span.textContent = rank;
    rankLabelsEl.appendChild(span);
  }
  for (const file of files) {
    const span = document.createElement('span');
    span.textContent = file;
    fileLabelsEl.appendChild(span);
  }
}

function renderBoard() {
  boardEl.innerHTML = '';

  const legalMoves = game.selectedSquare
    ? game.getLegalMoves(game.selectedSquare[0], game.selectedSquare[1])
    : [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement('div');
      const isLight = (row + col) % 2 === 0;
      square.className = `square ${isLight ? 'light' : 'dark'}`;
      square.dataset.row = row;
      square.dataset.col = col;

      const piece = game.board.getPiece(row, col);
      if (piece) {
        const pieceEl = document.createElement('span');
        pieceEl.className = `piece piece-${piece.color}`;
        pieceEl.textContent = piece.glyph;

        if (!game.isGameOver && !pendingPromotion && piece.color === game.currentTurn) {
          pieceEl.draggable = true;
          pieceEl.addEventListener('dragstart', (e) => onDragStart(e, row, col));
          pieceEl.addEventListener('dragend', () => onDragEnd());
        }

        square.appendChild(pieceEl);
      }

      if (game.selectedSquare && game.selectedSquare[0] === row && game.selectedSquare[1] === col) {
        square.classList.add('selected');
      }

      if (legalMoves.some(([r, c]) => r === row && c === col)) {
        square.classList.add(piece ? 'legal-capture' : 'legal-move');
      }

      if (piece && piece.type === 'king' && game.isInCheck(piece.color)) {
        square.classList.add('in-check');
      }

      square.addEventListener('click', () => onSquareClick(row, col));
      square.addEventListener('dragover', (e) => e.preventDefault());
      square.addEventListener('drop', (e) => onDrop(e, row, col));
      boardEl.appendChild(square);
    }
  }
}

// Tente de jouer un coup depuis fromRow/fromCol vers toRow/toCol.
// Si ce coup est une promotion de pion, ouvre le sélecteur de pièce au lieu
// de jouer le coup immédiatement (le coup est finalisé quand le joueur
// choisit une pièce, voir resolvePromotion).
function attemptMove(fromRow, fromCol, toRow, toCol) {
  const isLegal = game.getLegalMoves(fromRow, fromCol).some(([r, c]) => r === toRow && c === toCol);
  if (!isLegal) return false;

  if (game.isPromotionMove(fromRow, fromCol, toRow)) {
    openPromotionPicker(fromRow, fromCol, toRow, toCol);
    return true;
  }

  return game.makeMove(fromRow, fromCol, toRow, toCol);
}

function openPromotionPicker(fromRow, fromCol, toRow, toCol) {
  pendingPromotion = { fromRow, fromCol, toRow, toCol };

  const color = game.board.getPiece(fromRow, fromCol).color;
  const choices = ['queen', 'rook', 'bishop', 'knight'];

  promotionChoicesEl.innerHTML = '';
  for (const type of choices) {
    const PieceClass = PIECE_CLASSES[type];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'promotion-choice';
    button.setAttribute('aria-label', capitalize(type));

    const glyphEl = document.createElement('span');
    glyphEl.className = `piece piece-${color}`;
    glyphEl.textContent = new PieceClass(color).glyph;
    button.appendChild(glyphEl);

    const labelEl = document.createElement('span');
    labelEl.className = 'promotion-choice-label';
    labelEl.textContent = capitalize(type);
    button.appendChild(labelEl);

    button.addEventListener('click', () => resolvePromotion(type));
    promotionChoicesEl.appendChild(button);
  }

  promotionOverlayEl.classList.add('visible');
}

function resolvePromotion(promotionType) {
  if (!pendingPromotion) return;

  const { fromRow, fromCol, toRow, toCol } = pendingPromotion;
  pendingPromotion = null;
  promotionOverlayEl.classList.remove('visible');

  game.makeMove(fromRow, fromCol, toRow, toCol, promotionType);
  game.selectedSquare = null;
  renderAll();
}

function onDragStart(e, row, col) {
  if (pendingPromotion) return;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', `${row},${col}`);
  e.currentTarget.classList.add('dragging');

  game.selectedSquare = [row, col];
  const legalMoves = game.getLegalMoves(row, col);
  for (const [r, c] of legalMoves) {
    const targetSquare = boardEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    if (!targetSquare) continue;
    targetSquare.classList.add(game.board.getPiece(r, c) ? 'legal-capture' : 'legal-move');
  }
}

function onDragEnd() {
  if (!game.selectedSquare) return;

  game.selectedSquare = null;
  renderAll();
}

function onDrop(e, row, col) {
  e.preventDefault();
  if (pendingPromotion) return;

  const data = e.dataTransfer.getData('text/plain');
  if (!data) return;

  const [fromRow, fromCol] = data.split(',').map(Number);
  attemptMove(fromRow, fromCol, row, col);
  game.selectedSquare = null;
  renderAll();
}

function onSquareClick(row, col) {
  if (game.isGameOver || pendingPromotion) return;

  const clickedPiece = game.board.getPiece(row, col);

  if (game.selectedSquare) {
    const [selRow, selCol] = game.selectedSquare;

    if (selRow === row && selCol === col) {
      game.selectedSquare = null;
    } else {
      const moved = attemptMove(selRow, selCol, row, col);
      if (moved) {
        game.selectedSquare = null;
      } else if (clickedPiece && clickedPiece.color === game.currentTurn) {
        game.selectedSquare = [row, col];
      } else {
        game.selectedSquare = null;
      }
    }
  } else if (clickedPiece && clickedPiece.color === game.currentTurn) {
    game.selectedSquare = [row, col];
  }

  renderAll();
}

function renderTurnIndicator() {
  turnTextEl.textContent = `The Move Belongs To : ${game.currentTurn === 'white' ? 'White' : 'Black'}`;
}

function renderStatus() {
  statusEl.textContent = game.statusMessage;
}

function renderHistory() {
  historyEl.innerHTML = '';
  for (const entry of game.moveHistory) {
    const li = document.createElement('li');
    li.textContent = entry;
    historyEl.appendChild(li);
  }
  historyEl.scrollTop = historyEl.scrollHeight;
}

function renderCaptured() {
  capturedWhiteEl.innerHTML = game.capturedPieces.white
    .map(p => `<span class="piece piece-${p.color}">${p.glyph}</span>`)
    .join('');
  capturedBlackEl.innerHTML = game.capturedPieces.black
    .map(p => `<span class="piece piece-${p.color}">${p.glyph}</span>`)
    .join('');
}

// Affiche, sous chaque plateau de pièces tombées, un médaillon représentant
// la pièce qui a porté le dernier coup pour ce camp (glyphe par défaut,
// remplacé automatiquement par une image si IMAGE/Pieces/{color}-{type}.png
// existe).
function renderCapturers() {
  for (const color of ['white', 'black']) {
    const type = game.lastCapturingPiece[color];
    const badgeEl = document.getElementById(`capturer-${color}`);
    const photoEl = document.getElementById(`capturer-${color}-photo`);
    const glyphEl = document.getElementById(`capturer-${color}-glyph`);
    const captionEl = document.getElementById(`capturer-${color}-caption`);
    const backdropEl = document.getElementById(`backdrop-${color}`);

    if (!type) {
      badgeEl.classList.remove('visible');
      backdropEl.classList.remove('visible');
      continue;
    }

    badgeEl.classList.add('visible');

    const PieceClass = PIECE_CLASSES[type];
    glyphEl.textContent = PieceClass ? new PieceClass(color).glyph : '';
    captionEl.textContent = capitalize(type);

    const imageUrl = `IMAGE/Pieces/${color}-${type}.png`;
    photoEl.classList.remove('loaded');
    backdropEl.classList.remove('visible');
    photoEl.onload = () => {
      photoEl.classList.add('loaded');
      backdropEl.style.backgroundImage = `url('${imageUrl}')`;
      backdropEl.classList.add('visible');
    };
    photoEl.onerror = () => {
      photoEl.classList.remove('loaded');
      backdropEl.classList.remove('visible');
    };
    photoEl.src = imageUrl;
  }
}

function renderAll() {
  renderBoard();
  renderTurnIndicator();
  renderStatus();
  renderHistory();
  renderCaptured();
  renderCapturers();
}

restartBtn.addEventListener('click', () => {
  game.reset();
  pendingPromotion = null;
  promotionOverlayEl.classList.remove('visible');
  renderAll();
});

renderCoordinates();
renderAll();