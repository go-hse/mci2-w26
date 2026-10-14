// 00_main_reihenfolge.mjs — Reihenfolge: translate, rotate
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const play = document.getElementById('play');
const zeit = document.getElementById('zeit');
const spur = document.getElementById('spur');

const PUNKT = { x: 20, y: 0 };   // lokaler Punkt
const S = 2.3;                   // Zoom: 1 Einheit = 2,3 px
const DAUER = 8000;              // ms für einen Durchlauf

// Ablauf: Pause, 1. Aufruf, Pause, 2. Aufruf, Pause
// liefert den Fortschritt (0 … 1) beider Aufrufe
function fortschritt(t) {
    const glatt = (a, b) => {
        const s = Math.min(1, Math.max(0, (t - a) / (b - a)));
        return s * s * (3 - 2 * s);         // weich ein/aus
    };
    return [glatt(0.10, 0.40), glatt(0.50, 0.80)];
}

// die beiden Varianten: genau die ctx-Aufrufe der Folien
const varianten = [
    {
        titel: 'translate → rotate',
        aufrufe: ['ctx.translate(50, 50);',
            'ctx.rotate(Math.PI / 2);'],
        matrix: 'M = T · R → auf den Punkt wirkt erst R, dann T',
        anwenden(c, s1, s2) {
            c.translate(50 * s1, 50 * s1);
            c.rotate(Math.PI / 2 * s2);
        },
        x0: 0,
    },
    {
        titel: 'rotate → translate',
        aufrufe: ['ctx.rotate(Math.PI / 2);',
            'ctx.translate(50, 50);'],
        matrix: 'M = R · T → auf den Punkt wirkt erst T, dann R',
        anwenden(c, s1, s2) {
            c.rotate(Math.PI / 2 * s1);
            c.translate(50 * s2, 50 * s2);
        },
        x0: 450,
    },
];
const spuren = varianten.map(() => []);

// --- Größe und HiDPI (Woche 2)
const dpr = window.devicePixelRatio || 1;
canvas.width = 900 * dpr;
canvas.height = 480 * dpr;
const basis = new DOMMatrix().scale(dpr);  // CSS → Gerät

