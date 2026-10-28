// 02_uebung1.mjs — Übung 1: VerticalLayout (Vorlage)
import { Layout, HorizontalLayout } from '../js/layout.mjs';
import { Anzeige, Button } from '../js/widgets.mjs';
import { verbindeZeiger } from '../js/zeiger.mjs';

class MeinVerticalLayout extends Layout {
    anordnen() {
        const { x, y, w, h } = this.rect;
        const a = this.abstand, n = this.kinder.length;
        // TODO 1: Summe der Gewichte bilden
        // TODO 2: freie Höhe = h minus (n + 1) Abstände
        // TODO 3: Kinder untereinander setzen; Höhe je Kind:
        //         frei · gewicht / Summe, Breite: w − 2 Abstände
    }
}

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let klicks = 0;

const spalte = new MeinVerticalLayout({ abstand: 8 })
    .add(new Anzeige(() => `Klicks: ${klicks}`), 1)
    .add(new Button('+1', () => klicks++), 2)
    .add(new Button('Null', () => { klicks = 0; }), 1);
const wurzel = new HorizontalLayout({ abstand: 8 })
    .add(spalte, 1)
    .add(new Anzeige(() => 'Gewichte links: 1 : 2 : 1'), 2);

wurzel.set(0, 0, canvas.width, canvas.height);
verbindeZeiger(canvas, wurzel);

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    wurzel.draw(ctx);
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
