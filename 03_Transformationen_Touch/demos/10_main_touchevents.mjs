// 10_main_touchevents.mjs — Touch Events, Listen, identifier
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const aktiv = new Map();   // identifier → { x, y }
let letztes = null;        // Typ und Listenlängen

// Bildschirm → Canvas-Pixel (Folie »Koordinatenumrechnung«)
function canvasPos(canvas, p) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (p.clientX - rect.left) * (canvas.width / rect.width),
        y: (p.clientY - rect.top) * (canvas.height / rect.height),
    };
}

function merken(e) {
    letztes = {
        typ: e.type,
        touches: e.touches.length,
        targetTouches: e.targetTouches.length,
        changedTouches: e.changedTouches.length,
    };
}

function setzen(e) {
    e.preventDefault();               // kein Scrollen, kein Zoom
    merken(e);
    for (const t of e.changedTouches) {
        aktiv.set(t.identifier, canvasPos(canvas, t));
    }
}

function entfernen(e) {
    merken(e);
    for (const t of e.changedTouches) aktiv.delete(t.identifier);
}

// passive: false — sonst wirkt preventDefault() nicht
canvas.addEventListener('touchstart', setzen, { passive: false });
canvas.addEventListener('touchmove', setzen, { passive: false });
canvas.addEventListener('touchend', entfernen);
canvas.addEventListener('touchcancel', entfernen);

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '18px sans-serif';
    for (const [id, p] of aktiv) {
        ctx.fillStyle = '#00aadc';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 40, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#193058';
        ctx.fillText(`identifier ${id}`, p.x + 46, p.y);
    }
    ctx.fillStyle = '#193058';
    ctx.fillText('Touch Events: nur Finger, keine Maus', 20, 30);
    if (letztes) {
        const l = letztes;
        ctx.font = '16px monospace';
        ctx.fillText(`letztes Event:  ${l.typ}`, 20, 380);
        const t = `touches: ${l.touches}  ` +
            `targetTouches: ${l.targetTouches}  ` +
            `changedTouches: ${l.changedTouches}`;
        ctx.fillText(t, 20, 410);
    }
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
