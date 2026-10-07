// main_worker.mjs — Haupt-Thread: DOM, Eingaben, keine Zeichenarbeit
const canvas = document.getElementById('game');
const offscreen = canvas.transferControlToOffscreen();

const worker = new Worker('./render-worker.mjs', { type: 'module' });
worker.postMessage(
    { type: 'init', canvas: offscreen },
    [offscreen]                        // Transfer: Eigentum wechselt
);

// Eingaben bleiben im Haupt-Thread und werden weitergereicht
canvas.addEventListener('pointerdown', (e) => {
    worker.postMessage({ type: 'spawn', x: e.offsetX, y: e.offsetY });
});

worker.onmessage = (e) => console.log('Worker:', e.data);
