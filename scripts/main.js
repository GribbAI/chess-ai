const board = document.querySelector('.board');
let selectedSquare = null;

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

for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
        const square = document.createElement('div');
        square.classList.add('square');
        if ((row + col) % 2 === 0) {
            square.classList.add('light');
        } else {
            square.classList.add('dark');
        }

        const index = row * 8 + col;
        square.textContent = initialPositions[index];
        square.dataset.index = index;

        square.addEventListener('click', () => handleSquareClick(square));

        board.appendChild(square);
    }
}

function handleSquareClick(square) {
    if (selectedSquare) {
        if (square.textContent === '' || square.textContent !== selectedSquare.textContent) {
            square.textContent = selectedSquare.textContent;
            selectedSquare.textContent = '';
            deselectSquare();
        }
    } else {
        if (square.textContent !== '') {
            selectedSquare = square;
            square.classList.add('selected');
        }
    }
}

function deselectSquare() {
    if (selectedSquare) {
        selectedSquare.classList.remove('selected');
        selectedSquare = null;
    }
}