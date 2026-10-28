// 00_main_gummiband.mjs — Latenz wird zum Gummiband
import { Kalman1D } from '../js/kalman.mjs';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const $ = (id) => document.getElementById(id);
const regler = $('latenz'), wert = $('wert');
const bewegung = $('bewegung'), anteil = $('anteil');
const spur = $('spur'), modell = $('modell');
const zittern = $('zittern');
const glaettung = $('glaettung'), qwert = $('qwert');

const B = 900, H = 500;          // Zeichenfläche in CSS-Pixeln
const RAUSCHEN = 4;              // Standardabweichung in px
let latenz = Number(regler.value);
let proben = [];      // { t, x, y (gemessen), wx, wy (wahr) }
let zieht = false;               // Finger oder Maus gedrückt?
let objektSpur = [];             // gezeichnete Objektpositionen
let fehler = [];      // { t, e }: Abstand zur wahren Position

// Kalman-Filter je Achse; gefüttert mit den verzögerten Messungen
const kx = new Kalman1D(0, RAUSCHEN ** 2);
const ky = new Kalman1D(0, RAUSCHEN ** 2);
let gefuettert = -Infinity;      // Zeitstempel der letzten Messung

function filterNeu() {
    const q = 10 ** Number(glaettung.value);
    kx.q = ky.q = q;
    kx.reset(); ky.reset();
    gefuettert = -Infinity;
    qwert.textContent = `q = ${q.toExponential(1)}`;
    $('anteilwert').textContent = `${anteil.value} %`;
    $('glaettungZeile').style.opacity = modell.value === 'kalman'
        ? 1 : 0.4;
}
filterNeu();
for (const el of [glaettung, modell, zittern, bewegung, anteil]) {
    el.addEventListener('input', filterNeu);
}

// --- Größe und HiDPI (Woche 2)
const dpr = window.devicePixelRatio || 1;
canvas.width = B * dpr;
canvas.height = H * dpr;

function setzeLatenz(ms) {
    latenz = ms;
    regler.value = ms;
    wert.textContent = `${ms} ms`;
    filterNeu();
}
regler.addEventListener('input', () => setzeLatenz(+regler.value));
for (const k of document.querySelectorAll('button[data-ms]')) {
    k.addEventListener('click', () => setzeLatenz(+k.dataset.ms));
}

// --- Eingabe: jede Fingerposition mit Zeitstempel merken
function canvasPos(e) {
    const r = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - r.left) * B / r.width,
        y: (e.clientY - r.top) * H / r.height,
    };
}

function gauss() {               // normalverteilte Zufallszahl
    const u = 1 - Math.random(), w = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * w);
}

function merke(t, p) {
    const s = zittern.checked ? RAUSCHEN : 0;
    proben.push({
        t, wx: p.x, wy: p.y,
        x: p.x + s * gauss(), y: p.y + s * gauss(),
    });
    const alt = t - 2000;             // nur die letzten 2 s
    while (proben.length > 2 && proben[1].t < alt) proben.shift();
}

canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    bewegung.value = 'hand';
    zieht = true;
    filterNeu();
    merke(e.timeStamp, canvasPos(e));
});

canvas.addEventListener('pointermove', (e) => {
    if (!zieht) return;
    // alle Zwischenpositionen seit dem letzten Frame
    for (const c of e.getCoalescedEvents?.() ?? [e]) {
        merke(c.timeStamp, canvasPos(c));
    }
});

function loslassen() { zieht = false; }
canvas.addEventListener('pointerup', loslassen);
canvas.addEventListener('pointercancel', loslassen);

