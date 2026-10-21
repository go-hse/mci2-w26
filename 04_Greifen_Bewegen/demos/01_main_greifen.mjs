// 01_main_greifen.mjs — Greifen ohne Sprung: L = T(Zeiger) · P
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// U-Form, lokal um (0, 0), Einheit 1
const U = new Path2D('M -2 -2 L -2 2 L -1 2 L -1 -1 L 1 -1 L 1 2 L 2 2 L 2 -2 Z');

const figur = {
    m: new DOMMatrix().translate(400, 225).rotate(-20).scale(40),
};
let griff = null;              // { id, p, pos }

// Zeiger ins lokale System, dann Pfad testen
function getroffen(pos) {
    const lokal = figur.m.inverse().transformPoint(pos);
    ctx.resetTransform();
    return ctx.isPointInPath(U, lokal.x, lokal.y);
}

canvas.addEventListener('pointerdown', (e) => {
    const pos = { x: e.offsetX, y: e.offsetY };
    if (griff || !getroffen(pos)) return;
    const T = new DOMMatrix().translate(pos.x, pos.y);
    // Griff merken: P = T⁻¹ · L (Figur relativ zum Zeiger)
    const p = T.inverse().multiply(figur.m);
    griff = { id: e.pointerId, p, pos };
    canvas.setPointerCapture(e.pointerId);  // auch außerhalb
});

canvas.addEventListener('pointermove', (e) => {
    if (!griff || e.pointerId !== griff.id) return;
    griff.pos = { x: e.offsetX, y: e.offsetY };
    const T = new DOMMatrix().translate(griff.pos.x, griff.pos.y);
    figur.m = T.multiply(griff.p);           // L = T(neu) · P
});

function loslassen(e) {
    if (griff && e.pointerId === griff.id) griff = null;
}
canvas.addEventListener('pointerup', loslassen);
canvas.addEventListener('pointercancel', loslassen);

function loop() {
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(figur.m);
    ctx.fillStyle = griff ? '#b6163d' : '#00aadc';
    ctx.fill(U);
    ctx.resetTransform();
    if (griff) {  // Griffpunkt markieren
        const p = griff.pos;
        ctx.fillStyle = '#193058';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI);
        ctx.fill();
    }
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
