// 07_main_multiply.mjs — multiplySelf vs. preMultiplySelf
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Pfeil, zeigt im lokalen System nach +x
const PFEIL = new Path2D('M -45 -25 L 45 0 L -45 25 Z');

function zeichne(m, farbe) {
    ctx.setTransform(m);
    ctx.fillStyle = farbe;
    ctx.fill(PFEIL);
}

// Beispiel 1: Verschiebung um 120 px in x-Richtung
const start = new DOMMatrix().translate(150, 150).rotate(30);
const T = new DOMMatrix().translate(120, 0);
const lokal = DOMMatrix.fromMatrix(start).multiplySelf(T);  // start·T
const welt = DOMMatrix.fromMatrix(start).preMultiplySelf(T); // T·start
zeichne(start, '#c8ccd4');
zeichne(lokal, '#00aadc');  // entlang der eigenen Richtung
zeichne(welt, '#b6163d');   // waagrecht (Weltachse)

// Beispiel 2: Drehung um 20°
const start2 = new DOMMatrix().translate(560, 250);
const R = new DOMMatrix().rotate(20);
const lokal2 = DOMMatrix.fromMatrix(start2).multiplySelf(R);
const welt2 = DOMMatrix.fromMatrix(start2).preMultiplySelf(R);
zeichne(start2, '#c8ccd4');
zeichne(lokal2, '#00aadc');  // dreht auf der Stelle
zeichne(welt2, '#b6163d');   // dreht um den Weltursprung (0, 0)

ctx.resetTransform();
ctx.fillStyle = '#193058';
ctx.font = '16px sans-serif';
ctx.fillText('grau: Start', 20, 30);
ctx.fillText('blau: multiplySelf', 140, 30);
ctx.fillText('rot: preMultiplySelf', 320, 30);
ctx.fillText('translate(120, 0)', 60, 330);
ctx.fillText('rotate(20)', 600, 200);
