// 05_main_fullscreen.mjs
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Puffer = CSS-Größe × devicePixelRatio
function resize() {
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    // Achtung: setzt Inhalt und Kontext-Zustand zurück
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    // Skalierung neu setzen: ab jetzt in CSS-Pixeln zeichnen

    console.log(`resize: ${width.toFixed(0)}x${height.toFixed(0)}; ${dpr} devicePixelRatio`);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(width, height);
}
new ResizeObserver(resize).observe(canvas);

function draw(w, h) {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#00aadc';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, Math.min(w, h) / 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#193058';
    ctx.font = '20px sans-serif';
    ctx.fillText(`CSS: ${w.toFixed(0)} × ${h.toFixed(0)}   Puffer: ${canvas.width.toFixed(0)} × ${canvas.height.toFixed(0)}`, 20, 40);
}

// Vollbild nur als Reaktion auf eine Nutzeraktion
const button = document.getElementById('vollbild');
button.addEventListener('click', async () => {
    if (document.fullscreenElement) {
        await document.exitFullscreen();
    } else {
        await document.documentElement.requestFullscreen();
    }
});
document.addEventListener('fullscreenchange', () => {
    const aktiv = document.fullscreenElement !== null;
    button.textContent = aktiv ? 'Beenden' : 'Vollbild';
});
