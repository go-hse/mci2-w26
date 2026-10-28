// 00_main_gestaltgesetze.mjs — sechs Gestaltgesetze
import { Layout, HorizontalLayout, VerticalLayout }
    from '../js/layout.mjs';
import { Widget, Anzeige, Button } from '../js/widgets.mjs';
import { verbindeZeiger } from '../js/zeiger.mjs';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const NAVY = '#193058', BLAU = '#00aadc', ROT = '#b6163d';
const GRAU = '#7fa7b8', ORANGE = '#e08a00', HELL = '#dde6ec';

// --- Raster: quer 3 Spalten, hoch 2 Spalten
class Raster extends Layout {
    anordnen() {
        const { x, y, w, h } = this.rect;
        const a = this.abstand, n = this.kinder.length;
        const spalten = w >= h ? 3 : 2;
        const zeilen = Math.ceil(n / spalten);
        const kw = (w - a * (spalten + 1)) / spalten;
        const kh = (h - a * (zeilen + 1)) / zeilen;
        this.kinder.forEach(({ kind }, i) => {
            const sp = i % spalten, ze = Math.floor(i / spalten);
            kind.set(x + a + sp * (kw + a), y + a + ze * (kh + a),
                kw, kh);
        });
    }
}

// --- Kachel: zeigt ein Gesetz, Tippen schaltet um
class Kachel extends Widget {
    constructor(titel, an, aus, zeichne) {
        super();
        Object.assign(this, { titel, an, aus, zeichne });
        this.aktiv = true;
        this.zeiger = null;
    }

    down(p, id) {
        if (this.zeiger !== null) return false;
        this.zeiger = id;
        return true;
    }

    up(p, id) {             // auslösen beim Loslassen (wie Button)
        if (id !== this.zeiger) return;
        if (this.hit(p)) this.aktiv = !this.aktiv;
        this.zeiger = null;
    }

    cancel(id) { if (id === this.zeiger) this.zeiger = null; }

    draw(ctx) {
        const { x, y, w, h } = this.rect;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 10);
        ctx.fill();
        ctx.fillStyle = NAVY;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText(this.titel, x + 12, y + 26);
        ctx.font = '14px sans-serif';
        ctx.fillStyle = this.aktiv ? NAVY : ROT;
        const status = this.aktiv ? this.an : this.aus;
        ctx.fillText(status, x + 12, y + h - 12, w - 24);
        // Zeichenfläche 320 × 200 Einheiten, zentriert eingepasst
        const fx = x + 8, fy = y + 36, fw = w - 16, fh = h - 64;
        const s = Math.min(fw / 320, fh / 200);
        ctx.save();
        ctx.beginPath();
        ctx.rect(fx, fy, fw, fh);
        ctx.clip();
        const ox = fx + (fw - 320 * s) / 2;
        const oy = fy + (fh - 200 * s) / 2;
        ctx.translate(ox, oy);
        ctx.scale(s, s);
        this.zeichne(ctx, this.aktiv, performance.now() / 1000);
        ctx.restore();
    }
}

// --- Zeichenhilfen (Einheiten der 320 × 200-Fläche)
function kasten(x, y, w, h, farbe, text = '', voll = true) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 5);
    if (voll) { ctx.fillStyle = farbe; ctx.fill(); }
    else {
        ctx.strokeStyle = farbe;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    if (text) {
        ctx.fillStyle = voll ? '#ffffff' : farbe;
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + w / 2, y + h / 2);
    }
}

function punkt(x, y, r, farbe) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = farbe;
    ctx.fill();
}

// fester Zufall, damit das Bild bei jedem Frame gleich bleibt
const zufall = (i) => {
    const s = Math.sin(i * 12.9898) * 43758.5453;
    return s - Math.floor(s);
};

