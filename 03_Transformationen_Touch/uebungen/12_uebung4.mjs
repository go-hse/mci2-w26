// 12_uebung4.mjs — Labor: Multi-Touch-Button und Visualisierer
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const aktiv = new Map();   // pointerId → { x, y }
const KNOPF = { x: 300, y: 150, w: 200, h: 150 };

function canvasPos(canvas, p) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (p.clientX - rect.left) * (canvas.width / rect.width),
        y: (p.clientY - rect.top) * (canvas.height / rect.height),
    };
}

function isInside(r, p) {
    return p.x >= r.x && p.x <= r.x + r.w
        && p.y >= r.y && p.y <= r.y + r.h;
}

canvas.addEventListener('pointerdown', (e) => {
    // TODO 1: Zeiger festhalten (setPointerCapture) und
    //         seine Canvas-Position unter e.pointerId merken
});

canvas.addEventListener('pointermove', (e) => {
    // TODO 2: nur bekannte Zeiger aktualisieren
    //         (die Maus sendet move auch ohne Taste)
});

function entfernen(e) {
    // TODO 3: diesen Zeiger aus der Map entfernen
}
canvas.addEventListener('pointerup', entfernen);
canvas.addEventListener('pointercancel', entfernen);

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // TODO 4: zählen, wie viele aktive Zeiger auf dem Knopf
    //         liegen (isInside)
    let drauf = 0;

    ctx.fillStyle = drauf > 0 ? '#b6163d' : '#7fa7b8';
    ctx.fillRect(KNOPF.x, KNOPF.y, KNOPF.w, KNOPF.h);
    ctx.fillStyle = '#ffffff';
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${drauf} Finger`, KNOPF.x + KNOPF.w / 2,
        KNOPF.y + KNOPF.h / 2 + 8);
    ctx.textAlign = 'start';

    for (const [id, p] of aktiv) {       // Visualisierer
        ctx.strokeStyle = '#193058';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 35, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = '#193058';
        ctx.font = '16px sans-serif';
        ctx.fillText(String(id), p.x + 40, p.y);
    }
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
