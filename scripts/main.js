const board = document.querySelector('.board');
let selectedSquare = null;

// Начальная позиция фигур
const initialPositions = [
    '♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖',
    '♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟',
    '♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'
];

// Создание доски
for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
        const square = document.createElement('div');
        square.classList.add('square');
        square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');

        const index = row * 8 + col;
        square.textContent = initialPositions[index];
        square.dataset.index = index;

        square.addEventListener('click', () => handleSquareClick(square));

        board.appendChild(square);
    }
}

function isPathClear(fromIndex, toIndex, initialPositions) {
    const fromRow = Math.floor(fromIndex / 8);
    const fromCol = fromIndex % 8;
    const toRow = Math.floor(toIndex / 8);
    const toCol = toIndex % 8;

    const stepRow = (toRow - fromRow) !== 0 ? (toRow - fromRow) / Math.abs(toRow - fromRow) : 0;
    const stepCol = (toCol - fromCol) !== 0 ? (toCol - fromCol) / Math.abs(toCol - fromCol) : 0;

    let currentRow = fromRow + stepRow;
    let currentCol = fromCol + stepCol;

    while (currentRow !== toRow || currentCol !== toCol) {
        const index = currentRow * 8 + currentCol;
        if (initialPositions[index]) {
            return false; // На пути есть фигура
        }
        currentRow += stepRow;
        currentCol += stepCol;
    }

    return true;
}

function isValidMove(fromIndex, toIndex, initialPositions) {
    const fromRow = Math.floor(fromIndex / 8);
    const fromCol = fromIndex % 8;
    const toRow = Math.floor(toIndex / 8);
    const toCol = toIndex % 8;

    const piece = initialPositions[fromIndex];
    const targetPiece = initialPositions[toIndex];

    // Проверка на "поедание" своих фигур
    if (targetPiece && (isWhite(piece) === isWhite(targetPiece))) {
        return false; // Нельзя "есть" свои фигуры
    }

    switch (piece) {
        case '♙': // Белая пешка
            if (!targetPiece && toCol === fromCol && toRow === fromRow + 1) return true;
            if (!targetPiece && fromRow === 1 && toCol === fromCol && toRow === fromRow + 1) return isPathClear(fromIndex, toIndex, initialPositions);
            if (targetPiece && Math.abs(toCol - fromCol) === 1 && toRow === fromRow + 1) return true;
            return false;
        case '♟': // Черная пешка
            if (!targetPiece && toCol === fromCol && toRow === fromRow - 1) return true;
            if (!targetPiece && fromRow === 6 && toCol === fromCol && toRow === fromRow - 1) return isPathClear(fromIndex, toIndex, initialPositions);
            if (targetPiece && Math.abs(toCol - fromCol) === 1 && toRow === fromRow - 1) return true;
            return false;
        case '♖': // Ладья
        case '♜':
            return (toRow === fromRow || toCol === fromCol) && isPathClear(fromIndex, toIndex, initialPositions);
        case '♘': // Конь
        case '♞':
            return (Math.abs(toRow - fromRow) === 2 && Math.abs(toCol - fromCol) === 1) ||
                   (Math.abs(toRow - fromRow) === 1 && Math.abs(toCol - fromCol) === 2);
        case '♗': // Слон
        case '♝':
            return Math.abs(toRow - fromRow) === Math.abs(toCol - fromCol) && isPathClear(fromIndex, toIndex, initialPositions);
        case '♕': // Ферзь
        case '♛':
            return ((toRow === fromRow || toCol === fromCol) || 
                    (Math.abs(toRow - fromRow) === Math.abs(toCol - fromCol))) && isPathClear(fromIndex, toIndex, initialPositions);
        case '♔': // Король
        case '♚':
            return Math.abs(toRow - fromRow) <= 1 && Math.abs(toCol - fromCol) <= 1;
        default:
            return false;
    }
}

// Проверка, белая ли фигура
function isWhite(piece) {
    return ['♖', '♘', '♗', '♕', '♔', '♙'].includes(piece);
}

// Обработка кликов
function handleSquareClick(square) {
    if (selectedSquare) {
        const fromIndex = parseInt(selectedSquare.dataset.index);
        const toIndex = parseInt(square.dataset.index);

        if (isValidMove(fromIndex, toIndex, initialPositions)) {
            // Перемещение фигуры
            initialPositions[toIndex] = initialPositions[fromIndex];
            initialPositions[fromIndex] = '';
            square.textContent = selectedSquare.textContent;
            selectedSquare.textContent = '';
            selectedSquare.classList.remove('selected');
            selectedSquare = null;
        } else {
            selectedSquare.classList.remove('selected');
            selectedSquare = null;
        }
    } else if (square.textContent) {
        selectedSquare = square;
        square.classList.add('selected');
    }
}


