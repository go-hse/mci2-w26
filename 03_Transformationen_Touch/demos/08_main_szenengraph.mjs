// 08_main_szenengraph.mjs — Welt = Eltern · lokal
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Oberarm, Unterarm, Hand — Winkel in Grad, omega in Grad/s
const arme = [
    { laenge: 160, winkel: 20, omega: 15, farbe: '#193058' },
    { laenge: 120, winkel: 50, omega: -30, farbe: '#00aadc' },
    { laenge: 70, winkel: -40, omega: 60, farbe: '#7fd3ec' },
];
for (const a of arme) a.aktiv = true;
const BASIS = new DOMMatrix().translate(350, 380).rotate(-90);
let welt = [];                        // Weltmatrix je Arm

function berechne() {
    welt = [];
    let m = BASIS;
    for (const a of arme) {
        // im Gelenk drehen: lokal → multiply
        m = m.multiply(new DOMMatrix().rotate(a.winkel));
        welt.push(m);
        // weiter zum Ende des Arms = nächstes Gelenk
        m = m.multiply(new DOMMatrix().translate(a.laenge, 0));
    }
    return m;                         // Matrix der Armspitze
}

let last = performance.now();
function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    for (const a of arme) if (a.aktiv) a.winkel += a.omega * dt;
    const spitze = berechne().transformPoint({ x: 0, y: 0 });

    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    arme.forEach((a, i) => {
        ctx.setTransform(welt[i]);
        ctx.fillStyle = a.aktiv ? a.farbe : '#c8ccd4';
        ctx.fillRect(0, -12, a.laenge, 24);
    });
    ctx.resetTransform();
    ctx.fillStyle = '#b6163d';
    ctx.beginPath();
    ctx.arc(spitze.x, spitze.y, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.font = '16px monospace';
    const x = spitze.x.toFixed(0), y = spitze.y.toFixed(0);
    ctx.fillText(`Spitze: (${x}, ${y})`, 20, 30);
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Antippen: Arm anhalten bzw. weiterlaufen lassen
canvas.addEventListener('pointerdown', (e) => {
    const zeiger = { x: e.offsetX, y: e.offsetY };
    // oberster Arm zuerst
    for (let i = arme.length - 1; i >= 0; i--) {
        const p = welt[i].inverse().transformPoint(zeiger);
        const a = arme[i];
        const imArm = p.x >= 0 && p.x <= a.laenge;
        if (imArm && Math.abs(p.y) <= 12) {
            a.aktiv = !a.aktiv;
            break;
        }
    }
});