// --- Position zu einem früheren Zeitpunkt (linear interpoliert)
function positionBei(t, wahr = false) {
    if (proben.length === 0) return null;
    const px = wahr ? 'wx' : 'x', py = wahr ? 'wy' : 'y';
    const punkt = (p) => ({ x: p[px], y: p[py] });
    if (t <= proben[0].t) return punkt(proben[0]);
    for (let i = proben.length - 1; i > 0; i--) {
        const a = proben[i - 1], b = proben[i];
        if (a.t <= t) {
            if (t >= b.t) return punkt(b);
            const s = (t - a.t) / (b.t - a.t);
            return {
                x: a[px] + s * (b[px] - a[px]),
                y: a[py] + s * (b[py] - a[py]),
            };
        }
    }
    return punkt(proben[0]);
}

// Linear: verzögerte Position + Geschwindigkeit · Latenz
// Vorhersagezeit: Anteil der Latenz (Regler »Vorhersageanteil«)
const spanne = () => latenz * Number(anteil.value) / 100;

function linear(t) {
    const p = positionBei(t - latenz);
    const q = positionBei(t - latenz - 50);   // 50 ms davor
    if (!p || !q) return p;
    const vx = (p.x - q.x) / 50, vy = (p.y - q.y) / 50;
    const h = spanne();
    return { x: p.x + vx * h, y: p.y + vy * h };
}

// Kalman: Messungen bis t − Latenz einspeisen, dann fortschreiben
function kalman(t) {
    const bis = t - latenz;
    for (const p of proben) {
        if (p.t <= gefuettert || p.t > bis) continue;
        const dt = gefuettert === -Infinity ? 0 : p.t - gefuettert;
        if (dt > 200) { kx.reset(); ky.reset(); }  // Pause: neu
        kx.schritt(p.x, dt);
        ky.schritt(p.y, dt);
        gefuettert = p.t;
    }
    // Stillstand: Ohne Bewegung sendet der Browser keine Events.
    // Kein Event heißt »Finger steht« — also die letzte Position
    // weiter als Messung einspeisen, sonst fliegt das Objekt davon.
    const letzte = proben.at(-1);
    const steht = letzte && bis - letzte.t > 40;
    if (kx.bereit && steht && bis > gefuettert) {
        kx.schritt(letzte.x, bis - gefuettert);
        ky.schritt(letzte.y, bis - gefuettert);
        gefuettert = bis;
    }
    if (!kx.bereit) return positionBei(bis);
    // bis t − Latenz aufholen, dann nur den gewählten Anteil
    const h = Math.max(0, bis - gefuettert + spanne());
    return { x: kx.vorhersage(h), y: ky.vorhersage(h) };
}

// Ziel zu Ziel: Minimum-Jerk-Bewegungen wie bei einer echten Hand
let zufall = 7;          // fester Startwert: jedes Mal gleich
const M = 2147483647;
const rnd = () => (zufall = zufall * 16807 % M) / M;
const strecken = [];             // { t0, dauer, von, nach }

function zielZuZiel(t) {
    while (!strecken.length || strecken.at(-1).ende < t) {
        const alt = strecken.at(-1);
        const von = alt ? alt.nach : { x: B / 2, y: H / 2 };
        const t0 = alt ? alt.ende : t;
        const dauer = 250 + rnd() * 450;          // ms
        const pause = rnd() < 0.5 ? 0 : rnd() * 250;
        const nach = { x: 100 + rnd() * 700, y: 80 + rnd() * 340 };
        strecken.push({ t0, dauer, von, nach,
            ende: t0 + dauer + pause });
        if (strecken.length > 20) strecken.shift();
    }
    const s = strecken.find((k) => t < k.ende) ?? strecken.at(-1);
    const u = Math.min(1, Math.max(0, (t - s.t0) / s.dauer));
    const m = 10 * u ** 3 - 15 * u ** 4 + 6 * u ** 5;  // weich
    return {
        x: s.von.x + (s.nach.x - s.von.x) * m,
        y: s.von.y + (s.nach.y - s.von.y) * m,
    };
}

// Kreisbahn als virtueller Finger (für den Hörsaal ohne Touch)
function kreisbahn(t) {
    const w = t / 1000 * 2.2;                 // rad pro Sekunde
    return {
        x: B / 2 + 260 * Math.cos(w),
        y: H / 2 + 150 * Math.sin(w),
    };
}

