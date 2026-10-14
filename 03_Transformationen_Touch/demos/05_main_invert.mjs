// 05_main_invert.mjs — Hit-Testing mit der inversen Matrix
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

const objekte = [
    { x: 160, y: 200, w: 160, h: 60, s: 1.0, omega: 0.6 },
    { x: 360, y: 200, w: 100, h: 100, s: 1.2, omega: -0.4 },
    { x: 560, y: 200, w: 120, h: 40, s: 1.6, omega: 0.9 },
];

let zeiger = { x: -1, y: -1 };

function matrix(o, t) {  // lokal → Welt
    return new DOMMatrix().translate(o.x, o.y)
        .rotate(o.omega * t * 180 / Math.PI)  // in Grad!
        .scale(o.s);
}

function getroffen(o, m) {  // Welt → lokal
    const inv = m.inverse();  // Kopie, m bleibt
    const p = inv.transformPoint(zeiger);
    const innen = Math.abs(p.x) <= o.w / 2 && Math.abs(p.y) <= o.h / 2;
    return innen ? p : null;
}

function loop(now) {
    const t = now / 1000;
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let text = 'kein Treffer';
    for (const o of objekte) {
        const m = matrix(o, t);
        const lokal = getroffen(o, m);
        ctx.setTransform(m);
        ctx.fillStyle = lokal ? '#b6163d' : '#00aadc';
        ctx.fillRect(-o.w / 2, -o.h / 2, o.w, o.h);
        if (lokal) {
            const x = lokal.x.toFixed(1), y = lokal.y.toFixed(1);
            text = `lokal: (${x}, ${y})`;
        }
    }
    info.textContent = text;
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

canvas.addEventListener('pointermove', (e) => {
    zeiger = { x: e.offsetX, y: e.offsetY };
});
