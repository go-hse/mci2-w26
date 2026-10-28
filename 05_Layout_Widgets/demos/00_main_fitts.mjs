// 00_main_fitts.mjs — Fitts' Law messen: Ziele im Kreis antippen
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const B = 900, H = 600;          // Zeichenfläche in CSS-Pixeln
const N = 13;                    // Ziele pro Kreis (ungerade)
const MX = B / 2, MY = H / 2 + 10;
const NAVY = '#193058', BLAU = '#00aadc', ROT = '#b6163d';
const FARBEN = ['#00aadc', '#b6163d', '#e08a00', '#2e8b57'];

// Bedingungen: D = Kreisdurchmesser (Distanz), W = Zielbreite
const KURZ = [[160, 80], [320, 40], [480, 80], [480, 20]];
const VOLL = [];
for (const d of [160, 320, 480]) {
    for (const w of [20, 40, 80]) VOLL.push([d, w]);
}
const id = (d, w) => Math.log2(2 * d / w);   // wie auf der Folie

// --- Zustand
const laeufe = [];               // abgeschlossene Läufe
let lauf = null;                 // { eingabe, bedingungen, daten }
let block = null;                // aktuelle Bedingung
let phase = 'start';             // start | pause | ziel | ende
let meldung = '';                // Hinweis im Startbild

// --- Größe und HiDPI (Woche 2)
const dpr = window.devicePixelRatio || 1;
canvas.width = B * dpr;
canvas.height = H * dpr;

function canvasPos(e) {
    const r = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - r.left) * B / r.width,
        y: (e.clientY - r.top) * H / r.height,
    };
}

// Reihenfolge nach ISO 9241-411: immer zum gegenüberliegenden Ziel
function reihenfolge() {
    const r = [];
    for (let k = 0; k < N; k++) r.push((k * (N + 1) / 2) % N);
    return r;
}

function zielPos(i, d) {
    const a = -Math.PI / 2 + i * 2 * Math.PI / N;
    return { x: MX + d / 2 * Math.cos(a), y: MY + d / 2 * Math.sin(a) };
}

function starte(liste) {
    const gemischt = [...liste].sort(() => Math.random() - 0.5);
    lauf = { eingabe: '?', bedingungen: gemischt, daten: [],
        anzahl: liste.length };
    meldung = '';
    naechsterBlock();
}

// Lauf beenden: alle fertigen Bedingungen auswerten
function beenden() {
    if (!lauf) return;
    lauf.daten = lauf.daten.slice(0, lauf.fertig ?? 0);
    const fertig = lauf.daten;
    const gruppen = new Set(fertig.map((v) => `${v.d}/${v.w}`));
    if (gruppen.size >= 2) laeufe.push(auswerten(lauf));
    else meldung = 'Für eine Auswertung mindestens zwei ' +
        'Bedingungen vollständig durchlaufen.';
    lauf = null;
    phase = 'ende';
}

function naechsterBlock() {
    const [d, w] = lauf.bedingungen.shift();
    block = { d, w, folge: reihenfolge(), schritt: 0, letzte: null };
    phase = 'pause';
}

// --- Eingabe: gezählt wird beim Aufsetzen (pointerdown)
canvas.addEventListener('pointerdown', (e) => {
    const p = canvasPos(e);
    if (phase === 'pause') { phase = 'ziel'; return; }
    if (phase !== 'ziel') return;
    lauf.eingabe = e.pointerType;           // mouse, touch, pen
    const z = zielPos(block.folge[block.schritt], block.d);
    const treffer = Math.hypot(p.x - z.x, p.y - z.y) <= block.w / 2;
    if (block.letzte !== null) {            // erster Tipp startet nur
        lauf.daten.push({
            d: block.d, w: block.w, id: id(block.d, block.w),
            mt: e.timeStamp - block.letzte, treffer,
            x: p.x, y: p.y, zx: z.x, zy: z.y,
        });
    }
    block.letzte = e.timeStamp;
    block.schritt++;
    if (block.schritt < N) return;
    // Daten eines abgebrochenen Blocks nicht werten
    lauf.fertig = lauf.daten.length;
    if (lauf.bedingungen.length) naechsterBlock();
    else beenden();
});

