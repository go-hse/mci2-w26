// 03_uebung2.mjs — Übung 2: Button (Vorlage)
import { Widget, Anzeige } from '../js/widgets.mjs';
import { HorizontalLayout, VerticalLayout }
    from '../js/layout.mjs';
import { verbindeZeiger } from '../js/zeiger.mjs';

class MeinButton extends Widget {
    constructor(text, beiKlick) {
        super();
        this.text = text;
        this.beiKlick = beiKlick;
        this.zeiger = null;     // pointerId, der den Knopf hält
        this.gedrueckt = false;    // für die Darstellung
    }

    bedienbar() { return true; }

    down(p, id) {
        // TODO 1: nur annehmen, wenn kein anderer Zeiger
        //         den Knopf hält; Zeiger merken, gedrückt
        //         anzeigen, true zurückgeben
        return false;
    }

    move(p, id) {
        // TODO 2: gedrückt nur, solange der Zeiger drauf ist
    }

    up(p, id) {
        // TODO 3: auslösen nur, wenn derselbe Zeiger noch
        //         auf dem Knopf ist; danach zurücksetzen
    }

    cancel(id) {
        // TODO 4: Zustand zurücksetzen, ohne auszulösen
    }

    draw(ctx) {
        const { x, y, w, h } = this.rect;
        ctx.fillStyle = this.gedrueckt ? '#193058' : '#00aadc';
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 12);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, x + w / 2, y + h / 2);
        super.draw(ctx);
    }
}

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let a = 0, b = 0;

const wurzel = new VerticalLayout({ abstand: 10 })
    .add(new Anzeige(() => `A: ${a}   B: ${b}`), 1)
    .add(new HorizontalLayout({ abstand: 10 })
        .add(new MeinButton('A', () => a++))
        .add(new MeinButton('B', () => b++)), 2);
wurzel.set(0, 0, canvas.width, canvas.height);
verbindeZeiger(canvas, wurzel);

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    wurzel.draw(ctx);
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
