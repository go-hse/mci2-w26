// 01_main_layout.mjs — Layout-Baum mit Widgets, Touch und Maus
import {
    Layout, HorizontalLayout, VerticalLayout, ToggleLayout,
} from '../js/layout.mjs';
import { Anzeige, Button, Schalter } from '../js/widgets.mjs';
import { Greifflaeche } from '../js/greifflaeche.mjs';
import { verbindeZeiger } from '../js/zeiger.mjs';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// --- Widgets
const flaeche = new Greifflaeche();
const uhr = new Anzeige(() =>
    new Date().toLocaleTimeString('de-DE'));
const info = new Anzeige(() => `${canvas.clientWidth} × ` +
    `${canvas.clientHeight} px, dpr ${devicePixelRatio}`);
const vollbild = new Schalter('Vollbild', (an) => {
    if (an) {
        document.documentElement.requestFullscreen().catch(() => { });
    } else if (document.fullscreenElement) {
        document.exitFullscreen();
    }
});
const rahmen = new Schalter('Rahmen', (an) => {
    Layout.rahmen = an;
});
const reset = new Button('Reset', () => flaeche.reset());

// --- Layout-Baum
const knoepfe = new ToggleLayout({ abstand: 4, verhaeltnis: 2 })
    .add(vollbild).add(rahmen).add(reset);
const menue = new HorizontalLayout({ abstand: 4 })
    .add(uhr, 2).add(info, 4).add(knoepfe, 5);
const wurzel = new VerticalLayout({ abstand: 6 })
    .add(menue, 1).add(flaeche, 6);

verbindeZeiger(canvas, wurzel);

// --- Größe und HiDPI (Woche 2)
let dpr = 1;
function resize() {
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    // Layout rechnet in CSS-Pixeln
    wurzel.set(0, 0, canvas.clientWidth, canvas.clientHeight);
}
new ResizeObserver(resize).observe(canvas);

function loop() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);  // Basis: CSS-px
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    wurzel.draw(ctx);
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