// --- Auswertung: Mittelwert je Bedingung, lineare Regression
function auswerten(l) {
    const gruppen = new Map();
    for (const v of l.daten) {
        const k = `${v.d}/${v.w}`;
        if (!gruppen.has(k)) gruppen.set(k, []);
        gruppen.get(k).push(v);
    }
    const punkte = [...gruppen.values()].map((g) => {
        const hits = g.filter((v) => v.treffer);
        const mt = hits.reduce((s, v) => s + v.mt, 0)
            / Math.max(1, hits.length);
        return { d: g[0].d, w: g[0].w, id: g[0].id, mt,
            fehler: 1 - hits.length / g.length };
    });
    const n = punkte.length;
    const mx = punkte.reduce((s, p) => s + p.id, 0) / n;
    const my = punkte.reduce((s, p) => s + p.mt, 0) / n;
    let sxy = 0, sxx = 0, syy = 0;
    for (const p of punkte) {
        sxy += (p.id - mx) * (p.mt - my);
        sxx += (p.id - mx) ** 2;
        syy += (p.mt - my) ** 2;
    }
    const b = sxy / sxx, a = my - b * mx;
    const r2 = sxy * sxy / (sxx * syy);
    const tp = punkte.reduce((s, p) => s + p.id / (p.mt / 1000), 0) / n;
    const fehler = l.daten.filter((v) => !v.treffer).length
        / l.daten.length;
    return { ...l, punkte, a, b, r2, tp, fehler };
}

