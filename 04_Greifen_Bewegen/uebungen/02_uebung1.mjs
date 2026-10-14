// 02_uebung1.mjs — Übung 1: mehrere Finger (Vorlage)
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const U = new Path2D(
    'M -2 -2 L -2 2 L -1 2 L -1 -1 L 1 -1 L 1 2 L 2 2 L 2 -2 Z');
function figur(x, y, winkel, s, farbe) {
    const m = new DOMMatrix().translate(x, y).rotate(winkel).scale(s);
    return { m, farbe };
}
const figuren = [
    figur(200, 230, -15, 35, '#00aadc'),
    figur(400, 200, 20, 45, '#193058'),
    figur(600, 250, 0, 30, '#7fd3ec'),
];
let griff = null;     // bisher nur EIN Griff: { figur, p }

function getroffen(figur, pos) {
    const lokal = figur.m.inverse().transformPoint(pos);
    ctx.resetTransform();
    return ctx.isPointInPath(U, lokal.x, lokal.y);
}

canvas.addEventListener('pointerdown', (e) => {
    const pos = { x: e.offsetX, y: e.offsetY };
    // TODO 1: von oben nach unten suchen (z-Order) und die
    //         getroffene Figur ans Ende der Liste holen
    const figur = figuren.find((f) => getroffen(f, pos));
    if (!figur) return;
    const T = new DOMMatrix().translate(pos.x, pos.y);
    // TODO 2: Griffe je pointerId in einer Map speichern
    griff = { figur, p: T.inverse().multiply(figur.m) };
    canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener('pointermove', (e) => {
    // TODO 3: den Griff dieses Zeigers verwenden
    if (!griff) return;
    const T = new DOMMatrix().translate(e.offsetX, e.offsetY);
    griff.figur.m = T.multiply(griff.p);
});

function loslassen(e) {
    // TODO 4: nur den Griff dieses Zeigers entfernen
    griff = null;
}
canvas.addEventListener('pointerup', loslassen);
canvas.addEventListener('pointercancel', loslassen);

function loop() {
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const f of figuren) {
        ctx.setTransform(f.m);
        ctx.fillStyle = f.farbe;
        ctx.fill(U);
    }
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
