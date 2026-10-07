// main_path2d.mjs — Path2D: Geometrie einmal bauen, in jedem Frame wiederverwenden
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
const regler = document.getElementById('anzahl');
const anzahlWert = document.getElementById('anzahlWert');

// ---------- Geometrie: Zahnrad mit 16 Zähnen, 128 Eckpunkte ----------
const ZAEHNE = 16;
const PUNKTE = [];                                   // [x0, y0, x1, y1, …]
for (let i = 0; i < ZAEHNE * 8; i++) {
    const a = i / (ZAEHNE * 8) * 2 * Math.PI;
    const r = (i % 8) < 4 ? 12 : 9;                  // Zahn außen, Lücke innen
    PUNKTE.push(r * Math.cos(a), r * Math.sin(a));
}

// Pfad aus den Punkten aufbauen. Funktioniert mit ctx UND mit Path2D,
// weil beide dieselben Pfadmethoden haben (moveTo, lineTo, closePath …)
function zahnradPfad(p) {
    p.moveTo(PUNKTE[0], PUNKTE[1]);
    for (let i = 2; i < PUNKTE.length; i += 2) p.lineTo(PUNKTE[i], PUNKTE[i + 1]);
    p.closePath();
}

// Variante 1: einmal als Path2D bauen
const ZAHNRAD = new Path2D();
zahnradPfad(ZAHNRAD);

// Variante 3: dieselbe Form als SVG-Pfaddaten (String)
let svg = `M ${PUNKTE[0].toFixed(2)} ${PUNKTE[1].toFixed(2)}`;
for (let i = 2; i < PUNKTE.length; i += 2) svg += ` L ${PUNKTE[i].toFixed(2)} ${PUNKTE[i + 1].toFixed(2)}`;
svg += ' Z';

// ---------- Datenmodell ----------
let raeder = [];
function erzeuge(n) {
    raeder = Array.from({ length: n }, () => ({
        x: 15 + Math.random() * 770,
        y: 15 + Math.random() * 420,
        winkel: Math.random() * 2 * Math.PI,
        omega: (Math.random() - 0.5) * 2,            // rad/s
        getroffen: false,
    }));
    anzahlWert.textContent = n;
}
erzeuge(Number(regler.value));
regler.addEventListener('input', () => erzeuge(Number(regler.value)));

function modus() {
    return document.querySelector('input[name="modus"]:checked').value;
}

function setzeTransform(r) {
    ctx.setTransform(1, 0, 0, 1, r.x, r.y);
    ctx.rotate(r.winkel);
}

// ---------- Render-Schleife mit Messung ----------
let last = performance.now();
let jsZeit = 0;                                      // gleitende Mittel
let frameZeit = 16.7;

function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    frameZeit = 0.95 * frameZeit + 0.05 * (now - last);
    last = now;
    for (const r of raeder) r.winkel += r.omega * dt;        // update

    const t0 = performance.now();                              // draw
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const m = modus();
    for (const r of raeder) {
        setzeTransform(r);
        ctx.fillStyle = r.getroffen ? '#b6163d' : '#00aadc';
        if (m === 'cache') {
            ctx.fill(ZAHNRAD);                   // nur noch zeichnen
        } else if (m === 'neu') {
            ctx.beginPath();                     // 129 Pfadbefehle pro Rad
            zahnradPfad(ctx);
            ctx.fill();
        } else {
            ctx.fill(new Path2D(svg));           // String parsen pro Rad
        }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    jsZeit = 0.95 * jsZeit + 0.05 * (performance.now() - t0);

    info.textContent =
        `Zeichnen (JS): ${jsZeit.toFixed(1).padStart(5)} ms   ` +
        `Frame: ${frameZeit.toFixed(1).padStart(5)} ms   ` +
        `≈ ${(1000 / frameZeit).toFixed(0)} FPS`;
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// ---------- Hit-Testing: isPointInPath mit dem Path2D ----------
canvas.addEventListener('pointerdown', (e) => {
    for (let i = raeder.length - 1; i >= 0; i--) {             // oberstes Rad zuerst
        setzeTransform(raeder[i]);
        if (ctx.isPointInPath(ZAHNRAD, e.offsetX, e.offsetY)) {
            raeder[i].getroffen = !raeder[i].getroffen;
            break;
        }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
});