// --- CSV-Export für eigene Auswertungen
document.getElementById('csv').addEventListener('click', () => {
    const zeilen = ['lauf;eingabe;D;W;ID;MT_ms;treffer;x;y;ziel_x;ziel_y'];
    const alle = lauf ? [...laeufe, lauf] : laeufe;   // laufender dazu
    if (!alle.some((l) => l.daten.length)) {
        meldung = 'Noch keine Messdaten — zuerst einen Test starten.';
        if (!lauf) phase = 'ende';
        return;
    }
    alle.forEach((l, i) => {
        for (const v of l.daten) {
            zeilen.push([i + 1, l.eingabe, v.d, v.w, v.id.toFixed(3),
                v.mt.toFixed(1), v.treffer ? 1 : 0, v.x.toFixed(1),
                v.y.toFixed(1), v.zx.toFixed(1), v.zy.toFixed(1)]
                .join(';').replaceAll('.', ','));
        }
    });
    const blob = new Blob([zeilen.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'fitts_messung.csv';
    a.click();
});
document.getElementById('kurz').addEventListener('click',
    () => starte(KURZ));
document.getElementById('voll').addEventListener('click',
    () => starte(VOLL));
document.getElementById('ende').addEventListener('click', beenden);
document.getElementById('neu').addEventListener('click', () => {
    laeufe.length = 0; lauf = null; phase = 'start'; meldung = '';
});

// --- Zeichnen
function text(s, x, y, groesse = 18, farbe = NAVY, ausr = 'left') {
    ctx.font = `${groesse}px sans-serif`;
    ctx.fillStyle = farbe;
    ctx.textAlign = ausr;
    ctx.fillText(s, x, y);
}

function kreis(x, y, r, farbe, voll) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    if (voll) { ctx.fillStyle = farbe; ctx.fill(); }
    else { ctx.strokeStyle = farbe; ctx.lineWidth = 2; ctx.stroke(); }
}

function zeichneZiele() {
    for (let i = 0; i < N; i++) {
        const z = zielPos(i, block.d);
        kreis(z.x, z.y, block.w / 2, '#9aa5b5', false);
    }
    const z = zielPos(block.folge[block.schritt], block.d);
    kreis(z.x, z.y, block.w / 2, BLAU, true);
    const nr = lauf.anzahl - lauf.bedingungen.length;
    text(`D = ${block.d} px, W = ${block.w} px, ` +
        `ID = ${id(block.d, block.w).toFixed(2)} bit`, 16, 30);
    text(`Bedingung ${nr} von ${lauf.anzahl} — Ziel ` +
        `${block.schritt + 1} von ${N}`, 16, 56, 15);
    text('Auswertung erscheint nach der letzten Bedingung',
        16, H - 16, 14, '#6b7a90');
}

function zeichneDiagramm() {
    // Achsen: ID 1 … 6 bit, MT 0 … 1500 ms
    const x0 = 90, y0 = 470, bw = 520, bh = 380;
    const px = (v) => x0 + (v - 1) / 5 * bw;
    const py = (v) => y0 - Math.min(v, 1500) / 1500 * bh;
    ctx.strokeStyle = NAVY;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x0, y0 - bh); ctx.lineTo(x0, y0); ctx.lineTo(x0 + bw, y0);
    ctx.stroke();
    for (let v = 1; v <= 6; v++) text(String(v), px(v), y0 + 22, 14,
        NAVY, 'center');
    for (let v = 0; v <= 1500; v += 300) text(String(v), x0 - 8,
        py(v) + 5, 14, NAVY, 'right');
    text('ID = log2(2D / W) in bit', x0 + bw / 2, y0 + 46, 15, NAVY,
        'center');
    ctx.save();
    ctx.translate(30, y0 - bh / 2);
    ctx.rotate(-Math.PI / 2);
    text('MT in ms', 0, 0, 15, NAVY, 'center');
    ctx.restore();

    laeufe.forEach((l, i) => {
        const f = FARBEN[i % FARBEN.length];
        for (const p of l.punkte) kreis(px(p.id), py(p.mt), 6, f, true);
        ctx.strokeStyle = f;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(px(1), py(l.a + l.b * 1));
        ctx.lineTo(px(6), py(l.a + l.b * 6));
        ctx.stroke();
        const y = 110 + i * 92;
        const name = { mouse: 'Maus', touch: 'Finger', pen: 'Stift' };
        text(`Lauf ${i + 1}: ${name[l.eingabe] ?? l.eingabe}`, 640, y,
            17, f);
        text(`MT = ${l.a.toFixed(0)} + ${l.b.toFixed(0)} · ID ms`,
            640, y + 22, 15);
        text(`R² = ${l.r2.toFixed(2)}, Fehler ${(l.fehler * 100)
            .toFixed(0)} %`, 640, y + 42, 15);
        text(`Durchsatz ≈ ${l.tp.toFixed(1)} bit/s`, 640, y + 62, 15);
    });
}

function loop() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, B, H);
    if (phase === 'ziel') {
        zeichneZiele();
    } else if (phase === 'pause') {
        text(`Bedingung: D = ${block.d} px, W = ${block.w} px`,
            B / 2, H / 2 - 30, 22, NAVY, 'center');
        text('So schnell und genau wie möglich das blaue Ziel ' +
            'antippen.', B / 2, H / 2 + 10, 18, NAVY, 'center');
        text('Zum Beginnen tippen', B / 2, H / 2 + 50, 18, BLAU,
            'center');
        const nr = lauf.anzahl - lauf.bedingungen.length;
        text(`Bedingung ${nr} von ${lauf.anzahl}`, B / 2,
            H / 2 + 90, 15, NAVY, 'center');
    } else if (laeufe.length) {
        text('Ergebnis: Bewegungszeit über Schwierigkeit', 16, 30, 20);
        zeichneDiagramm();
    } else {
        text("Fitts' Law: MT = a + b · log2(2D / W)", B / 2, 200, 26,
            NAVY, 'center');
        text('Einen Test unten starten — mit Maus, Finger oder Stift.',
            B / 2, 250, 18, NAVY, 'center');
        text('Mehrere Läufe werden zum Vergleich gemeinsam angezeigt.',
            B / 2, 280, 18, NAVY, 'center');
    }
    if (meldung && !lauf) text(meldung, B / 2, H - 24, 17, ROT,
        'center');
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
