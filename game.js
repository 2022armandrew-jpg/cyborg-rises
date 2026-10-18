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

// How many batteries are hidden in the maze each game
const BATTERY_COUNT = 3;

// Where the cyborg is now and whether the player has escaped yet
const player = { row: 0, col: 0 };
let won = false;

// Batteries still lying in the maze, and how many the cyborg has picked up
let batteries = [];
let collected = 0;

// Page elements the game needs to talk to
const mazeEl = document.getElementById("maze");
const cyborgEl = document.getElementById("cyborg");
const counterEl = document.getElementById("battery-count");
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

// Move the cyborg on screen to the square it is standing on
function drawPlayer() {
  cyborgEl.style.top = (player.row * 100) / MAZE.length + "%";
  cyborgEl.style.left = (player.col * 100) / MAZE[0].length + "%";
}

// Show the current battery total above the maze
function updateCounter() {
  counterEl.textContent = "Batteries: " + collected + " / " + BATTERY_COUNT;
}

// Remove any old batteries, then drop new ones on random path squares (never on S or E)
function placeBatteries() {
  for (const battery of batteries) {
    cells[battery.row][battery.col].classList.remove("battery");
  }
  const freeSquares = [];
  for (let row = 0; row < MAZE.length; row++) {
    for (let col = 0; col < MAZE[row].length; col++) {
      if (MAZE[row][col] === ".") {
        freeSquares.push({ row, col });
      }
    }
  }
  // Shuffle the free squares so the first few are a random pick
  for (let i = freeSquares.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [freeSquares[i], freeSquares[j]] = [freeSquares[j], freeSquares[i]];
  }
  batteries = freeSquares.slice(0, BATTERY_COUNT);
  for (const battery of batteries) {
    cells[battery.row][battery.col].classList.add("battery");
  }
}

// Play the electric pulse on the cyborg, restarting it if one is already playing
function pulseCyborg() {
  cyborgEl.classList.remove("pulse");
  void cyborgEl.offsetWidth;
  cyborgEl.classList.add("pulse");
}

// If the cyborg is standing on a battery, pick it up, count it and pulse
function pickUpBattery() {
  const index = batteries.findIndex((b) => b.row === player.row && b.col === player.col);
  if (index === -1) {
    return;
  }
  cells[player.row][player.col].classList.remove("battery");
  batteries.splice(index, 1);
  collected++;
  updateCounter();
  pulseCyborg();
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
  pickUpBattery();
  checkWin();
}

// Put the cyborg back on the start square, scatter fresh batteries and hide the win message
function resetGame() {
  won = false;
  overlayEl.hidden = true;
  collected = 0;
  updateCounter();
  placeBatteries();
  cyborgEl.classList.remove("pulse");
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

// Start the game: build the maze, then set up batteries and the cyborg on S
buildMaze();
resetGame();
