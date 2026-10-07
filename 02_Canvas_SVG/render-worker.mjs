// render-worker.mjs — eigener Thread: nur Zustand + Zeichnen
let ctx, width, height;
const balls = [];
const radius = 6;

self.onmessage = (e) => {
    const msg = e.data;
    if (msg.type === 'init') {
        width = msg.canvas.width;
        height = msg.canvas.height;
        ctx = msg.canvas.getContext('2d');
        for (let i = 0; i < 200; i++) spawn(radius + Math.random() * (width - 2 * radius), radius + Math.random() * (height - 2 * radius), '#00aadc');
        self.postMessage('bereit');
        requestAnimationFrame(loop);   // rAF gibt es auch im Worker
    } else if (msg.type === 'spawn') {
        spawn(msg.x, msg.y, 'red');
    }
};

function spawn(x, y, color) {
    balls.push({ x, y, vx: (Math.random() - 0.5) * 300, vy: (Math.random() - 0.5) * 300, color });
}

let last = 0;
function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    for (const b of balls) {            // update
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.x < radius || b.x > width - radius) b.vx = -b.vx;
        if (b.y < radius || b.y > height - radius) b.vy = -b.vy;
    }
    ctx.clearRect(0, 0, width, height); // draw
    for (const b of balls) {
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, radius, 0, 2 * Math.PI);
        ctx.fill();
    }
    requestAnimationFrame(loop);
}
