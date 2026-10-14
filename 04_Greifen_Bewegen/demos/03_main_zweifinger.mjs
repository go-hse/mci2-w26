// 03_main_zweifinger.mjs — verschieben, drehen, skalieren
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const U = new Path2D(
    'M -2 -2 L -2 2 L -1 2 L -1 -1 L 1 -1 L 1 2 L 2 2 L 2 -2 Z');
const figur = { m: new DOMMatrix().translate(400, 225).scale(50) };
const finger = new Map();  // pointerId → { x, y }, max. zwei
let p = null;              // Figur relativ zu den Fingern

// F: Matrix, die die Finger beschreiben
function fingerMatrix() {
    const [a, b] = [...finger.values()];
    if (!b) return new DOMMatrix().translate(a.x, a.y);  // 1 Finger
    const grad = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    const abstand = Math.hypot(b.x - a.x, b.y - a.y);
    return new DOMMatrix().translate(a.x, a.y).rotate(grad)
        .scale(abstand);
}

// bei jeder Änderung der Fingerzahl neu greifen: P = F⁻¹ · L
function neuGreifen() {
    p = finger.size === 0 ? null
        : fingerMatrix().inverse().multiply(figur.m);
}

function getroffen(pos) {
    const lokal = figur.m.inverse().transformPoint(pos);
    ctx.resetTransform();
    return ctx.isPointInPath(U, lokal.x, lokal.y);
}

canvas.addEventListener('pointerdown', (e) => {
    const pos = { x: e.offsetX, y: e.offsetY };
    // erster Finger muss treffen, der zweite darf daneben liegen
    if (finger.size >= 2) return;
    if (finger.size === 0 && !getroffen(pos)) return;
    finger.set(e.pointerId, pos);
    canvas.setPointerCapture(e.pointerId);
    neuGreifen();
});

canvas.addEventListener('pointermove', (e) => {
    if (!finger.has(e.pointerId)) return;
    finger.set(e.pointerId, { x: e.offsetX, y: e.offsetY });
    figur.m = fingerMatrix().multiply(p);   // L = F(neu) · P
});

function loslassen(e) {
    // Übergabe an den verbleibenden Finger
    if (finger.delete(e.pointerId)) neuGreifen();
}
canvas.addEventListener('pointerup', loslassen);
canvas.addEventListener('pointercancel', loslassen);

function loop() {
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(figur.m);
    ctx.fillStyle = finger.size ? '#b6163d' : '#00aadc';
    ctx.fill(U);
    ctx.resetTransform();
    ctx.fillStyle = '#193058';
    for (const f of finger.values()) {
        ctx.beginPath();
        ctx.arc(f.x, f.y, 14, 0, 2 * Math.PI);
        ctx.fill();
    }
    const s = Math.hypot(figur.m.a, figur.m.b);  // Skalierung
    const w = Math.atan2(figur.m.b, figur.m.a) * 180 / Math.PI;
    ctx.font = '16px monospace';
    const text = `Finger: ${finger.size}  Größe: ${s.toFixed(1)}`;
    ctx.fillText(`${text}  Winkel: ${w.toFixed(0)}°`, 20, 30);
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