// Pfeil von (0, 0) nach (l, 0) im aktuellen System
function pfeil(l, farbe, breite) {
    ctx.strokeStyle = farbe;
    ctx.fillStyle = farbe;
    ctx.lineWidth = breite;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(l, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(l + 3, 0);
    ctx.lineTo(l - 3, -2);
    ctx.lineTo(l - 3, 2);
    ctx.fill();
}

// Koordinatenkreuz: x-Achse und (um 90° gedreht) y-Achse
function achsen(l, fx, fy, breite) {
    pfeil(l, fx, breite);
    ctx.save();
    ctx.rotate(Math.PI / 2);
    pfeil(l, fy, breite);
    ctx.restore();
}

// Text an einer Stelle des aktuellen Systems, aber ungedreht
function text(s, p, farbe, dx = 0, dy = 0) {
    const q = ctx.getTransform().transformPoint(p);
    ctx.save();
    ctx.setTransform(basis);
    ctx.fillStyle = farbe;
    ctx.fillText(s, q.x / dpr + dx, q.y / dpr + dy);
    ctx.restore();
}

function weltgitter() {
    ctx.lineWidth = 1 / S;
    ctx.strokeStyle = '#d8dde6';
    for (let v = -90; v <= 90; v += 10) {
        ctx.beginPath();
        ctx.moveTo(v, -20);
        ctx.lineTo(v, 95);
        ctx.moveTo(-90, v);
        ctx.lineTo(90, v);
        ctx.stroke();
    }
    achsen(85, '#7a8699', '#7a8699', 1.5 / S);
    ctx.font = '14px sans-serif';
    text('x', { x: 85, y: 0 }, '#7a8699', -4, -8);
    text('y', { x: 0, y: 92 }, '#7a8699', 6, 6);
    text('Welt (0, 0)', { x: 0, y: 0 }, '#7a8699', -78, -6);
}

function panel(v, i, s1, s2) {
    ctx.save();
    ctx.setTransform(basis);
    ctx.beginPath();
    ctx.rect(v.x0, 0, 450, 480);
    ctx.clip();                       // nicht ins Nachbarfeld

    ctx.translate(v.x0 + 240, 135);   // Ansicht: Weltursprung
    ctx.scale(S, S);
    const ansicht = ctx.getTransform();
    weltgitter();

    // Spur des Punkts in Weltkoordinaten
    if (spur.checked && spuren[i].length > 1) {
        ctx.strokeStyle = '#e08a00';
        ctx.lineWidth = 1.5 / S;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        for (const p of spuren[i]) ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // --- das lokale System: genau die Aufrufe der Folie
    v.anwenden(ctx, s1, s2);
    achsen(35, '#b6163d', '#00aadc', 3 / S);
    ctx.beginPath();
    ctx.arc(PUNKT.x, PUNKT.y, 3.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#e08a00';
    ctx.fill();
    ctx.font = 'bold 15px sans-serif';
    text("x'", { x: 40, y: 0 }, '#b6163d', -4, 5);
    text("y'", { x: 0, y: 40 }, '#00aadc', -4, 5);
    ctx.font = '14px sans-serif';
    text('(20, 0)', PUNKT, '#e08a00', 8, -8);

    // Weltposition: Ansicht herausrechnen
    const m = ansicht.inverse().multiply(ctx.getTransform());
    const w = m.transformPoint(PUNKT);
    const letzte = spuren[i].at(-1);
    const weg = letzte
        ? Math.hypot(letzte.x - w.x, letzte.y - w.y) : 1;
    if (weg > 0.3) {
        spuren[i].push({ x: w.x, y: w.y });
    }
    ctx.restore();
    beschriftung(v, s1, s2, w);
}

function beschriftung(v, s1, s2, w) {
    ctx.save();
    ctx.setTransform(basis);
    const x = v.x0 + 20;
    ctx.fillStyle = '#193058';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(v.titel, x, 28);
    ctx.font = '17px monospace';
    v.aufrufe.forEach((a, k) => {
        const s = k === 0 ? s1 : s2;
        const aktiv = s > 0 && s < 1;
        const fertig = s === 1;
        const farbe = fertig ? '#193058' : '#9aa5b5';
        ctx.fillStyle = aktiv ? '#b6163d' : farbe;
        const zeichen = fertig ? '✓' : aktiv ? '▶' : ' ';
        const y = 390 + 24 * k;
        ctx.fillText(`${zeichen} ${k + 1}. ${a}`, x, y);
    });
    ctx.font = '15px sans-serif';
    ctx.fillStyle = '#193058';
    ctx.fillText(v.matrix, x, 448);
    const r = (z) => (Math.abs(z) < 0.05 ? 0 : z).toFixed(0);
    const welt = `(${r(w.x)}, ${r(w.y)})`;
    ctx.fillText(`Punkt (20, 0) in der Welt: ${welt}`, x, 470);
    ctx.restore();
}

// --- Zeitsteuerung: abspielen oder mit dem Regler schieben
let laeuft = true;
let t = 0;
let vorher = performance.now();
play.addEventListener('click', () => {
    laeuft = !laeuft;
    play.textContent = laeuft ? 'Pause' : 'Abspielen';
});
zeit.addEventListener('input', () => {
    laeuft = false;
    play.textContent = 'Abspielen';
    t = Number(zeit.value);
});

function loop(jetzt) {
    if (laeuft) {
        t += (jetzt - vorher) / DAUER;
        if (t > 1) t = 0;
        zeit.value = t;
    }
    vorher = jetzt;
    const [s1, s2] = fortschritt(t);
    if (s1 === 0) spuren.forEach((sp) => (sp.length = 0));

    ctx.setTransform(basis);
    ctx.clearRect(0, 0, 900, 480);
    varianten.forEach((v, i) => panel(v, i, s1, s2));
    ctx.setTransform(basis);
    ctx.strokeStyle = '#193058';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(450, 10);
    ctx.lineTo(450, 470);
    ctx.stroke();
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
