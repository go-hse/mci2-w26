// 01_main_gettransform.mjs — die aktuelle Matrix auslesen
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

ctx.translate(150, 150);
ctx.rotate(Math.PI / 6);  // 30°
ctx.scale(2, 2);
const m = ctx.getTransform();  // Kopie der aktuellen Matrix

ctx.fillStyle = '#00aadc';
ctx.fillRect(-20, -10, 40, 20);  // lokal um (0, 0) gezeichnet

ctx.resetTransform();  // Text ohne Transformation
ctx.fillStyle = '#193058';
ctx.font = '20px monospace';
const z = (v) => v.toFixed(3).padStart(7);
ctx.fillText(`a = ${z(m.a)}  c = ${z(m.c)}`, 300, 110);
ctx.fillText(`b = ${z(m.b)}  d = ${z(m.d)}`, 300, 145);
ctx.fillText(`e = ${z(m.e)}  f = ${z(m.f)}`, 300, 180);
console.log(m.toString());
// matrix(1.732, 1, -1, 1.732, 150, 150)
