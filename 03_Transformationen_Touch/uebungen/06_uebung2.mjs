// 06_uebung2.mjs — Übung 2: Bedienfeld (Vorlage)
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Panel: verschoben, um -20° gedreht, 1,5-fach vergrößert
const PANEL = new DOMMatrix()
    .translate(300, 200).rotate(-20).scale(1.5);
const knoepfe = [  // lokale Koordinaten!
    { x: -95, y: -20, w: 50, h: 40, text: 'A', an: false },
    { x: -25, y: -20, w: 50, h: 40, text: 'B', an: false },
    { x: 45, y: -20, w: 50, h: 40, text: 'C', an: false },
];

function draw() {
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(PANEL);
    ctx.fillStyle = '#193058';
    ctx.fillRect(-110, -35, 220, 70);
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const k of knoepfe) {
        ctx.fillStyle = k.an ? '#b6163d' : '#00aadc';
        ctx.fillRect(k.x, k.y, k.w, k.h);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(k.text, k.x + k.w / 2, k.y + k.h / 2);
    }
    ctx.resetTransform();
}
draw();

canvas.addEventListener('pointerdown', (e) => {
    // TODO 1: inverse Matrix des Panels bilden
    //         (PANEL selbst nicht verändern!)
    // TODO 2: Zeigerposition (e.offsetX, e.offsetY) ins lokale
    //         System des Panels umrechnen
    // TODO 3: getroffenen Knopf suchen und 'an' umschalten
    // TODO 4: neu zeichnen
});
