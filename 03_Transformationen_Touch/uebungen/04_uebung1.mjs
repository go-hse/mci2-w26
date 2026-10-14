// 04_uebung1.mjs — Übung 1: Laser (Vorlage)
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const ZIEL = { x: 540, y: 60 };

function loop(now) {
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#b6163d';  // Ziel
    ctx.beginPath();
    ctx.arc(ZIEL.x, ZIEL.y, 10, 0, 2 * Math.PI);
    ctx.fill();

    // Geschütz lokal: Rohr zeigt nach +x, Mündung bei (70, 0)
    ctx.translate(120, 320);
    ctx.rotate(-Math.PI / 4 + 0.8 * Math.sin(now / 1000));
    ctx.fillStyle = '#193058';
    ctx.fillRect(-20, -20, 40, 40);
    ctx.fillRect(0, -6, 70, 12);

    // TODO 1: aktuelle Matrix holen
    // TODO 2: Mündung (70, 0) ins Weltsystem umrechnen
    // TODO 3: Transformation zurücksetzen
    // TODO 4: Laser von der Mündung zum ZIEL zeichnen,
    //         Koordinaten der Mündung als Text ausgeben

    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
