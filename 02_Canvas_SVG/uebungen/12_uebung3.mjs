// 12_uebung3.mjs — Übung 3: Herzen anklicken (Vorlage)
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const HERZ = new Path2D(
    'M 0 -10 C 0 -30 -35 -30 -35 -5 C -35 20 0 30 0 45 ' +
    'C 0 30 35 20 35 -5 C 35 -30 0 -30 0 -10 Z');

const herzen = [
    { x: 170, y: 170, farbe: '#00aadc' },
    { x: 250, y: 200, farbe: '#193058' },
    { x: 330, y: 170, farbe: '#00aadc' },
    { x: 460, y: 200, farbe: '#193058' },
];

function setzeTransform(h) {
    // verschieben und doppelt so groß
    ctx.setTransform(2, 0, 0, 2, h.x, h.y);
}

function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const h of herzen) {
        setzeTransform(h);
        ctx.fillStyle = h.farbe;
        ctx.fill(HERZ);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}
draw();

canvas.addEventListener('pointerdown', (e) => {
    // TODO 1: das OBERSTE Herz unter (e.offsetX, e.offsetY)
    //         finden: Transformation des Herzens setzen,
    //         dann isPointInPath(HERZ, …)
    // TODO 2: Farbe auf '#b6163d', Herz nach vorn holen
    // TODO 3: Transformation zurücksetzen und neu zeichnen
});
