// 09_uebung3.mjs — Übung 3: Raumschiff (Vorlage)
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Schiff, zeigt im lokalen System nach +x
const FORM = new Path2D('M 22 0 L -14 -12 L -7 0 L -14 12 Z');
const START = new DOMMatrix().translate(150, 380).rotate(-90);
let schiff = DOMMatrix.fromMatrix(START);  // lokal → Welt
const spur = [];  // bisherige Lagen

function draw() {
    spur.push(DOMMatrix.fromMatrix(schiff));  // Kopie merken
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#c8ccd4';
    for (const m of spur) {
        ctx.setTransform(m);
        ctx.fill(FORM);
    }
    ctx.setTransform(schiff);
    ctx.fillStyle = '#00aadc';
    ctx.fill(FORM);
    ctx.resetTransform();
}

function drehen(grad) {
    // TODO 1: um die eigene Achse drehen
}
function schub(px) {
    // TODO 2: px Pixel in Flugrichtung bewegen
}
function wind(px) {
    // TODO 3: px Pixel nach rechts schieben (Weltsystem),
    //         egal wohin das Schiff zeigt
}

const aktionen = {
    links: () => drehen(-15), rechts: () => drehen(15),
    schub: () => schub(50), wind: () => wind(50),
    reset: () => {
        schiff = DOMMatrix.fromMatrix(START);
        spur.length = 0;
    },
};
for (const [id, f] of Object.entries(aktionen)) {
    const knopf = document.getElementById(id);
    knopf.addEventListener('click', () => { f(); draw(); });
}
draw();
