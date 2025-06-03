let m = 150;
let NUM_RIVERS = 4;
let MAX_BRANCHES = 20;
let PROB_TREE = 0.7;
let cellSize = 5;

let windDirection = 'S';
let windSpeed = 10;
let humidity = 40;
let temperature = 25;

const TREE_TYPES = {
  Pino: { color: [34, 139, 34], flammability: 0.8 },
  Roble: { color: [60, 179, 113], flammability: 0.5 },
  Abeto: { color: [0, 100, 0], flammability: 0.7 },
  Sauce: { color: [107, 142, 35], flammability: 0.6 },
};

let grid = [];
let currentBranches = 0;
let canvas;

class Cell {
  constructor(x, y, type, subtype = null) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.subtype = subtype;
    this.flammability = this.getFlammability();
    this.color = this.getColor();
  }

  getFlammability() {
    if (this.type === 'water' || this.type === 'soil') return 0;
    return TREE_TYPES[this.subtype].flammability;
  }

  getColor() {
    if (this.type === 'water') return color(0, 100, 255);
    if (this.type === 'soil') return color(180, 120, 60);
    return color(...TREE_TYPES[this.subtype].color);
  }

  draw(size) {
    stroke(0);
    strokeWeight(0.5);
    fill(this.color);
    rect(this.x * size, this.y * size, size, size);
  }
}

// Formulario de parámetros
document.getElementById('forestForm').addEventListener('submit', (e) => {
  e.preventDefault();
  NUM_RIVERS = parseInt(forestForm.numRivers.value) || 4;
  PROB_TREE = parseFloat(forestForm.probTree.value) || 0.7;
  m = parseInt(forestForm.mapSize.value) || 150;
  resizeCanvas(m * cellSize, m * cellSize);
  generateForest();
});

document.getElementById('simForm').addEventListener('submit', (e) => {
  e.preventDefault();
  windDirection = simForm.windDirection.value;
  windSpeed = parseFloat(simForm.windSpeed.value) || 10;
  humidity = parseFloat(simForm.humidity.value) || 40;
  temperature = parseFloat(simForm.temperature.value) || 25;
  console.log('Simulación iniciada con:', windDirection, windSpeed, humidity, temperature);
});

function setup() {
  canvas = createCanvas(m * cellSize, m * cellSize);
  canvas.parent('canvas-container');
  noStroke();
  generateForest();
}

function draw() {
  background(20);
  for (let y = 0; y < m; y++) {
    for (let x = 0; x < m; x++) {
      grid[y][x].draw(cellSize);
    }
  }
}

function generateForest() {
  currentBranches = 0;
  grid = Array.from({ length: m }, (_, y) =>
    Array.from({ length: m }, (_, x) => new Cell(x, y, 'soil'))
  );

  generateRiverSystem();

  for (let y = 0; y < m; y++) {
    for (let x = 0; x < m; x++) {
      if (grid[y][x].type === 'soil') {
        if (random() < PROB_TREE) {
          const treeType = random(Object.keys(TREE_TYPES));
          grid[y][x] = new Cell(x, y, 'tree', treeType);
        }
      }
    }
  }
}

function generateRiverSystem() {
  for (let i = 0; i < NUM_RIVERS; i++) {
    const startX = floor(random(m * 0.2, m * 0.8));
    growRiver(startX, 0, 0);
  }
}

function growRiver(x, y, depth) {
  const MAX_DEPTH = m * 1.5;
  if (x < 0 || x >= m || y < 0 || y >= m || depth > MAX_DEPTH) return;
  if (grid[y][x].type === 'water') return;

  grid[y][x] = new Cell(x, y, 'water');

  const dx = random() < 0.4 ? -1 : random() > 0.6 ? 1 : 0;
  const newX = constrain(x + dx, 0, m - 1);
  const newY = y + 1;

  if (random() < 0.1 && depth > 5 && currentBranches < MAX_BRANCHES) {
    const branchDir = random([-1, 1]);
    currentBranches++;
    growRiver(constrain(x + branchDir, 0, m - 1), y, 0);
  }

  growRiver(newX, newY, depth + 1);
}