// 1. Nähe: dieselben neun Werkzeuge, gleichmäßig oder gruppiert
function naehe(ctx, an) {
    const symbole = 'ABCDEFGHI';
    const luecke = (i) => (an ? (i % 3 === 2 ? 26 : 4) : 10);
    let breite = 9 * 22;
    for (let i = 0; i < 8; i++) breite += luecke(i);
    let x = (320 - breite) / 2;           // zentriert
    for (let i = 0; i < 9; i++) {
        kasten(x, 40, 22, 22, BLAU, symbole[i]);
        x += 22 + luecke(i);
    }
    for (let i = 0; i < 18; i++) {  // Punkte: Spalten oder Raster
        const sp = i % 6, ze = Math.floor(i / 6);
        const px = 60 + sp * 40 + (an ? (sp % 2 ? -12 : 12) : 0);
        punkt(px, 110 + ze * 28, 7, NAVY);
    }
}

// 2. Ähnlichkeit: Farbe und Form ordnen Raster und Knöpfe
function aehnlichkeit(ctx, an) {
    for (let i = 0; i < 18; i++) {
        const sp = i % 6, ze = Math.floor(i / 6);
        const x = 45 + sp * 46, y = 30 + ze * 30;
        if (an && sp % 2) kasten(x - 8, y - 8, 16, 16, ROT);
        else punkt(x, y, 8, NAVY);
    }
    const knoepfe = ['Neu', 'Öffnen', 'Sichern', 'Löschen'];
    const stile = [[BLAU, true], [ORANGE, false], [NAVY, true],
        [GRAU, false]];
    knoepfe.forEach((t, i) => {
        const [farbe, voll] = an
            ? (i === 3 ? [ROT, false] : [BLAU, true]) : stile[i];
        kasten(10 + i * 76, 140, 68, 32, farbe, t, voll);
    });
}

// 3. Geschlossenheit: Lücken werden ergänzt
function geschlossenheit(ctx, an) {
    ctx.lineWidth = 6;
    ctx.strokeStyle = NAVY;
    for (let i = 0; i < 6; i++) {      // Kreis aus sechs Bögen
        const a = i * Math.PI / 3;
        const dreh = an ? 0 : (zufall(i) - 0.5) * 2.4;
        const cx = 80 + (an ? 0 : (zufall(i + 9) - 0.5) * 40);
        const cy = 100 + (an ? 0 : (zufall(i + 3) - 0.5) * 40);
        ctx.beginPath();
        const von = a + dreh + 0.15;
        ctx.arc(cx, cy, 55, von, von + Math.PI / 3 - 0.3);
        ctx.stroke();
    }
    // Formular mit Eckmarken als »Rahmen«
    kasten(190, 70, 110, 24, HELL);
    kasten(190, 106, 110, 24, HELL);
    if (an) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = BLAU;
        const ecken = [[175, 55, 1, 1], [315, 55, -1, 1],
            [175, 145, 1, -1], [315, 145, -1, -1]];
        for (const [x, y, dx, dy] of ecken) {
            ctx.beginPath();
            ctx.moveTo(x + dx * 18, y);
            ctx.lineTo(x, y);
            ctx.lineTo(x, y + dy * 18);
            ctx.stroke();
        }
    }
}

// 4. Kontinuität: Punkte auf Linien, Schritte auf einem Pfad
function kontinuitaet(ctx, an) {
    for (let i = 0; i <= 16; i++) {
        const x = 15 + i * 18.5;
        const zit = (k) =>
            (an ? 0 : (zufall(i * 7 + k) - 0.5) * 50);
        const welle = 60 + 35 * Math.sin(i / 2.6);
        punkt(x + zit(1), welle + zit(2), 5, BLAU);
        punkt(x + zit(3), 30 + i * 4.5 + zit(4), 5, ORANGE);
    }
    const schritte = an
        ? [[40, 165], [120, 165], [200, 165], [280, 165]]
        : [[60, 150], [250, 178], [150, 140], [205, 186]];
    if (an) {
        ctx.strokeStyle = GRAU;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(40, 165);
        ctx.lineTo(280, 165);
        ctx.stroke();
    }
    schritte.forEach(([x, y], i) => {
        punkt(x, y, 13, i < 2 ? BLAU : GRAU);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(i + 1), x, y);
    });
}

