// uebung1.mjs — Übung 1: Analoguhr (Vorlage)
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.strokeStyle = '#193058';
ctx.fillStyle = '#193058';

function zeichneUhr(stunden, minuten) {
    // TODO 1: Ursprung in die Mitte (200, 200) verschieben
    // TODO 2: Ziffernblatt: Kreis mit Radius 180, Rand 4 px
    // TODO 3: 12 Striche (6 × 25 px) am Rand, je 30° gedreht
    // TODO 4: Stundenzeiger (Länge 100),
    //         Minutenzeiger (Länge 160)
    // Tipp: save/rotate/restore für jeden Strich und Zeiger
}

zeichneUhr(10, 10);
