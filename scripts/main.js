const board = document.querySelector('.board');
let selectedSquare = null;


// Начальная позиция фигур
const initialPositions = [
    2, 3, 4, 5, 6, 4, 3, 2,
    1, 1, 1, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    -1, -1, -1, -1, -1, -1, -1, -1,
    -2, -3, -4, -5, -6, -4, -3, -2
];
const figures = ['', '♟', '♜', '♞', '♝', '♛', '♚', '♝'];

// Создание доски
for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
        const square = document.createElement('div');
        square.classList.add('square');
        square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
        
        const index = row * 8 + col;
        square.textContent = figures[Math.abs(initialPositions[index])];
        square.dataset.index = index;
        square.addEventListener('click', () => handleSquareClick(square));
        
        board.appendChild(square);
        
        if (initialPositions[index] > 0) {
            square.style.color = '#2F353B'; // Белые фигуры
        } else if (initialPositions[index] < 0) {
            square.style.color = '#FDF4E3'; // Чёрные фигуры
        }
    }
}


// Функция для перезапуска игры
function restartGame() {
    // Сбрасываем доску в начальное состояние
    initialPositions.splice(0, initialPositions.length, ...[
        2, 3, 4, 5, 6, 4, 3, 2,
        1, 1, 1, 1, 1, 1, 1, 1,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        -1, -1, -1, -1, -1, -1, -1, -1,
        -2, -3, -4, -5, -6, -4, -3, -2
    ]);

    // Обновляем доску
    updateBoard();

    // Очищаем историю состояний
    stateHistory = [];

    // Сохраняем веса модели
    saveModelWeights();
}

// Функция для сохранения весов модели
async function saveModelWeights() {
    const weights = await model.save('localstorage://my-model-weights');
    console.log('Веса модели сохранены');
}

// Функция для загрузки весов модели
async function loadModelWeights() {
    try {
        await model.load('localstorage://my-model-weights');
        console.log('Веса модели загружены');
    } catch (e) {
        console.log('Веса модели не найдены, начинаем с нуля');
    }
}

// Загружаем веса модели при старте
loadModelWeights();

// Функция для проверки на проигрыш
function checkForLoss() {
    if (initialPositions.indexOf(-6) === -1) {
        alert('Вы проиграли :(');
        saveModelWeights();
        restartGame();
    } else if (initialPositions.indexOf(6) === -1) {
        alert('Вы победили!');
        saveModelWeights();
        restartGame();
    }
}


// Параметры модели
const numFeatures = 64; // Количество признаков (позиции фигур)
const numActions = 64; // Количество действий (все возможные ходы)

// Создаем упрощённую модель (полносвязная нейронная сеть)
const model = tf.sequential();
model.add(tf.layers.dense({ units: 128, inputShape: [numFeatures], activation: 'relu' }));
model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
model.add(tf.layers.dense({ units: numActions, activation: 'linear' }));

model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'meanSquaredError'
});

// История состояний
let stateHistory = [];

// Добавление состояния в историю
function addStateToHistory(state) {
    if (stateHistory.length >= 5) {
        stateHistory.shift(); // Удаляем самое старое состояние
    }
    stateHistory.push(state);
}

// Получение текущего состояния доски
function getCurrentState() {
    const state = new Array(64).fill(0);
    for (let i = 0; i < 64; i++) {
        if (initialPositions[i] !== 0) {
            state[i] = 1; // 1 — если фигура есть, 0 — если нет
        }
    }
    return state;
}

// Обучение модели
async function trainModel(stateHistory, action, reward, nextState) {
    const nextStateHistory = [...stateHistory.slice(1), nextState];
    const target = reward + 0.99 * (await model.predict(tf.tensor2d([nextStateHistory.flat()])).data())[action];
    const targetF = await model.predict(tf.tensor2d([stateHistory.flat()])).data();
    targetF[action] = target;
    await model.fit(tf.tensor2d([stateHistory.flat()]), tf.tensor2d([targetF]), { epochs: 1 });
}

// Функция для проверки, является ли фигура чёрной
function isBlack(piece) {
    return piece > 0;
}

// Функция для получения всех возможных ходов для чёрных фигур
function getPossibleMoves(initialPositions) {
    const moves = [];
    for (let fromIndex = 0; fromIndex < 64; fromIndex++) {
        if (isBlack(initialPositions[fromIndex])) {
            for (let toIndex = 0; toIndex < 64; toIndex++) {
                if (isValidMove(fromIndex, toIndex, initialPositions)) {
                    moves.push({ fromIndex, toIndex });
                }
            }
        }
    }
    return moves;
}

