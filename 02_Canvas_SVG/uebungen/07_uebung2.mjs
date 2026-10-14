// 07_uebung2.mjs — Übung 2: Ladekreis (Vorlage)
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const DAUER = 5;  // Sekunden bis 100 %
let fortschritt = 0;  // 0 … 1
let drehung = 0;  // Winkel des Spinners in rad
let last = performance.now();

function update(dt) {
    // TODO 1: fortschritt in DAUER Sekunden von 0 auf 1,
    //         danach wieder ab 0
    // TODO 2: drehung: eine volle Umdrehung pro Sekunde
}

function draw() {
    // TODO 3: Canvas löschen
    // TODO 4: grauer Ring (Radius 120, lineWidth 20)
    // TODO 5: blauer Bogen ab 12 Uhr,
    //         Länge = fortschritt × Vollkreis
    // TODO 6: Prozentzahl in die Mitte, darunter Spinner
    //         (Viertelbogen, Radius 25, gedreht um drehung)
}

function loop(now) {
    // TODO 7: dt in Sekunden (höchstens 0.05), update, draw,
    //         nächsten Frame anfordern
}
requestAnimationFrame(loop);
