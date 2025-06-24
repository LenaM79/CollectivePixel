const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const webRoomsWebSocketServerAddr = 'wss://nosch.uber.space/web-rooms/';

const gridSize = 10;

let myPixelIndices = [];
let pixelColors = Array(gridSize * gridSize).fill(null);

// Hilfsfunktion für WebSocket-Kommunikation
function sendRequest(...message) {
  const str = JSON.stringify(message);
  socket.send(str);
}

// Canvas-Größe anpassen
function CanvasSize() {
  const size = 400;
  canvas.width = size;
  canvas.height = size;
  pixelSize = size / gridSize;
  drawGrid();
}

window.addEventListener('resize', CanvasSize);

// Grid zeichnen
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const index = y * gridSize + x;
      if (pixelColors[index]) {
        ctx.fillStyle = pixelColors[index];
      } else if (myPixelIndices.includes(index)) {
        ctx.fillStyle = "#e0e0e0"; // Deine zugewiesenen Pixel
      } else {
        ctx.fillStyle = "#fff";
      }
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      ctx.strokeStyle = "#ccc";
      ctx.strokeRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }
}

// Pixel färben und an Server schicken
canvas.addEventListener('click', function (event) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / pixelSize);
  const y = Math.floor((event.clientY - rect.top) / pixelSize);
  const index = y * gridSize + x;
  if (myPixelIndices.includes(index)) {
    pixelColors[index] = colorPicker.value;
    drawGrid();
    sendRequest('color', index, colorPicker.value);
  }
});

// WebSocket-Verbindung zum Server herstellen
const socket = new WebSocket(webRoomsWebSocketServerAddr);

socket.addEventListener('open', () => {
  sendRequest('*enter-room*', 'collective-pixel');
});

socket.addEventListener('message', (event) => {
  const data = event.data;
  if (data.length > 0) {
    const incoming = JSON.parse(data);
    const selector = incoming[0];

    switch (selector) {
      case 'init':
        myPixelIndices = incoming[1]; // Deine zugewiesenen Pixel (Array von Indizes)
        pixelColors = incoming[2];    // Aktueller Stand aller Pixel (Array)
        drawGrid();
        break;
      case 'color':
        const index = incoming[1];
        const color = incoming[2];
        pixelColors[index] = color;
        drawGrid();
        break;
      // Weitere Fälle nach Bedarf
    }
  }
});

updateCanvasSize();
