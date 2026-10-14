// 11_main_pointerevents.mjs — ein Event je Zeiger
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// pointerId → Zeigerdaten; diese Liste führen wir selbst
const aktiv = new Map();

// Bildschirm → Canvas-Pixel (Folie »Koordinatenumrechnung«)
function canvasPos(canvas, p) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (p.clientX - rect.left) * (canvas.width / rect.width),
        y: (p.clientY - rect.top) * (canvas.height / rect.height),
    };
}

function info(e) {
    return {
        ...canvasPos(canvas, e),
        typ: e.pointerType,        // 'touch', 'mouse' oder 'pen'
        druck: e.pressure,         // 0 … 1
        w: e.width, h: e.height,   // Kontaktfläche in CSS-px
        primaer: e.isPrimary,
    };
}

canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);  // auch außerhalb
    aktiv.set(e.pointerId, info(e));
});

canvas.addEventListener('pointermove', (e) => {
    // Maus: move kommt auch ohne gedrückte Taste → nur aktive
    if (aktiv.has(e.pointerId)) aktiv.set(e.pointerId, info(e));
});

function entfernen(e) {
    aktiv.delete(e.pointerId);
}
canvas.addEventListener('pointerup', entfernen);
canvas.addEventListener('pointercancel', entfernen);  // System

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '16px sans-serif';
    for (const [id, p] of aktiv) {
        ctx.fillStyle = p.primaer ? '#b6163d' : '#00aadc';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 40, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#193058';
        const name = `pointerId ${id} (${p.typ})`;
        ctx.fillText(name, p.x + 46, p.y - 10);
        const flaeche = `${p.w.toFixed(0)}×${p.h.toFixed(0)}`;
        ctx.fillText(`Druck ${p.druck.toFixed(2)}, ${flaeche}`,
            p.x + 46, p.y + 12);
    }
    ctx.fillStyle = '#193058';
    ctx.font = '18px sans-serif';
    ctx.fillText('Pointer Events: Finger, Maus, Stift', 20, 30);
    ctx.fillText(`aktive Zeiger: ${aktiv.size}  (rot: isPrimary)`,
        20, 420);
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
