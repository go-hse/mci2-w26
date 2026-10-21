// 05_loesung3.mjs — Übung 3: Roboterarm und Hindernisse (Vorlage)
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Oberarm, Unterarm, Hand — Winkel in Grad, omega in Grad/s
const arme = [
    { laenge: 160, winkel: 0, omega: 25, farbe: '#193058' },
    { laenge: 120, winkel: 30, omega: -40, farbe: '#00aadc' },
    { laenge: 70, winkel: -20, omega: 90, farbe: '#7fd3ec' },
];
const BASIS = new DOMMatrix().translate(400, 420).rotate(-90);
let welt = [];                        // Weltmatrix je Arm

// Hindernisse: Form im eigenen lokalen System + Matrix lokal → Welt
const U = new Path2D('M -2 -2 L -2 2 L -1 2 L -1 -1 L 1 -1 L 1 2 L 2 2 L 2 -2 Z');
const QUADRAT = new Path2D();
QUADRAT.rect(-1, -1, 2, 2);

const KREIS = new Path2D();
KREIS.arc(0, 0, 1, 0, 2 * Math.PI);

function hindernis(form, x, y, winkel, sx, sy = sx) {
    const m = new DOMMatrix().translate(x, y).rotate(winkel).scale(sx, sy);
    return { form, m, treffer: -Infinity };
}

const hindernisse = [
    hindernis(QUADRAT, 400, 445, 0, 400, 15),   // Boden
    hindernis(U, 170, 200, 160, 22),
    hindernis(QUADRAT, 420, 60, 20, 30),
    hindernis(KREIS, 650, 210, 0, 40),
    hindernis(QUADRAT, 640, 360, -15, 25),
];

// Tastpunkte im System des jeweiligen Arms: die Ecken am Armende
function tastpunkte(a) {
    return [{ x: a.laenge, y: -12 }, { x: a.laenge, y: 12 }];
}

function berechne() {
    welt = [];
    let m = BASIS;
    for (const a of arme) {
        m = m.multiply(new DOMMatrix().rotate(a.winkel));
        welt.push(m);
        m = m.multiply(new DOMMatrix().translate(a.laenge, 0));
    }
}

// liefert das getroffene Hindernis oder null
function kollision() {
    for (let i = 0; i < arme.length; i++) {
        for (const p of tastpunkte(arme[i])) {
            // TODO 1: Tastpunkt p vom System des Arms (welt[i])
            //         ins Weltsystem umrechnen
            for (const h of hindernisse) {
                // TODO 2: Weltpunkt ins lokale System des
                //         Hindernisses umrechnen (h.m)
                // TODO 3: mit ctx.isPointInPath(h.form, …) prüfen,
                //         ob der Punkt in der Form liegt — Achtung:
                //         welche Transformation hat ctx gerade?
            }
        }
    }
    return null;
}

function schritt(dt) {
    for (const a of arme) a.winkel += a.omega * dt;
    berechne();
}

let umkehrungen = 0;
let last = performance.now();
function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    schritt(dt);
    const h = kollision();
    if (h) {
        // TODO 4: Bewegungsrichtung aller Gelenke umkehren.
        //         Was passiert, wenn der Arm danach noch im
        //         Hindernis steckt?
        h.treffer = now;
        umkehrungen++;
    }
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const h of hindernisse) {
        ctx.setTransform(h.m);
        ctx.fillStyle = now - h.treffer < 300 ? '#b6163d' : '#c8ccd4';
        ctx.fill(h.form);
    }
    arme.forEach((a, i) => {
        ctx.setTransform(welt[i]);
        ctx.fillStyle = a.farbe;
        ctx.fillRect(0, -12, a.laenge, 24);
    });
    // Tastpunkte zur Kontrolle in Weltkoordinaten zeichnen
    ctx.resetTransform();
    ctx.fillStyle = '#b6163d';
    arme.forEach((a, i) => {
        for (const p of tastpunkte(a)) {
            const w = welt[i].transformPoint(p);
            ctx.beginPath();
            ctx.arc(w.x, w.y, 4, 0, 2 * Math.PI);
            ctx.fill();
        }
    });
    ctx.fillStyle = '#193058';
    ctx.font = '16px monospace';
    ctx.fillText(`Umkehrungen: ${umkehrungen}`, 20, 30);
    requestAnimationFrame(loop);
}
berechne();
requestAnimationFrame(loop);
