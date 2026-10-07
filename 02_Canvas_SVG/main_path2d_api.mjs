// main_path2d_api.mjs — Path2D-Befehle an vier kleinen Beispielen
const blau = '#00aadc';
const dunkel = '#193058';
const rot = '#b6163d';
const kontext = (id) => document.getElementById(id).getContext('2d');

// ---------- 1. Path2D erzeugen ----------
{
    const ctx = kontext('c1');
    const p = new Path2D();  // leer, dann Pfadbefehle
    p.rect(20, 20, 120, 80);
    p.moveTo(260, 60);  // neuer Subpfad, sonst Linie
    p.arc(220, 60, 40, 0, 2 * Math.PI);

    // aus SVG-Pfaddaten
    const dreieck = new Path2D('M 300 100 L 340 20 L 380 100 Z');

    const kopie = new Path2D(p);  // Kopie eines anderen Pfads
    kopie.roundRect(420, 20, 140, 80, 16);  // nur die Kopie wächst

    ctx.fillStyle = blau;
    ctx.fill(p);
    ctx.fill(dreieck);
    ctx.translate(0, 130);  // wirkt erst beim Zeichnen
    ctx.lineWidth = 4;
    ctx.strokeStyle = dunkel;
    ctx.stroke(kopie);
}

// ---------- 2. SVG-Pfaddaten ----------
{
    const ctx = kontext('c2');
    const herz = new Path2D(
        'M 80 70 C 80 40 30 40 30 75 C 30 110 80 130 80 150 ' +
        'C 80 130 130 110 130 75 C 130 40 80 40 80 70 Z');
    const haus = new Path2D(
        'M 180 150 V 90 L 230 50 L 280 90 V 150 Z' +  // Umriss
        'm 35 0 v -35 h 30 v 35');  // Tür, relativ
    const welle = new Path2D('M 320 100 q 25 -50 50 0 t 50 0 t 50 0');
    const bogen = new Path2D('M 330 220 A 60 40 0 0 1 510 220');

    ctx.fillStyle = rot;
    ctx.fill(herz);
    ctx.lineWidth = 4;
    ctx.strokeStyle = dunkel;
    ctx.stroke(haus);
    ctx.strokeStyle = blau;
    ctx.stroke(welle);
    ctx.stroke(bogen);
}

// ---------- 3. addPath mit DOMMatrix ----------
{
    const ctx = kontext('c3');
    const blatt = new Path2D('M 0 0 Q 30 -40 0 -90 Q -30 -40 0 0 Z');
    const bluete = new Path2D();
    for (let i = 0; i < 8; i++) {
        const m = new DOMMatrix().rotate(i * 45);  // Achtung: Grad!
        bluete.addPath(blatt, m);
    }
    ctx.fillStyle = blau;
    ctx.translate(150, 130);
    ctx.fill(bluete);  // eine Blüte, ein Aufruf
    ctx.translate(300, 0);
    ctx.scale(0.6, 0.6);
    ctx.fill(bluete);  // dieselbe Blüte, kleiner
}

// ---------- 4. Füllregel und Hit-Testing ----------
const ctx4 = kontext('c4');
const ring = new Path2D();
ring.arc(150, 130, 90, 0, 2 * Math.PI);
ring.moveTo(195, 130);  // Innenkreis: eigener Subpfad
ring.arc(150, 130, 45, 0, 2 * Math.PI);

function zeichne4(punkte) {
    ctx4.clearRect(0, 0, 600, 260);
    ctx4.fillStyle = blau;
    ctx4.fill(ring, 'evenodd');  // Loch in der Mitte
    ctx4.translate(300, 0);
    ctx4.fill(ring);  // Standard: 'nonzero'
    ctx4.setTransform(1, 0, 0, 1, 0, 0);
    ctx4.font = '16px sans-serif';
    ctx4.fillStyle = dunkel;
    ctx4.fillText("'evenodd'", 20, 25);
    ctx4.fillText("'nonzero' (Standard)", 320, 25);
    ctx4.lineWidth = 6;
    for (const [x, y] of punkte) {
        const innen = ctx4.isPointInPath(ring, x, y, 'evenodd');
        const rand  = ctx4.isPointInStroke(ring, x, y);  // nutzt lineWidth
        ctx4.fillStyle = innen ? rot : dunkel;
        ctx4.beginPath();
        ctx4.arc(x, y, 5, 0, 2 * Math.PI);
        ctx4.fill();
        ctx4.font = '14px sans-serif';
        ctx4.fillText(`Pfad ${innen}, Rand ${rand}`, x + 10, y + 5);
    }
}
const punkte = [[150, 130], [150, 62], [150, 220]];
zeichne4(punkte);
document.getElementById('c4').addEventListener('pointerdown', (e) => {
    punkte.push([e.offsetX, e.offsetY]);
    zeichne4(punkte);
});
