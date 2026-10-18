// The lab maze: # is a wall, . is a path, S is the start, E is the exit
const MAZE = [
  "###############",
  "#S....#.......#",
  "#.###.#.#####.#",
  "#.#...#.#...#.#",
  "#.#.###.#.#.#.#",
  "#.#.....#.#...#",
  "#.#######.#####",
  "#.......#.....#",
  "#######.#####.#",
  "#.....#.....#.#",
  "#.###.#####.#.#",
  "#.#.......#.#.#",
  "#.#.#####.#.#.#",
  "#...#...#...#E#",
  "###############",
];

// Where the cyborg is now and whether the player has escaped yet
const player = { row: 0, col: 0 };
let won = false;

// Page elements the game needs to talk to
const mazeEl = document.getElementById("maze");
const overlayEl = document.getElementById("win-overlay");
const playAgainBtn = document.getElementById("play-again");

// The grid squares, stored in the same order as the MAZE rows and columns
const cells = [];

// Find the S square in the maze and put the cyborg there
function moveToStart() {
  for (let row = 0; row < MAZE.length; row++) {
    const col = MAZE[row].indexOf("S");
    if (col !== -1) {
      player.row = row;
      player.col = col;
      return;
    }
  }
}

// Build one coloured square on the page for every character in MAZE
function buildMaze() {
  for (let row = 0; row < MAZE.length; row++) {
    cells.push([]);
    for (let col = 0; col < MAZE[row].length; col++) {
      const cell = document.createElement("div");
      const symbol = MAZE[row][col];
      cell.className = "cell " + (symbol === "#" ? "wall" : symbol === "E" ? "exit" : "path");
      mazeEl.appendChild(cell);
      cells[row].push(cell);
    }
  }
}

// Show the cyborg on whichever square it is standing on and remove it from the others
function drawPlayer() {
  for (const rowCells of cells) {
    for (const cell of rowCells) {
      cell.classList.remove("cyborg");
    }
  }
  cells[player.row][player.col].classList.add("cyborg");
}

// Show the "You escaped!" message once the cyborg stands on the exit
function checkWin() {
  if (MAZE[player.row][player.col] === "E") {
    won = true;
    overlayEl.hidden = false;
    playAgainBtn.focus();
  }
}

// Move the cyborg one square if the way is clear, otherwise do nothing
function tryMove(rowStep, colStep) {
  if (won) {
    return;
  }
  const newRow = player.row + rowStep;
  const newCol = player.col + colStep;
  const inside = newRow >= 0 && newRow < MAZE.length && newCol >= 0 && newCol < MAZE[newRow].length;
  if (!inside || MAZE[newRow][newCol] === "#") {
    return;
  }
  player.row = newRow;
  player.col = newCol;
  drawPlayer();
  checkWin();
}

// Put the cyborg back on the start square and hide the win message
function resetGame() {
  won = false;
  overlayEl.hidden = true;
  moveToStart();
  drawPlayer();
}

// How each direction changes the row and column
const DIRECTIONS = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

// Arrow keys: one square per key press, and stop the page from scrolling
document.addEventListener("keydown", (event) => {
  const direction = DIRECTIONS[event.key.replace("Arrow", "").toLowerCase()];
  if (!event.key.startsWith("Arrow") || !direction) {
    return;
  }
  event.preventDefault();
  if (event.repeat) {
    return;
  }
  tryMove(direction[0], direction[1]);
});

// On-screen arrow buttons for mobile do the same thing as the keys
document.querySelectorAll("#dpad .arrow").forEach((button) => {
  button.addEventListener("click", () => {
    const direction = DIRECTIONS[button.dataset.dir];
    tryMove(direction[0], direction[1]);
  });
});

// Play again button starts the maze over
playAgainBtn.addEventListener("click", resetGame);

// Start the game: build the maze, place the cyborg on S and draw it
buildMaze();
moveToStart();
drawPlayer();
