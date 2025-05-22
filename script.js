const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const gridSize = 20; // 20 x 20 Kästchen
const cellSize = canvas.width / gridSize;

// Nur Pixel im inneren Bereich (1–18)
const validPixels = [];
for (let y = 1; y < gridSize - 1; y++) {
  for (let x = 1; x < gridSize - 1; x++) {
    validPixels.push({ x, y });
  }
}

// 10 zufällige eigene Pixel
const ownPixels = [];
while (ownPixels.length < 10) {
  const rand = validPixels[Math.floor(Math.random() * validPixels.length)];
  if (!ownPixels.find(p => p.x === rand.x && p.y === rand.y)) {
    ownPixels.push(rand);
  }
}

// Farben-Map (x_y → Farbe)
const pixelColors = {};

// Zeichenfunktion für das Raster
function drawGrid() {
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      ctx.strokeStyle = "#eee";
      ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }
}

// Eigene Pixel hervorheben
function drawOwnPixels() {
  ownPixels.forEach(p => {
    ctx.fillStyle = "#f0f8ff"; // hellblauer Hintergrund
    ctx.fillRect(p.x * cellSize, p.y * cellSize, cellSize, cellSize);
    ctx.strokeRect(p.x * cellSize, p.y * cellSize, cellSize, cellSize);
  });
}

// Farben einzeichnen
function drawColors() {
  for (const key in pixelColors) {
    const [x, y] = key.split("_").map(Number);
    ctx.fillStyle = pixelColors[key];
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
  }
}

// Gesamte Zeichenlogik
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawOwnPixels();
  drawColors();
}

// Klick → prüfen ob Pixel dir gehört → Farbe setzen
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / cellSize);
  const y = Math.floor((e.clientY - rect.top) / cellSize);

  const isOwn = ownPixels.some(p => p.x === x && p.y === y);
  if (isOwn) {
    const color = prompt("Welche Farbe? (z. B. red, blue, #ff00ff)");
    if (color) {
      pixelColors[`${x}_${y}`] = color;
      draw();
    }
  }
});

draw(); // Initiales Zeichnen
