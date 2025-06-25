const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const gridSize = 10; // 10x10 Felder
const pixelSize = 400 / gridSize; // Jedes Feld ist 40x40 Pixel

let myPixelIndices = []; // Hier speichert der Server deine zugewiesenen Felder
let pixelColors = Array(gridSize * gridSize).fill(null); // Farben aller Felder

// Zeichnet das Spielfeld
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const index = y * gridSize + x;
      // Wenn Feld gefärbt, dann diese Farbe
      if (pixelColors[index]) {
        ctx.fillStyle = pixelColors[index];
      // Wenn Feld dir zugewiesen, dann grau
      } else if (myPixelIndices.includes(index)) {
        ctx.fillStyle = "#e0e0e0";
      // Sonst weiß
      } else {
        ctx.fillStyle = "#fff";
      }
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      ctx.strokeStyle = "#ccc";
      ctx.strokeRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }
}

// Neustart-Button: Setzt alle Pixel auf leer (nur lokal!)
document.getElementById('resetBtn').addEventListener('click', function () {
  pixelColors = Array(gridSize * gridSize).fill(null);
  drawGrid();
});

// Wenn du auf ein Feld klickst
canvas.addEventListener('click', function (event) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / pixelSize);
  const y = Math.floor((event.clientY - rect.top) / pixelSize);
  const index = y * gridSize + x;
  const errorMsg = document.getElementById('errorMsg');
  if (myPixelIndices.includes(index)) {
    pixelColors[index] = colorPicker.value;
    drawGrid();
    sendRequest('color', index, colorPicker.value);
    errorMsg.textContent = "";
  } else {
    errorMsg.textContent = "Das ist nicht dein Kästchen!";
    setTimeout(() => errorMsg.textContent = "", 1500);
  }
});

// WebSocket-Verbindung zum Server
const socket = new WebSocket('wss://nosch.uber.space/web-rooms/');

// Hilfsfunktion zum Senden von Nachrichten
function sendRequest(...message) {
  socket.send(JSON.stringify(message));
}

// Wenn Verbindung steht, Raum betreten
socket.addEventListener('open', () => {
  sendRequest('*enter-room*', 'CollectivePixel');
});

// Nachrichten vom Server verarbeiten
socket.addEventListener('message', (event) => {
  const incoming = JSON.parse(event.data);
  console.log('Nachricht vom Server:', incoming);
  const selector = incoming[0];
  switch (selector) {
    case 'init':
      myPixelIndices = incoming[1]; // Deine Felder
      pixelColors = incoming[2];    // Alle Farben
      drawGrid();
      break;
    case 'color':
      const index = incoming[1];
      const color = incoming[2];
      pixelColors[index] = color;
      drawGrid();
      break;
  }
});

// Canvas-Größe fest einstellen und zeichnen
canvas.width = 400;
canvas.height = 400;
drawGrid();
