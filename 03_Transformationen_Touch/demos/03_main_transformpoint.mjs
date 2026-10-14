// 03_main_transformpoint.mjs — Punkte lokal → Welt
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const m = new DOMMatrix()
    .translate(300, 200).rotate(30).scale(1.5);
// Ecken im lokalen System
const ecken = [[-80, -40], [80, -40], [80, 40], [-80, 40]];

ctx.setTransform(m);  // Rechteck lokal zeichnen
ctx.fillStyle = '#00aadc';
ctx.fillRect(-80, -40, 160, 80);

ctx.resetTransform();  // Marker im Weltsystem
ctx.fillStyle = '#b6163d';
ctx.font = '16px monospace';
for (const [x, y] of ecken) {
    const p = m.transformPoint({ x, y });  // → DOMPoint
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI);
    ctx.fill();
    const text = `(${p.x.toFixed(0)}, ${p.y.toFixed(0)})`;
    ctx.fillText(text, p.x + 10, p.y - 8);
}
