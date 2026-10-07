// main_zorder.mjs
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function hintergrund(x) {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(x, 0, 300, 260);
}
function figur(x) {
    ctx.fillStyle = '#00aadc';
    ctx.beginPath();
    ctx.arc(x + 150, 140, 80, 0, 2 * Math.PI);
    ctx.fill();
}
function hud(x) {
    ctx.fillStyle = '#193058';
    ctx.fillRect(x + 20, 30, 260, 50);
    ctx.fillStyle = '#ffffff';
    ctx.font = '28px sans-serif';
    ctx.fillText('Punkte: 42', x + 40, 66);
}

// links: Hintergrund → Figur → HUD (HUD liegt oben)
hintergrund(0);   figur(0);   hud(0);

// rechts: Hintergrund → HUD → Figur (Figur verdeckt HUD)
hintergrund(300); hud(300);   figur(300);