// --- Zeichnen
function feder(a, b) {          // Zickzack-Linie zwischen a und b
    const dx = b.x - a.x, dy = b.y - a.y;
    const l = Math.hypot(dx, dy);
    if (l < 2) return;
    const nx = -dy / l, ny = dx / l;          // Normale
    const amp = Math.max(2, 14 - l / 25);  // gedehnt: flacher
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    for (let i = 1; i < 16; i++) {
        const s = i / 16, z = (i % 2 ? 1 : -1) * amp;
        ctx.lineTo(a.x + dx * s + nx * z, a.y + dy * s + ny * z);
    }
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = '#e08a00';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function kreis(p, r, farbe, voll) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
    if (voll) { ctx.fillStyle = farbe; ctx.fill(); }
    else {
        ctx.strokeStyle = farbe;
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}

function linie(punkte, farbe) {
    if (punkte.length < 2) return;
    ctx.beginPath();
    for (const p of punkte) ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = farbe;
    ctx.lineWidth = 2;
    ctx.stroke();
}

function text(s, x, y, groesse = 18) {
    ctx.font = `${groesse}px sans-serif`;
    ctx.fillStyle = '#193058';
    ctx.fillText(s, x, y);
}

const NAMEN = { keine: '', linear: ' + lineare Vorhersage',
    kalman: ' + Kalman-Filter' };

function loop(jetzt) {
    if (bewegung.value === 'kreis') merke(jetzt, kreisbahn(jetzt));
    if (bewegung.value === 'ziele') merke(jetzt, zielZuZiel(jetzt));
    const finger = positionBei(jetzt, true);  // wahre Position
    const ohne = positionBei(jetzt - latenz);
    const objekt = modell.value === 'linear' ? linear(jetzt)
        : modell.value === 'kalman' ? kalman(jetzt) : ohne;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, B, H);
    if (!finger) {
        text('Mit Finger oder Maus ziehen — oder Bewegung wählen',
            20, 36);
        requestAnimationFrame(loop);
        return;
    }
    objektSpur.push({ t: jetzt, x: objekt.x, y: objekt.y });
    objektSpur = objektSpur.filter((p) => p.t > jetzt - 1500);
    const e = Math.hypot(finger.x - objekt.x, finger.y - objekt.y);
    fehler.push({ t: jetzt, e });
    fehler = fehler.filter((f) => f.t > jetzt - 3000);
    const summe = fehler.reduce((s, f) => s + f.e, 0);
    const mittel = summe / fehler.length;

    if (spur.checked) {
        const fingerSpur = proben.filter((p) => p.t > jetzt - 1500)
            .map((p) => ({ x: p.wx, y: p.wy }));
        linie(fingerSpur, '#c3c9d4');
        linie(objektSpur, '#7fd3ec');
    }
    if (modell.value !== 'keine') kreis(ohne, 26, '#7fd3ec', false);
    kreis(objekt, 26, '#00aadc', true);   // das gezogene Objekt
    feder(finger, objekt);
    kreis(finger, 16, '#b6163d', false);  // wo der Finger ist

    const teil = modell.value !== 'keine' && anteil.value !== '100'
        ? ` (${anteil.value} %)` : '';
    text(`Latenz: ${latenz} ms${NAMEN[modell.value]}${teil}` +
        (zittern.checked ? ', mit Zittern' : ''), 20, 36);
    text(`Abstand Finger – Objekt: ${e.toFixed(0)} px`, 20, 64);
    text(`Mittel der letzten 3 s: ${mittel.toFixed(1)} px`,
        20, 92);
    const zusatz = modell.value === 'keine' ? ''
        : '   hellblau: ohne';
    text('rot: Finger   blau: Objekt   orange: Gummiband' + zusatz,
        20, H - 20, 15);
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
