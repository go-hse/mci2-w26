// 02_main_settransform.mjs — transform() vs. setTransform()
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#00aadc';

for (let i = 0; i < 3; i++) {
    ctx.transform(1, 0, 0, 1, 80, 0);  // wird aufmultipliziert
    ctx.fillRect(0, 40, 50, 50);  // → x = 80, 160, 240
}
ctx.resetTransform();  // zurück zur Einheitsmatrix

for (let i = 0; i < 3; i++) {
    ctx.setTransform(1, 0, 0, 1, 80, 0);  // ersetzt die Matrix
    ctx.fillRect(0, 160, 50, 50);  // → immer x = 80
}

const m = new DOMMatrix().translate(460, 300).rotate(45);
ctx.setTransform(m);  // DOMMatrix übergeben
ctx.fillStyle = '#b6163d';
ctx.fillRect(-35, -35, 70, 70);

ctx.resetTransform();
ctx.fillStyle = '#193058';
ctx.font = '18px sans-serif';
ctx.fillText('3 × transform(1, 0, 0, 1, 80, 0)', 340, 72);
ctx.fillText('3 × setTransform(1, 0, 0, 1, 80, 0)', 160, 192);
ctx.fillText('setTransform(DOMMatrix)', 20, 300);
