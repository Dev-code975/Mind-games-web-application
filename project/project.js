document.addEventListener('DOMContentLoaded', function () {
    // Game selector functionality
    const gameButtons = document.querySelectorAll('.game-btn');
    const gameContainers = document.querySelectorAll('.game-container');

    // Function to reset game state when switching games
    function resetGameState(exceptGame = null) {
        Object.keys(gameStarted).forEach(game => {
            if (game !== exceptGame) {
                gameStarted[game] = false;
            }
        });
    }

    // Track if games have started
    const gameStarted = {
        sudoku: false,
        crossword: false,
        memory: false
    };

    // Function to handle first interaction with a game
    function handleFirstInteraction(game) {
        if (!gameStarted[game]) {
            gameStarted[game] = true;
            startTimer(game);
        }
    }

    // Timer state for all games
    const gameTimers = {
        sudoku: { seconds: 0, interval: null, paused: false },
        crossword: { seconds: 0, interval: null, paused: false },
        memory: { seconds: 0, interval: null, paused: false }
    };

    // Timer elements
    const timerElements = {
        sudoku: document.getElementById('sudoku-timer'),
        crossword: document.getElementById('crossword-timer'),
        memory: document.getElementById('memory-timer')
    };

    // Pause buttons
    const pauseButtons = {
        sudoku: document.getElementById('pause-sudoku'),
        crossword: document.getElementById('pause-crossword'),
        memory: document.getElementById('pause-memory')
    };

    // Initialize pause button listeners
    Object.entries(pauseButtons).forEach(([game, btn]) => {
        if (btn) {
            btn.addEventListener('click', () => toggleGamePause(game));
        }
    });

    // Timer functions
    function startTimer(game) {
        if (gameTimers[game].interval) clearInterval(gameTimers[game].interval);
        gameTimers[game].paused = false;
        updateTimerDisplay(game);
        gameTimers[game].interval = setInterval(() => {
            if (!gameTimers[game].paused) {
                gameTimers[game].seconds++;
                updateTimerDisplay(game);
            }
        }, 1000);
        if (pauseButtons[game]) {
            pauseButtons[game].innerHTML = '<i class="fas fa-pause"></i>';
        }
    }

    function stopTimer(game) {
        if (gameTimers[game].interval) {
            clearInterval(gameTimers[game].interval);
            gameTimers[game].interval = null;
        }
    }

    function resetTimer(game) {
        stopTimer(game);
        gameTimers[game].seconds = 0;
        gameTimers[game].paused = false;
        updateTimerDisplay(game);
    }

    function toggleGamePause(game) {
        gameTimers[game].paused = !gameTimers[game].paused;
        if (pauseButtons[game]) {
            pauseButtons[game].innerHTML = gameTimers[game].paused ?
                '<i class="fas fa-play"></i>' :
                '<i class="fas fa-pause"></i>';
        }
        showMessage(gameTimers[game].paused ? 'Game paused' : 'Game resumed', 'success');
    }

    function updateTimerDisplay(game) {
        const mins = Math.floor(gameTimers[game].seconds / 60);
        const secs = gameTimers[game].seconds % 60;
        if (timerElements[game]) {
            timerElements[game].textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    }

    gameButtons.forEach(button => {
        button.addEventListener('click', () => {
            const gameName = button.getAttribute('data-game');

            // Stop any active timers and reset game states
            Object.keys(gameTimers).forEach(game => {
                stopTimer(game);
                resetTimer(game);
                gameStarted[game] = false;
            });

            // Update active button
            gameButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Initialize the selected game
            if (gameName === 'sudoku') {
                initSudokuGame();
            } else if (gameName === 'crossword') {
                initCrosswordGame();
            } else if (gameName === 'memory') {
                initMemoryGame();
            }

            // Show selected game container or mental health tips
            if (gameName === 'mental-health-tips') {
                gameContainers.forEach(container => container.classList.remove('active'));
                document.querySelector('.mental-health-tips').style.display = 'block';
            } else {
                document.querySelector('.mental-health-tips').style.display = 'none';
                gameContainers.forEach(container => {
                    container.classList.remove('active');
                    if (container.id === `${gameName}-game`) {
                        container.classList.add('active');
                    }
                });
            }

            // Reset timers and game states when switching games
            stopAllTimers();
            resetGameState();
        });
    });

    // Show message function
    function showMessage(text, type = 'success') {
        const messageElement = document.getElementById('message');
        messageElement.textContent = text;
        messageElement.className = 'message show';

        if (type === 'error') {
            messageElement.classList.add('error');
        }

        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 4000);
    }

    // Stop all timers
    function stopAllTimers() {
        Object.keys(gameTimers).forEach(game => {
            stopTimer(game);
            resetTimer(game);
        });
    }

    // ==================== SUDOKU GAME ====================
    const sudokuBoard = document.getElementById('sudoku-board');
    const timerElement = document.getElementById('timer');
    const scoreElement = document.getElementById('score');
    const hintsElement = document.getElementById('hints');
    const newGameBtn = document.getElementById('new-game-btn');
    const checkBtn = document.getElementById('check-btn');
    const hintBtn = document.getElementById('hint-btn');
    const numberButtons = document.querySelectorAll('.number-btn');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    const pauseSudokuBtn = document.getElementById('pause-sudoku');

    let selectedCell = null;
    let gameBoard = [];
    let solutionBoard = [];
    let sudokuTimer = null;
    let sudokuSeconds = 0;
    let hints = 3;
    let score = 0;
    let difficulty = 'easy';
    let sudokuPaused = false;

    // Enhanced Sudoku puzzles with more variety
    const sudokuPuzzles = {
        easy: [
            {
                puzzle: [
                    [0, 3, 0, 0, 6, 2, 0, 0, 7],
                    [6, 9, 2, 4, 0, 5, 0, 0, 0],
                    [0, 4, 0, 3, 1, 8, 2, 0, 6],
                    [4, 0, 0, 5, 3, 7, 0, 8, 0],
                    [3, 5, 7, 8, 9, 1, 0, 2, 0],
                    [0, 0, 0, 2, 4, 6, 7, 5, 3],
                    [2, 1, 0, 0, 5, 4, 3, 0, 8],
                    [8, 7, 0, 0, 2, 9, 4, 6, 5],
                    [0, 0, 4, 7, 8, 0, 9, 1, 2]

                ],
                solution: [
                    [1, 3, 8, 9, 6, 2, 5, 4, 7],
                    [6, 9, 2, 4, 7, 5, 8, 3, 1],
                    [7, 4, 5, 3, 1, 8, 2, 9, 6],
                    [4, 2, 6, 5, 3, 7, 1, 8, 9],
                    [3, 5, 7, 8, 9, 1, 6, 2, 4],
                    [9, 8, 1, 2, 4, 6, 7, 5, 3],
                    [2, 1, 9, 6, 5, 4, 3, 7, 8],
                    [8, 7, 3, 1, 2, 9, 4, 6, 5],
                    [5, 6, 4, 7, 8, 3, 9, 1, 2]

                ]
            },
            {
                puzzle: [
                    [0, 7, 1, 3, 0, 2, 4, 8, 6],
                    [8, 6, 0, 5, 7, 1, 2, 3, 9],
                    [3, 0, 0, 8, 0, 0, 1, 5, 0],
                    [7, 0, 5, 0, 0, 0, 0, 6, 0],
                    [0, 0, 8, 0, 4, 5, 0, 9, 1],
                    [0, 1, 3, 6, 2, 0, 5, 7, 0],
                    [4, 0, 7, 0, 5, 9, 6, 2, 3],
                    [2, 0, 6, 4, 8, 0, 0, 0, 5],
                    [1, 0, 0, 0, 3, 0, 0, 4, 8]

                ],
                solution: [
                    [5, 7, 1, 3, 9, 2, 4, 8, 6],
                    [8, 6, 4, 5, 7, 1, 2, 3, 9],
                    [3, 9, 2, 8, 6, 4, 1, 5, 7],
                    [7, 4, 5, 9, 1, 3, 8, 6, 2],
                    [6, 2, 8, 7, 4, 5, 3, 9, 1],
                    [9, 1, 3, 6, 2, 8, 5, 7, 4],
                    [4, 8, 7, 1, 5, 9, 6, 2, 3],
                    [2, 3, 6, 4, 8, 7, 9, 1, 5],
                    [1, 5, 9, 2, 3, 6, 7, 4, 8]

                ]
            },
            {
                puzzle: [
                    [9, 3, 6, 0, 1, 8, 0, 2, 7],
                    [4, 8, 1, 0, 2, 5, 3, 6, 9],
                    [7, 0, 2, 9, 0, 0, 8, 1, 4],
                    [0, 9, 0, 0, 0, 4, 7, 5, 0],
                    [6, 4, 8, 0, 0, 7, 0, 3, 2],
                    [1, 7, 0, 2, 3, 9, 4, 8, 0],
                    [0, 6, 0, 0, 0, 1, 0, 0, 5],
                    [5, 0, 9, 0, 4, 6, 1, 0, 8],
                    [8, 1, 0, 0, 9, 0, 6, 4, 0]

                ],
                solution: [
                    [9, 3, 6, 4, 1, 8, 5, 2, 7],
                    [4, 8, 1, 7, 2, 5, 3, 6, 9],
                    [7, 5, 2, 9, 6, 3, 8, 1, 4],
                    [2, 9, 3, 6, 8, 4, 7, 5, 1],
                    [6, 4, 8, 1, 5, 7, 9, 3, 2],
                    [1, 7, 5, 2, 3, 9, 4, 8, 6],
                    [3, 6, 4, 8, 7, 1, 2, 9, 5],
                    [5, 2, 9, 3, 4, 6, 1, 7, 8],
                    [8, 1, 7, 5, 9, 2, 6, 4, 3]

                ]
            }
        ],
        medium: [
            {
                puzzle: [
                    [0, 1, 9, 7, 0, 0, 4, 0, 0],
                    [0, 2, 0, 0, 3, 1, 7, 8, 5],
                    [0, 0, 7, 4, 6, 0, 9, 1, 3],
                    [2, 7, 5, 0, 1, 4, 0, 9, 8],
                    [1, 4, 6, 3, 0, 9, 0, 0, 2],
                    [8, 9, 0, 5, 0, 0, 6, 4, 0],
                    [9, 6, 0, 8, 7, 0, 0, 0, 4],
                    [7, 0, 8, 0, 0, 5, 0, 6, 9],
                    [0, 0, 2, 1, 0, 0, 0, 0, 7]

                ],
                solution: [
                    [3, 1, 9, 7, 5, 8, 4, 2, 6],
                    [6, 2, 4, 9, 3, 1, 7, 8, 5],
                    [5, 8, 7, 4, 6, 2, 9, 1, 3],
                    [2, 7, 5, 6, 1, 4, 3, 9, 8],
                    [1, 4, 6, 3, 8, 9, 5, 7, 2],
                    [8, 9, 3, 5, 2, 7, 6, 4, 1],
                    [9, 6, 1, 8, 7, 3, 2, 5, 4],
                    [7, 3, 8, 2, 4, 5, 1, 6, 9],
                    [4, 5, 2, 1, 9, 6, 8, 3, 7]
                ]
            },
            {
                puzzle: [
                    [0, 0, 9, 8, 0, 1, 0, 0, 2],
                    [3, 0, 2, 0, 0, 9, 0, 8, 1],
                    [8, 0, 0, 0, 0, 2, 0, 0, 0],
                    [7, 9, 3, 6, 1, 0, 0, 4, 0],
                    [0, 2, 0, 7, 9, 3, 1, 6, 5],
                    [6, 1, 5, 0, 2, 8, 9, 0, 0],
                    [2, 0, 4, 9, 0, 7, 0, 1, 6],
                    [0, 8, 6, 2, 0, 0, 5, 9, 7],
                    [9, 5, 7, 1, 8, 6, 0, 0, 0]

                ],
                solution: [
                    [5, 6, 9, 8, 4, 1, 7, 3, 2],
                    [3, 7, 2, 5, 6, 9, 4, 8, 1],
                    [8, 4, 1, 3, 7, 2, 6, 5, 9],
                    [7, 9, 3, 6, 1, 5, 2, 4, 8],
                    [4, 2, 8, 7, 9, 3, 1, 6, 5],
                    [6, 1, 5, 4, 2, 8, 9, 7, 3],
                    [2, 3, 4, 9, 5, 7, 8, 1, 6],
                    [1, 8, 6, 2, 3, 4, 5, 9, 7],
                    [9, 5, 7, 1, 8, 6, 3, 2, 4]

                ]
            },
            {
                puzzle: [
                    [6, 7, 9, 0, 2, 8, 0, 0, 1],
                    [3, 1, 0, 7, 6, 0, 8, 0, 4],
                    [2, 0, 0, 1, 0, 5, 0, 6, 0],
                    [5, 2, 0, 3, 9, 7, 4, 8, 6],
                    [8, 6, 4, 2, 0, 1, 7, 9, 0],
                    [0, 0, 0, 6, 0, 4, 1, 0, 2],
                    [0, 9, 6, 8, 0, 0, 3, 0, 5],
                    [7, 5, 0, 9, 0, 0, 0, 1, 8],
                    [1, 0, 2, 5, 0, 0, 6, 4, 0]

                ],
                solution: [
                    [6, 7, 9, 4, 2, 8, 5, 3, 1],
                    [3, 1, 5, 7, 6, 9, 8, 2, 4],
                    [2, 4, 8, 1, 3, 5, 9, 6, 7],
                    [5, 2, 1, 3, 9, 7, 4, 8, 6],
                    [8, 6, 4, 2, 5, 1, 7, 9, 3],
                    [9, 3, 7, 6, 8, 4, 1, 5, 2],
                    [4, 9, 6, 8, 1, 2, 3, 7, 5],
                    [7, 5, 3, 9, 4, 6, 2, 1, 8],
                    [1, 8, 2, 5, 7, 3, 6, 4, 9]

                ]
            },

        ],
        hard: [
            {
                puzzle: [
                    [0, 1, 2, 8, 0, 6, 3, 5, 4],
                    [6, 7, 0, 5, 3, 4, 0, 0, 9],
                    [4, 3, 0, 2, 0, 0, 0, 0, 0],
                    [2, 0, 0, 0, 6, 0, 4, 1, 0],
                    [0, 6, 3, 1, 0, 0, 9, 7, 0],
                    [0, 4, 1, 0, 0, 2, 6, 3, 8],
                    [3, 8, 0, 9, 5, 0, 0, 0, 7],
                    [7, 2, 6, 0, 8, 3, 0, 0, 0],
                    [0, 0, 0, 0, 2, 0, 8, 0, 3]

                ],
                solution: [
                    [9, 1, 2, 8, 7, 6, 3, 5, 4],
                    [6, 7, 8, 5, 3, 4, 1, 2, 9],
                    [4, 3, 5, 2, 1, 9, 7, 8, 6],
                    [2, 9, 7, 3, 6, 8, 4, 1, 5],
                    [8, 6, 3, 1, 4, 5, 9, 7, 2],
                    [5, 4, 1, 7, 9, 2, 6, 3, 8],
                    [3, 8, 4, 9, 5, 1, 2, 6, 7],
                    [7, 2, 6, 4, 8, 3, 5, 9, 1],
                    [1, 5, 9, 6, 2, 7, 8, 4, 3]

                ]
            },
            {
                puzzle: [
                    [0, 0, 9, 8, 0, 0, 0, 7, 0],
                    [7, 6, 0, 0, 9, 0, 4, 8, 5],
                    [8, 0, 4, 0, 0, 0, 9, 2, 3],
                    [3, 1, 0, 5, 2, 9, 0, 6, 4],
                    [0, 9, 0, 6, 8, 0, 0, 3, 0],
                    [6, 4, 8, 3, 0, 1, 0, 5, 0],
                    [9, 0, 0, 4, 0, 2, 0, 0, 8],
                    [4, 0, 0, 1, 0, 0, 3, 9, 7],
                    [0, 0, 0, 9, 3, 7, 5, 4, 2]

                ],
                solution: [
                    [2, 3, 9, 8, 4, 5, 1, 7, 6],
                    [7, 6, 1, 2, 9, 3, 4, 8, 5],
                    [8, 5, 4, 7, 1, 6, 9, 2, 3],
                    [3, 1, 7, 5, 2, 9, 8, 6, 4],
                    [5, 9, 2, 6, 8, 4, 7, 3, 1],
                    [6, 4, 8, 3, 7, 1, 2, 5, 9],
                    [9, 7, 3, 4, 5, 2, 6, 1, 8],
                    [4, 2, 5, 1, 6, 8, 3, 9, 7],
                    [1, 8, 6, 9, 3, 7, 5, 4, 2]

                ]
            },
            {
                puzzle: [
                    [0, 5, 0, 0, 8, 2, 7, 4, 0],
                    [0, 3, 2, 4, 7, 0, 6, 0, 1],
                    [7, 4, 9, 5, 6, 0, 0, 0, 2],
                    [0, 0, 5, 6, 0, 0, 2, 0, 4],
                    [2, 8, 0, 0, 9, 5, 1, 0, 3],
                    [0, 0, 0, 8, 2, 4, 9, 0, 0],
                    [0, 0, 6, 0, 0, 0, 0, 0, 7],
                    [3, 0, 8, 2, 4, 0, 0, 0, 6],
                    [0, 0, 7, 9, 5, 6, 3, 1, 8]

                ],
                solution: [
                    [6, 5, 1, 3, 8, 2, 7, 4, 9],
                    [8, 3, 2, 4, 7, 9, 6, 5, 1],
                    [7, 4, 9, 5, 6, 1, 8, 3, 2],
                    [9, 7, 5, 6, 1, 3, 2, 8, 4],
                    [2, 8, 4, 7, 9, 5, 1, 6, 3],
                    [1, 6, 3, 8, 2, 4, 9, 7, 5],
                    [5, 9, 6, 1, 3, 8, 4, 2, 7],
                    [3, 1, 8, 2, 4, 7, 5, 9, 6],
                    [4, 2, 7, 9, 5, 6, 3, 1, 8]

                ]
            }
        ]
    };

    // Initialize Sudoku game
    function initSudokuGame() {
        // Reset game state
        gameStarted.sudoku = false;
        const puzzles = sudokuPuzzles[difficulty];
        const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
        gameBoard = JSON.parse(JSON.stringify(randomPuzzle.puzzle));
        solutionBoard = JSON.parse(JSON.stringify(randomPuzzle.solution));
        hints = 3;
        hintsElement.textContent = hints;
        score = 0;
        scoreElement.textContent = score;
        resetTimer('sudoku');

        // Clear board
        sudokuBoard.innerHTML = '';

        // Create cells
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.classList.add('sudoku-cell');
                cell.dataset.row = row;
                cell.dataset.col = col;

                if (gameBoard[row][col] !== 0) {
                    cell.textContent = gameBoard[row][col];
                    cell.classList.add('fixed');
                }

                cell.addEventListener('click', selectSudokuCell);
                sudokuBoard.appendChild(cell);
            }
        }

        // Start timer
        startTimer('sudoku');
    }

    // Start Sudoku timer
    function startSudokuTimer() {
        if (sudokuTimer) clearInterval(sudokuTimer);
        updateSudokuTimer(); // Update immediately when starting
        sudokuTimer = setInterval(() => {
            if (!sudokuPaused) {
                sudokuSeconds++;
                updateSudokuTimer();
            }
        }, 1000);
    }

    // Update Sudoku timer display
    function updateSudokuTimer() {
        const mins = Math.floor(sudokuSeconds / 60);
        const secs = sudokuSeconds % 60;
        if (timerElement) {
            timerElement.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    }

    // Pause Sudoku timer
    pauseSudokuBtn.addEventListener('click', () => {
        sudokuPaused = !sudokuPaused;
        if (sudokuPaused) {
            pauseSudokuBtn.innerHTML = '<i class="fas fa-play"></i>';
            showMessage('Game paused', 'success');
        } else {
            pauseSudokuBtn.innerHTML = '<i class="fas fa-pause"></i>';
            showMessage('Game resumed', 'success');
        }
    });

    // Select a Sudoku cell
    function selectSudokuCell(e) {
        if (e.target.classList.contains('fixed')) return;

        // Start timer on first interaction
        handleFirstInteraction('sudoku');

        // Remove previous selection
        document.querySelectorAll('.sudoku-cell.selected').forEach(cell => {
            cell.classList.remove('selected');
        });

        // Select new cell
        e.target.classList.add('selected');
        selectedCell = e.target;
    }

    // Handle number button clicks for Sudoku
    numberButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!selectedCell) {
                showMessage('Please select a cell first', 'error');
                return;
            }

            if (gameTimers.sudoku.paused) {
                showMessage('Game is paused!', 'error');
                return;
            }

            const number = parseInt(button.getAttribute('data-number'));
            const row = parseInt(selectedCell.dataset.row);
            const col = parseInt(selectedCell.dataset.col);

            // Clear cell if number is 0
            if (number === 0) {
                gameBoard[row][col] = 0;
                selectedCell.textContent = '';
                selectedCell.classList.remove('error');
                return;
            }

            // Update board and cell
            gameBoard[row][col] = number;
            selectedCell.textContent = number;

            // Check if correct and puzzle is complete
            if (number === solutionBoard[row][col] && isSudokuPuzzleComplete()) {
                stopTimer('sudoku');
                showMessage('Congratulations! You\'ve completed the puzzle!', 'success');
                // Calculate score based on time taken
                score += Math.max(100 - Math.floor(gameTimers.sudoku.seconds / 10), 10);
                scoreElement.textContent = score;
                selectedCell.classList.remove('error');
            } else if (number !== solutionBoard[row][col]) {
                selectedCell.classList.add('error');
                score = Math.max(0, score - 5);
                scoreElement.textContent = score;
            } else {
                selectedCell.classList.remove('error');
            }
        });
    });

    // Check if Sudoku puzzle is complete
    function isSudokuPuzzleComplete() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (gameBoard[row][col] !== solutionBoard[row][col]) {
                    return false;
                }
            }
        }
        return true;
    }

    // New game button for Sudoku
    newGameBtn.addEventListener('click', initSudokuGame);

    // Check solution button for Sudoku
    checkBtn.addEventListener('click', () => {
        if (gameTimers.sudoku.paused) {
            showMessage('Game is paused!', 'error');
            return;
        }

        let errors = 0;
        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);

            if (gameBoard[row][col] !== 0 && gameBoard[row][col] !== solutionBoard[row][col]) {
                cell.classList.add('error');
                errors++;
            } else if (gameBoard[row][col] === solutionBoard[row][col]) {
                cell.classList.remove('error');
            }
        });

        if (errors === 0) {
            showMessage('No errors found! Keep going!', 'success');
        } else {
            showMessage(`Found ${errors} error${errors > 1 ? 's' : ''}`, 'error');
        }
    });

    // Hint button for Sudoku
    hintBtn.addEventListener('click', () => {
        if (gameTimers.sudoku.paused) {
            showMessage('Game is paused!', 'error');
            return;
        }

        if (hints <= 0) {
            showMessage('No hints remaining', 'error');
            return;
        }

        // Find empty cells
        const emptyCells = [];
        document.querySelectorAll('.sudoku-cell:not(.fixed)').forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            if (gameBoard[row][col] === 0) {
                emptyCells.push({ cell, row, col });
            }
        });

        if (emptyCells.length === 0) {
            showMessage('No empty cells to fill', 'error');
            return;
        }

        // Get random empty cell
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const correctValue = solutionBoard[randomCell.row][randomCell.col];

        // Update board and cell
        gameBoard[randomCell.row][randomCell.col] = correctValue;
        randomCell.cell.textContent = correctValue;
        randomCell.cell.classList.remove('error');

        // Update hints and score
        hints--;
        hintsElement.textContent = hints;
        score = Math.max(0, score - 20); // Penalty for using hint
        scoreElement.textContent = score;

        // Check if puzzle is complete
        if (isSudokuPuzzleComplete()) {
            clearInterval(sudokuTimer);
            score += 100; // Bonus for completion
            scoreElement.textContent = score;
            showMessage('Congratulations! You solved the puzzle!', 'success');
        }
    });

    // Difficulty selector for Sudoku
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            difficultyButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            difficulty = button.getAttribute('data-level');
            initSudokuGame();
        });
    });

    // Initialize Sudoku game on load
    initSudokuGame();

    // ==================== CROSSWORD GAME ====================
    const crosswordGrid = document.getElementById('crossword-grid');
    const acrossClues = document.getElementById('across-clues');
    const downClues = document.getElementById('down-clues');
    const crosswordScoreElement = document.getElementById('crossword-score');
    const newCrosswordBtn = document.getElementById('new-crossword-btn');
    const checkCrosswordBtn = document.getElementById('check-crossword-btn');
    const revealCrosswordBtn = document.getElementById('reveal-crossword-btn');

    let crosswordScore = 0;
    let selectedClue = null;
    let selectedDirection = null;
    let selectedWord = null;

    // Enhanced crossword puzzle data with multiple puzzles
    const crosswordPuzzles = [
        {
            // Original Brain/Mind themed puzzle
            grid: [
                ['B', 'R', 'A', 'I', 'N', '#', 'M', 'I', 'N', 'D'],
                ['#', 'E', '#', 'S', '#', 'F', '#', '#', '#', '#'],
                ['M', 'L', 'E', 'M', 'O', 'R', 'Y', '#', '#', '#'],
                ['E', 'A', '#', 'A', '#', 'C', '#', 'R', '#', '#'],
                ['D', 'X', '#', 'R', '#', 'U', '#', 'E', '#', '#'],
                ['I', '#', '#', 'T', 'H', 'S', '#', 'S', '#', '#'],
                ['T', 'H', 'I', 'N', 'K', '#', 'S', 'T', 'E', 'M'],
                ['E', '#', '#', '#', '#', '#', 'Y', '#', '#', '#'],
                ['#', 'A', 'C', 'T', 'I', 'V', 'E', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', 'M', '#', '#', '#']
            ],
            solution: [
                ['B', 'R', 'A', 'I', 'N', '#', 'M', 'I', 'N', 'D'],
                ['#', 'E', '#', 'S', '#', 'F', '#', '#', '#', '#'],
                ['M', 'L', 'E', 'M', 'O', 'R', 'Y', '#', '#', '#'],
                ['E', 'A', '#', 'A', '#', 'C', '#', 'R', '#', '#'],
                ['D', 'X', '#', 'R', '#', 'U', '#', 'E', '#', '#'],
                ['I', '#', '#', 'T', 'H', 'S', '#', 'S', '#', '#'],
                ['T', 'H', 'I', 'N', 'K', '#', 'S', 'T', 'E', 'M'],
                ['E', '#', '#', '#', '#', '#', 'Y', '#', '#', '#'],
                ['#', 'A', 'C', 'T', 'I', 'V', 'E', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', 'M', '#', '#', '#']
            ],
            across: [
                { number: 1, clue: "Organ in the head that controls the body", answer: "BRAIN", row: 0, col: 0 },
                { number: 2, clue: "Consciousness and thoughts", answer: "MIND", row: 0, col: 6 },
                { number: 3, clue: "The ability to recall information", answer: "MEMORY", row: 2, col: 0 },
                { number: 4, clue: "Process of using your brain", answer: "THINK", row: 6, col: 1 },
                { number: 5, clue: "Part of the nervous system (4 letters)", answer: "STEM", row: 6, col: 6 },
                { number: 6, clue: "Engaged in physical or mental activity", answer: "ACTIVE", row: 8, col: 1 }
            ],
            down: [
                { number: 7, clue: "Practice to calm the mind", answer: "MEDITATE", row: 0, col: 0 },
                { number: 8, clue: "State of mental and physical rest", answer: "RELAX", row: 0, col: 1 },
                { number: 9, clue: "Related to intelligence or intellect", answer: "SMART", row: 0, col: 3 },
                { number: 10, clue: "Mental concentration", answer: "FOCUS", row: 0, col: 5 },
                { number: 11, clue: "Ability to recover or adapt", answer: "RESYTEM", row: 0, col: 7 }
            ]
        },
        {
            // Nature themed puzzle
            grid: [
                ['T', 'R', 'E', 'E', '#', 'S', 'K', 'Y', '#', '#'],
                ['#', 'A', '#', '#', 'O', '#', '#', '#', '#', '#'],
                ['F', 'I', 'E', 'L', 'D', '#', 'S', 'U', 'N', '#'],
                ['L', 'N', '#', '#', '#', '#', 'T', '#', '#', '#'],
                ['O', '#', 'R', 'I', 'V', 'E', 'R', '#', '#', '#'],
                ['W', '#', '#', '#', '#', '#', 'S', '#', '#', '#'],
                ['E', 'A', 'R', 'T', 'H', '#', '#', 'M', '#', '#'],
                ['R', '#', '#', '#', '#', '#', '#', 'O', '#', '#'],
                ['#', 'C', 'L', 'O', 'U', 'D', 'S', 'O', 'N', '#'],
                ['#', '#', '#', '#', '#', '#', '#', 'N', '#', '#']
            ],
            solution: [
                ['T', 'R', 'E', 'E', '#', 'S', 'K', 'Y', '#', '#'],
                ['#', 'A', '#', '#', 'O', '#', '#', '#', '#', '#'],
                ['F', 'I', 'E', 'L', 'D', '#', 'S', 'U', 'N', '#'],
                ['L', 'N', '#', '#', '#', '#', 'T', '#', '#', '#'],
                ['O', '#', 'R', 'I', 'V', 'E', 'R', '#', '#', '#'],
                ['W', '#', '#', '#', '#', '#', 'S', '#', '#', '#'],
                ['E', 'A', 'R', 'T', 'H', '#', '#', 'M', '#', '#'],
                ['R', '#', '#', '#', '#', '#', '#', 'O', '#', '#'],
                ['#', 'C', 'L', 'O', 'U', 'D', 'S', 'O', 'N', '#'],
                ['#', '#', '#', '#', '#', '#', '#', 'N', '#', '#']
            ],
            across: [
                { number: 1, clue: "Tall plant with branches", answer: "TREE", row: 0, col: 0 },
                { number: 2, clue: "Blue above us", answer: "SKY", row: 0, col: 6 },
                { number: 3, clue: "Open grassland", answer: "FIELD", row: 2, col: 0 },
                { number: 4, clue: "Bright star at center of solar system", answer: "SUN", row: 2, col: 6 },
                { number: 5, clue: "Flowing water body", answer: "RIVER", row: 4, col: 2 },
                { number: 6, clue: "Our planet", answer: "EARTH", row: 6, col: 0 },
                { number: 7, clue: "White formations in the sky", answer: "CLOUDS", row: 8, col: 1 }
            ],
            down: [
                { number: 8, clue: "Pretty garden plant", answer: "FLOWER", row: 0, col: 0 },
                { number: 9, clue: "Precipitation", answer: "RAIN", row: 0, col: 1 },
                { number: 10, clue: "Ocean", answer: "OCEAN", row: 1, col: 4 },
                { number: 11, clue: "Natural satellite", answer: "STARS", row: 0, col: 6 },
                { number: 12, clue: "Night light in sky", answer: "MOON", row: 6, col: 7 }
            ]
        },
        {
            // Animals themed puzzle
            grid: [
                ['L', 'I', 'O', 'N', '#', 'B', 'E', 'A', 'R', '#'],
                ['#', '#', '#', 'O', '#', '#', '#', 'P', '#', '#'],
                ['T', 'I', 'G', 'E', 'R', '#', 'C', 'A', 'T', '#'],
                ['#', '#', '#', 'L', '#', 'D', '#', 'N', '#', '#'],
                ['W', 'O', 'L', 'F', '#', 'O', '#', 'D', '#', '#'],
                ['#', 'W', '#', '#', '#', 'G', '#', 'A', '#', '#'],
                ['F', 'O', 'X', '#', 'O', 'W', 'L', '#', '#', '#'],
                ['#', 'L', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', 'F', 'R', 'O', 'G', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
            ],
            solution: [
                ['L', 'I', 'O', 'N', '#', 'B', 'E', 'A', 'R', '#'],
                ['#', '#', '#', 'O', '#', '#', '#', 'P', '#', '#'],
                ['T', 'I', 'G', 'E', 'R', '#', 'C', 'A', 'T', '#'],
                ['#', '#', '#', 'L', '#', 'D', '#', 'N', '#', '#'],
                ['W', 'O', 'L', 'F', '#', 'O', '#', 'D', '#', '#'],
                ['#', 'W', '#', '#', '#', 'G', '#', 'A', '#', '#'],
                ['F', 'O', 'X', '#', 'O', 'W', 'L', '#', '#', '#'],
                ['#', 'L', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', 'F', 'R', 'O', 'G', '#', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
            ],
            across: [
                { number: 1, clue: "King of the jungle", answer: "LION", row: 0, col: 0 },
                { number: 2, clue: "Large forest omnivore", answer: "BEAR", row: 0, col: 5 },
                { number: 3, clue: "Striped big cat", answer: "TIGER", row: 2, col: 0 },
                { number: 4, clue: "Common house pet", answer: "CAT", row: 2, col: 6 },
                { number: 5, clue: "Wild canine", answer: "WOLF", row: 4, col: 0 },
                { number: 6, clue: "Man's best friend", answer: "DOG", row: 4, col: 5 },
                { number: 7, clue: "Clever red mammal", answer: "FOX", row: 6, col: 1 },
                { number: 8, clue: "Night bird", answer: "OWL", row: 6, col: 5 },
                { number: 9, clue: "Black and white bear", answer: "PANDA", row: 8, col: 1 }
            ],
            down: [
                { number: 10, clue: "Big cat family", answer: "LION", row: 0, col: 0 },
                { number: 11, clue: "Forest dweller", answer: "TIGER", row: 0, col: 2 },
                { number: 12, clue: "Barking pet", answer: "DOG", row: 0, col: 7 },
                { number: 13, clue: "Hunting animal", answer: "WOLF", row: 0, col: 3 },
                { number: 14, clue: "Bamboo eater", answer: "PANDA", row: 4, col: 4 }
            ]
        },
        {
            // Food themed puzzle
            grid: [
                ['P', 'I', 'Z', 'Z', 'A', '#', 'C', 'A', 'K', 'E'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['S', 'U', 'S', 'H', 'I', '#', 'P', 'I', 'E', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', 'S', 'O', 'U', 'P', '#', 'T', 'E', 'A', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', 'R', 'I', 'C', 'E', '#', '#', '#', '#', '#'],
                ['#', 'E', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', 'A', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', 'D', '#', '#', '#', '#', '#', '#', '#', '#']
            ],
            solution: [
                ['P', 'I', 'Z', 'Z', 'A', '#', 'C', 'A', 'K', 'E'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['S', 'U', 'S', 'H', 'I', '#', 'P', 'I', 'E', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', 'S', 'O', 'U', 'P', '#', 'T', 'E', 'A', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', 'R', 'I', 'C', 'E', '#', '#', '#', '#', '#'],
                ['#', 'E', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', 'A', '#', '#', '#', '#', '#', '#', '#', '#'],
                ['#', 'D', '#', '#', '#', '#', '#', '#', '#', '#']
            ],
            across: [
                { number: 1, clue: "Italian dish with cheese and toppings", answer: "PIZZA", row: 0, col: 0 },
                { number: 2, clue: "Sweet baked dessert", answer: "CAKE", row: 0, col: 6 },
                { number: 3, clue: "Japanese raw fish dish", answer: "SUSHI", row: 2, col: 0 },
                { number: 4, clue: "Baked dessert with filling", answer: "PIE", row: 2, col: 6 },
                { number: 5, clue: "Liquid food in a bowl", answer: "SOUP", row: 4, col: 1 },
                { number: 6, clue: "Hot beverage", answer: "TEA", row: 4, col: 6 },
                { number: 7, clue: "White grain", answer: "RICE", row: 6, col: 1 }
            ],
            down: [
                { number: 8, clue: "Round Italian food", answer: "PIZZA", row: 0, col: 0 },
                { number: 9, clue: "Morning food", answer: "BREAD", row: 0, col: 1 },
                { number: 10, clue: "Sweet treat", answer: "CAKE", row: 0, col: 6 },
                { number: 11, clue: "Hot drink", answer: "TEA", row: 4, col: 6 }
            ]
        },
        {
            // Sports themed puzzle
            grid: [
                ['S', 'O', 'C', 'C', 'E', 'R', '#', 'R', 'U', 'N'],
                ['W', '#', '#', '#', '#', 'A', '#', '#', '#', 'E'],
                ['I', '#', 'T', 'E', 'N', 'N', 'I', 'S', '#', 'T'],
                ['M', '#', '#', '#', '#', 'G', '#', 'K', '#', '#'],
                ['#', 'B', 'A', 'L', 'L', '#', '#', 'I', '#', '#'],
                ['#', '#', '#', '#', '#', 'G', '#', '#', '#', '#'],
                ['#', 'J', 'U', 'M', 'P', 'O', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', 'L', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', 'F', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
            ],
            solution: [
                ['S', 'O', 'C', 'C', 'E', 'R', '#', 'R', 'U', 'N'],
                ['W', '#', '#', '#', '#', 'A', '#', '#', '#', 'E'],
                ['I', '#', 'T', 'E', 'N', 'N', 'I', 'S', '#', 'T'],
                ['M', '#', '#', '#', '#', 'G', '#', 'K', '#', '#'],
                ['#', 'B', 'A', 'L', 'L', '#', '#', 'I', '#', '#'],
                ['#', '#', '#', '#', '#', 'G', '#', '#', '#', '#'],
                ['#', 'J', 'U', 'M', 'P', 'O', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', 'L', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', 'F', '#', '#', '#', '#'],
                ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
            ],
            across: [
                { number: 1, clue: "Popular ball sport played with feet", answer: "SOCCER", row: 0, col: 0 },
                { number: 2, clue: "Athletic movement on feet", answer: "RUN", row: 0, col: 7 },
                { number: 3, clue: "Racket sport", answer: "TENNIS", row: 2, col: 0 },
                { number: 4, clue: "Club and ball sport", answer: "GOL", row: 2, col: 7 },
                { number: 5, clue: "Winter slope sport", answer: "SKI", row: 4, col: 1 },
                { number: 6, clue: "Spherical sports equipment", answer: "BALL", row: 4, col: 5 },
                { number: 7, clue: "Water sport", answer: "SWIM", row: 6, col: 1 },
                { number: 8, clue: "Up and down movement", answer: "JUMP", row: 8, col: 1 }
            ],
            down: [
                { number: 9, clue: "Team field sport", answer: "SOCCER", row: 0, col: 0 },
                { number: 10, clue: "Net sport", answer: "TENNIS", row: 0, col: 2 },
                { number: 11, clue: "Moving fast on feet", answer: "RUN", row: 0, col: 7 },
                { number: 12, clue: "Pool activity", answer: "SWIM", row: 3, col: 1 }
            ]
        }
    ];

    let crosswordData = crosswordPuzzles[0]; // Initial puzzle

    // Initialize Crossword game
    function initCrosswordGame() {
        // Reset game state
        gameStarted.crossword = false;
        // Select a random puzzle
        crosswordData = crosswordPuzzles[Math.floor(Math.random() * crosswordPuzzles.length)];

        // Reset game state
        crosswordScore = 0;
        crosswordScoreElement.textContent = crosswordScore;
        resetTimer('crossword');

        // Clear grid
        crosswordGrid.innerHTML = '';

        // Create grid cells
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const cell = document.createElement('div');
                cell.classList.add('crossword-cell');
                cell.dataset.row = row;
                cell.dataset.col = col;

                if (crosswordData.grid[row][col] === '#') {
                    cell.classList.add('black');
                } else {
                    // Add number if it's the start of a word
                    const isAcrossStart = crosswordData.across.some(word => word.row === row && word.col === col);
                    const isDownStart = crosswordData.down.some(word => word.row === row && word.col === col);

                    // Create a wrapper div for the cell content
                    const cellContent = document.createElement('div');
                    cellContent.classList.add('cell-content');
                    cellContent.contentEditable = true;
                    cell.appendChild(cellContent);

                    if (isAcrossStart || isDownStart) {
                        const number = document.createElement('span');
                        number.classList.add('number');

                        if (isAcrossStart) {
                            const acrossWord = crosswordData.across.find(word => word.row === row && word.col === col);
                            number.textContent = acrossWord.number;
                        } else if (isDownStart) {
                            const downWord = crosswordData.down.find(word => word.row === row && word.col === col);
                            number.textContent = downWord.number;
                        }

                        cell.appendChild(number);
                    }

                    cell.addEventListener('click', selectCrosswordCell);
                    cellContent.addEventListener('input', handleCrosswordInput);
                }

                crosswordGrid.appendChild(cell);
            }
        }

        // Create clues
        acrossClues.innerHTML = '';
        crosswordData.across.forEach(clue => {
            const li = document.createElement('li');
            li.classList.add('clue-item');
            li.textContent = `${clue.number}. ${clue.clue}`;
            li.dataset.direction = 'across';
            li.dataset.number = clue.number;
            li.addEventListener('click', selectClue);
            acrossClues.appendChild(li);
        });

        downClues.innerHTML = '';
        crosswordData.down.forEach(clue => {
            const li = document.createElement('li');
            li.classList.add('clue-item');
            li.textContent = `${clue.number}. ${clue.clue}`;
            li.dataset.direction = 'down';
            li.dataset.number = clue.number;
            li.addEventListener('click', selectClue);
            downClues.appendChild(li);
        });

        // Start timer
        startTimer('crossword');
    }

    // Pause Crossword timer
    // Pause button handler is managed by the central timer system

    // Select a Crossword cell
    function selectCrosswordCell(e) {
        // Start timer on first interaction
        handleFirstInteraction('crossword');

        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);

        // Remove previous selection
        document.querySelectorAll('.crossword-cell.active').forEach(cell => {
            cell.classList.remove('active');
        });

        // Select new cell
        e.target.classList.add('active');

        // Find which word this cell belongs to
        const acrossWord = crosswordData.across.find(word =>
            row === word.row && col >= word.col && col < word.col + word.answer.length
        );

        const downWord = crosswordData.down.find(word =>
            col === word.col && row >= word.row && row < word.row + word.answer.length
        );

        if (acrossWord && downWord) {
            // Cell belongs to both across and down words
            // Prioritize the current direction if set
            if (selectedDirection === 'across') {
                selectedWord = acrossWord;
                selectedDirection = 'across';
            } else if (selectedDirection === 'down') {
                selectedWord = downWord;
                selectedDirection = 'down';
            } else {
                // Default to across
                selectedWord = acrossWord;
                selectedDirection = 'across';
            }
        } else if (acrossWord) {
            selectedWord = acrossWord;
            selectedDirection = 'across';
        } else if (downWord) {
            selectedWord = downWord;
            selectedDirection = 'down';
        }

        // Highlight selected clue
        document.querySelectorAll('.clue-item.active').forEach(clue => {
            clue.classList.remove('active');
        });

        if (selectedWord) {
            const clueElement = document.querySelector(
                `.clue-item[data-direction="${selectedDirection}"][data-number="${selectedWord.number}"]`
            );
            if (clueElement) {
                clueElement.classList.add('active');
            }
        }
    }

    // Select a clue
    function selectClue(e) {
        const direction = e.target.dataset.direction;
        const number = parseInt(e.target.dataset.number);

        // Remove previous selection
        document.querySelectorAll('.clue-item.active').forEach(clue => {
            clue.classList.remove('active');
        });

        // Select new clue
        e.target.classList.add('active');

        // Find the word
        if (direction === 'across') {
            selectedWord = crosswordData.across.find(word => word.number === number);
        } else {
            selectedWord = crosswordData.down.find(word => word.number === number);
        }

        selectedDirection = direction;

        // Highlight the first cell of the word
        document.querySelectorAll('.crossword-cell.active').forEach(cell => {
            cell.classList.remove('active');
        });

        if (selectedWord) {
            const firstCell = document.querySelector(
                `.crossword-cell[data-row="${selectedWord.row}"][data-col="${selectedWord.col}"]`
            );
            if (firstCell) {
                firstCell.classList.add('active');
                firstCell.focus();
            }
        }
    }

    // Handle input in Crossword cells
    function handleCrosswordInput(e) {
        const cell = e.target.parentElement;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const value = e.target.textContent.toUpperCase();

        // Only allow letters
        if (!/^[A-Z]*$/.test(value)) {
            e.target.textContent = '';
            return;
        }

        // Ensure only one letter
        if (value.length > 1) {
            e.target.textContent = value.charAt(0);
            return;
        }

        // Update the grid data
        crosswordData.grid[row][col] = value;

        // Check if the letter is correct
        if (value === crosswordData.solution[row][col]) {
            e.target.classList.add('correct');
            crosswordScore += 5;
            crosswordScoreElement.textContent = crosswordScore;
        } else {
            e.target.classList.remove('correct');
        }

        // Move to next cell
        if (selectedWord && value) {
            if (selectedDirection === 'across') {
                const nextCol = col + 1;
                if (nextCol < selectedWord.col + selectedWord.answer.length) {
                    const nextCell = document.querySelector(
                        `.crossword-cell[data-row="${row}"][data-col="${nextCol}"]`
                    );
                    if (nextCell) {
                        nextCell.classList.add('active');
                        nextCell.focus();
                    }
                }
            } else if (selectedDirection === 'down') {
                const nextRow = row + 1;
                if (nextRow < selectedWord.row + selectedWord.answer.length) {
                    const nextCell = document.querySelector(
                        `.crossword-cell[data-row="${nextRow}"][data-col="${col}"]`
                    );
                    if (nextCell) {
                        nextCell.classList.add('active');
                        nextCell.focus();
                    }
                }
            }
        }

        // Check if puzzle is complete
        if (isCrosswordComplete()) {
            stopTimer('crossword');
            // Calculate score based on time taken
            crosswordScore += Math.max(100 - Math.floor(gameTimers.crossword.seconds / 10), 10);
            crosswordScoreElement.textContent = crosswordScore;
            showMessage('Congratulations! You solved the crossword!', 'success');
        }
    }

    // Check if Crossword is complete
    function isCrosswordComplete() {
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                if (crosswordData.grid[row][col] !== '#' &&
                    crosswordData.grid[row][col] !== crosswordData.solution[row][col]) {
                    return false;
                }
            }
        }
        return true;
    }

    // New Crossword button
    newCrosswordBtn.addEventListener('click', initCrosswordGame);

    // Check Crossword button
    checkCrosswordBtn.addEventListener('click', () => {
        let errors = 0;
        document.querySelectorAll('.crossword-cell:not(.black)').forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const value = cell.textContent.toUpperCase();

            if (value && value !== crosswordData.solution[row][col]) {
                cell.classList.remove('correct');
                errors++;
            } else if (value === crosswordData.solution[row][col]) {
                cell.classList.add('correct');
            }
        });

        if (errors === 0) {
            showMessage('No errors found! Keep going!', 'success');
        } else {
            showMessage(`Found ${errors} error${errors > 1 ? 's' : ''}`, 'error');
        }
    });

    // Reveal Crossword button
    revealCrosswordBtn.addEventListener('click', () => {
        document.querySelectorAll('.crossword-cell:not(.black)').forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const cellContent = cell.querySelector('.cell-content');
            if (cellContent) {
                cellContent.textContent = crosswordData.solution[row][col];
            }
            cell.classList.add('correct');
        });

        clearInterval(crosswordTimer);
        showMessage('Answers revealed!', 'success');
    });

    // Initialize Crossword game
    initCrosswordGame();

    // ==================== MEMORY PAIRS GAME ====================
    const memoryGrid = document.getElementById('memory-grid');
    const memoryScoreElement = document.getElementById('memory-score');
    const memoryMovesElement = document.getElementById('memory-moves');
    const newMemoryBtn = document.getElementById('new-memory-btn');
    const hintMemoryBtn = document.getElementById('hint-memory-btn');

    let memoryScore = 0;
    let memoryMoves = 0;
    let flippedCards = [];
    let matchedPairs = 0;
    let canFlip = true;

    // Enhanced Memory card emojis with more variety
    const cardEmojis = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍒', '🍑', '🥭', '🍍', '🥝', '🍉', '🍋'];

    // Memory game difficulty settings
    const memoryDifficulties = {
        easy: { gridCols: 4, gridRows: 4, pairs: 8 },     // 4x4 grid = 16 cards = 8 pairs
        medium: { gridCols: 5, gridRows: 4, pairs: 10 },  // 5x4 grid = 20 cards = 10 pairs
        hard: { gridCols: 6, gridRows: 4, pairs: 12 }     // 6x4 grid = 24 cards = 12 pairs
    };

    let currentMemoryDifficulty = 'easy';

    // Initialize Memory game
    function initMemoryGame() {
        // Reset game state
        gameStarted.memory = false;
        memoryScore = 0;
        memoryScoreElement.textContent = memoryScore;
        memoryMoves = 0;
        memoryMovesElement.textContent = memoryMoves;
        matchedPairs = 0;
        flippedCards = [];
        canFlip = true;
        resetTimer('memory');

        // Clear grid and set difficulty
        memoryGrid.innerHTML = '';
        memoryGrid.setAttribute('data-difficulty', currentMemoryDifficulty);

        const difficulty = memoryDifficulties[currentMemoryDifficulty];
        const gridSize = difficulty.grid;
        const numPairs = difficulty.pairs;

        // Set grid layout
        memoryGrid.style.gridTemplateColumns = `repeat(${difficulty.gridCols}, 1fr)`;
        memoryGrid.style.gridTemplateRows = `repeat(${difficulty.gridRows}, 1fr)`;

        // Create card pairs
        const selectedEmojis = cardEmojis.slice(0, numPairs);
        const cards = [...selectedEmojis, ...selectedEmojis];

        // Shuffle cards
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }

        // Create card elements
        cards.forEach((emoji, index) => {
            if (emoji === 'blank') {
                const blankCard = document.createElement('div');
                blankCard.classList.add('memory-card', 'blank-card');
                memoryGrid.appendChild(blankCard);
            } else {
                const card = document.createElement('div');
                card.classList.add('memory-card');
                card.dataset.emoji = emoji;
                card.dataset.index = index;

                const front = document.createElement('div');
                front.classList.add('memory-card-front');
                front.innerHTML = '<i class="fas fa-question"></i>';

                const back = document.createElement('div');
                back.classList.add('memory-card-back');
                back.textContent = emoji;

                card.appendChild(front);
                card.appendChild(back);

                card.addEventListener('click', flipMemoryCard);

                memoryGrid.appendChild(card);
            }
        });
    }

    // Timer functionality is handled by the central timer system

    // Flip a Memory card
    function flipMemoryCard(e) {
        if (!canFlip || gameTimers.memory.paused) return;

        if (gameTimers.memory.paused) {
            showMessage('Game is paused!', 'error');
            return;
        }

        // Start timer on first interaction
        handleFirstInteraction('memory');

        const card = e.currentTarget;

        // Ignore if already flipped or matched
        if (card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }

        // Flip the card
        card.classList.add('flipped');
        flippedCards.push(card);

        // Check if two cards are flipped
        if (flippedCards.length === 2) {
            canFlip = false;
            memoryMoves++;
            memoryMovesElement.textContent = memoryMoves;

            const [card1, card2] = flippedCards;

            // Check if cards match
            if (card1.dataset.emoji === card2.dataset.emoji) {
                // Match found
                setTimeout(() => {
                    card1.classList.add('matched');
                    card2.classList.add('matched');
                    matchedPairs++;
                    memoryScore += 50;
                    memoryScoreElement.textContent = memoryScore;

                    // Check if all pairs are matched
                    const totalPairs = memoryDifficulties[currentMemoryDifficulty].pairs;
                    if (matchedPairs === totalPairs) {
                        stopTimer('memory');
                        // Calculate score based on time, moves, and difficulty
                        const timeBonus = Math.max(100 - Math.floor(gameTimers.memory.seconds / 5), 10);
                        const minMoves = totalPairs * 2; // Minimum possible moves for perfect play
                        const moveBonus = Math.max(100 - (memoryMoves - minMoves) * 5, 10);
                        // Add difficulty bonus
                        const difficultyBonus = currentMemoryDifficulty === 'easy' ? 50 :
                            currentMemoryDifficulty === 'medium' ? 100 : 150;
                        memoryScore += timeBonus + moveBonus + difficultyBonus;
                        memoryScoreElement.textContent = memoryScore;
                        showMessage(`Congratulations! You completed ${currentMemoryDifficulty} difficulty!`, 'success');
                    }

                    flippedCards = [];
                    canFlip = true;
                }, 500);

                // Update difficulty buttons
                document.querySelectorAll('.difficulty-btn').forEach(btn => {
                    btn.addEventListener('click', function () {
                        const level = this.dataset.level;
                        currentMemoryDifficulty = level;

                        // Update active button
                        document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                        this.classList.add('active');

                        // Start new game with selected difficulty
                        initMemoryGame();
                    });
                });
            } else {
                // No match
                setTimeout(() => {
                    card1.classList.remove('flipped');
                    card2.classList.remove('flipped');
                    flippedCards = [];
                    canFlip = true;
                }, 1000);
            }
        }
    }

    // Difficulty selection
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            // Update difficulty
            currentMemoryDifficulty = this.dataset.level;

            // Update active button
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Start new game with selected difficulty
            initMemoryGame();
        });
    });

    // New Memory game button
    newMemoryBtn.addEventListener('click', initMemoryGame);

    // Hint Memory button
    hintMemoryBtn.addEventListener('click', () => {
        if (gameTimers.memory.paused) {
            showMessage('Game is paused!', 'error');
            return;
        }

        // Show all cards for 3 seconds
        document.querySelectorAll('.memory-card:not(.matched)').forEach(card => {
            card.classList.add('flipped');
        });

        canFlip = false;

        setTimeout(() => {
            document.querySelectorAll('.memory-card:not(.matched)').forEach(card => {
                card.classList.remove('flipped');
            });
            canFlip = true;
        }, 3000);

        // Penalty for using hint
        memoryScore = Math.max(0, memoryScore - 30);
        memoryScoreElement.textContent = memoryScore;
    });

    // Initialize Memory game
    initMemoryGame();
});