// 5. Gemeinsame Region: Flächen schlagen Nähe
function region(ctx, an) {
    const xs = [25, 65, 140, 180, 255, 295];  // Nähe bildet Paare
    if (an) {                          // Flächen um 2–3, 4–5
        for (const [a, b] of [[1, 2], [3, 4]]) {
            kasten(xs[a] - 16, 45, xs[b] - xs[a] + 32, 60, HELL);
        }
    }
    xs.forEach((x) => punkt(x, 75, 12, NAVY));
    // Karten-Layout: drei Karten mit Bild und Text
    for (let i = 0; i < 3; i++) {
        const x = 12 + i * 102;
        if (an) kasten(x, 125, 92, 70, HELL);
        kasten(x + 8, 132, 76, 28, GRAU);
        kasten(x + 8, 166, 60, 8, NAVY);
        kasten(x + 8, 180, 40, 8, NAVY);
    }
}

// 6. Gemeinsames Schicksal: gemeinsam bewegt = zusammengehörig
const GRUPPE = new Set([1, 6, 8, 13, 15]);
function schicksal(ctx, an, t) {
    for (let i = 0; i < 18; i++) {
        const sp = i % 6, ze = Math.floor(i / 6);
        let dx = 6 * Math.sin(t * (2 + zufall(i) * 3) + i);
        let dy = 6 * Math.cos(t * (2 + zufall(i + 5) * 3) + i * 2);
        if (an && GRUPPE.has(i)) {             // alle im Gleichtakt
            dx = 0;
            dy = 22 * Math.sin(t * 2.5);
        }
        punkt(45 + sp * 46 + dx, 50 + ze * 50 + dy, 10, NAVY);
    }
}

// --- Kacheln und Layout-Baum
const kacheln = [
    new Kachel('1 Nähe', 'Abstände bilden Gruppen',
        'gleiche Abstände: keine Gruppen', naehe),
    new Kachel('2 Ähnlichkeit', 'gleiches Aussehen = gleiche Rolle',
        'jeder Knopf anders: keine Ordnung', aehnlichkeit),
    new Kachel('3 Geschlossenheit', 'Lücken werden zur Form ergänzt',
        'verstreute Bögen, kein Rahmen', geschlossenheit),
    new Kachel('4 Kontinuität', 'Linien führen den Blick',
        'Punktwolke, Schritte ohne Pfad', kontinuitaet),
    new Kachel('5 Gemeinsame Region', 'Flächen schlagen Nähe',
        'nur Nähe: Paare 1–2, 3–4, 5–6', region),
    new Kachel('6 Gemeinsames Schicksal', 'Gleichtakt bildet Gruppe',
        'jeder Punkt für sich', schicksal),
];
const alle = (wert) => () => {
    for (const k of kacheln) k.aktiv = wert;
};
const kopf = new HorizontalLayout({ abstand: 6 })
    .add(new Anzeige(() => 'Gestaltgesetze — Kachel antippen'), 4)
    .add(new Button('alle an', alle(true)), 1)
    .add(new Button('alle aus', alle(false)), 1);
const raster = new Raster({ abstand: 8 });
kacheln.forEach((k) => raster.add(k));
const wurzel = new VerticalLayout({ abstand: 0 })
    .add(kopf, 1).add(raster, 9);
verbindeZeiger(canvas, wurzel);

// --- Größe und HiDPI (Woche 2)
let dpr = 1;
function resize() {
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    const h = canvas.clientHeight;
    wurzel.kinder[0].gewicht = Math.min(64, h * 0.1);  // Kopf
    wurzel.kinder[1].gewicht = h - wurzel.kinder[0].gewicht;
    wurzel.set(0, 0, canvas.clientWidth, h);
}
new ResizeObserver(resize).observe(canvas);

function loop() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#e8edf1';
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    wurzel.draw(ctx);
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