// Функция для выполнения хода чёрных фигур с помощью модели
async function makeBlackMove() {
    const currentState = getCurrentState();
    addStateToHistory(currentState);

    // Получаем все возможные ходы для чёрных фигур
    const possibleMoves = getPossibleMoves(initialPositions);

    if (possibleMoves.length > 0) {
        // Выбираем случайный ход (в реальности модель должна выбирать ход)
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        const { fromIndex, toIndex } = randomMove;

        // Выполняем ход
        initialPositions[toIndex] = initialPositions[fromIndex];
        initialPositions[fromIndex] = 0;

        // Обновляем доску
        updateBoard();

        // Проверяем на проигрыш
        checkForLoss();

        // Обучаем модель на основе текущего состояния и действия
        const reward = 0; // Награда за ход (можно улучшить)
        const nextState = getCurrentState();
        await trainModel(stateHistory, fromIndex * 64 + toIndex, reward, nextState);
    }
}

// Функция для обновления доски
function updateBoard() {
    const squares = document.querySelectorAll('.square');
    squares.forEach((square, index) => {
        square.textContent = figures[Math.abs(initialPositions[index])];
        if (initialPositions[index] > 0) {
            square.style.color = '#2F353B'; // Белые фигуры
        } else if (initialPositions[index] < 0) {
            square.style.color = '#FDF4E3'; // Чёрные фигуры
        }
    });
}

// Обработка кликов
function handleSquareClick(square) {
    if (selectedSquare) {
        const fromIndex = parseInt(selectedSquare.dataset.index);
        const toIndex = parseInt(square.dataset.index);

        if (isValidMove(fromIndex, toIndex, initialPositions)) {
            // Перемещение фигуры
            initialPositions[toIndex] = initialPositions[fromIndex];
            initialPositions[fromIndex] = 0;

            // Обновляем доску
            updateBoard();

            // Очищаем старую клетку
            selectedSquare.classList.remove('selected');
            selectedSquare = null;

            // Проверяем на проигрыш
            checkForLoss();

            // Делаем ход за чёрные фигуры
            makeBlackMove();
        } else {
            selectedSquare.classList.remove('selected');
            selectedSquare = null;
        }
    } else if (square.textContent && initialPositions[square.dataset.index] < 0) {
        // Выбираем только белые фигуры
        selectedSquare = square;
        square.classList.add('selected');
    }
}


// Проверка на валидность хода
function isValidMove(fromIndex, toIndex, initialPositions) {
    const fromRow = Math.floor(fromIndex / 8);
    const fromCol = fromIndex % 8;
    const toRow = Math.floor(toIndex / 8);
    const toCol = toIndex % 8;

    const piece = initialPositions[fromIndex];
    const targetPiece = initialPositions[toIndex];

    // Проверка на "поедание" своих фигур
    if (targetPiece && (piece * targetPiece > 0)) {
        return false;
    }

    switch (Math.abs(piece)) {
        case 1: // Пешка
            if (piece > 0) { // Белая пешка
                if (!targetPiece && toCol === fromCol && toRow === fromRow + 1) return true;
                if (!targetPiece && fromRow === 1 && toCol === fromCol && toRow === fromRow + 1) return true;
                if (targetPiece && Math.abs(toCol - fromCol) === 1 && toRow === fromRow + 1) return true;
            } else { // Чёрная пешка
                if (!targetPiece && toCol === fromCol && toRow === fromRow - 1) return true;
                if (!targetPiece && fromRow === 6 && toCol === fromCol && toRow === fromRow - 1) return true;
                if (targetPiece && Math.abs(toCol - fromCol) === 1 && toRow === fromRow - 1) return true;
            }
            return false;
        case 2: // Ладья
            return (toRow === fromRow || toCol === fromCol) && isPathClear(fromIndex, toIndex, initialPositions);
        case 3: // Конь
            return (Math.abs(toRow - fromRow) === 2 && Math.abs(toCol - fromCol) === 1) ||
                   (Math.abs(toRow - fromRow) === 1 && Math.abs(toCol - fromCol) === 2);
        case 4: // Слон
            return Math.abs(toRow - fromRow) === Math.abs(toCol - fromCol) && isPathClear(fromIndex, toIndex, initialPositions);
        case 5: // Ферзь
            return ((toRow === fromRow || toCol === fromCol) || 
                    (Math.abs(toRow - fromRow) === Math.abs(toCol - fromCol))) && isPathClear(fromIndex, toIndex, initialPositions);
        case 6: // Король
            return Math.abs(toRow - fromRow) <= 1 && Math.abs(toCol - fromCol) <= 1;
        default:
            return false;
    }
}

// Проверка на свободный путь
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