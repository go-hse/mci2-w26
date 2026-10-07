// main.mjs 
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Hintergrund 
ctx.fillStyle = '#f0f0f0';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Ein Rechteck: x, y, Breite, Höhe 
ctx.fillStyle = '#00aadc';
ctx.fillRect(50, 50, 200, 120);

// Text 
ctx.fillStyle = '#193058';
ctx.font = '32px sans-serif';
ctx.fillText('Hallo Canvas!', 50, 240);
