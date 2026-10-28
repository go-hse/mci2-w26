// greifflaeche.mjs — Fläche mit greifbarer Figur (Woche 4)
import { Widget } from './widgets.mjs';

const U = new Path2D(
    'M -2 -2 L -2 2 L -1 2 L -1 -1 L 1 -1 L 1 2 L 2 2 L 2 -2 Z');
// eigener Kontext nur für Hit-Tests
const TEST = new OffscreenCanvas(1, 1).getContext('2d');

export class Greifflaeche extends Widget {
    constructor() {
        super();
        this.reset();
    }

    reset() {  // Lage relativ zur Fläche (Einheiten 0 … 20)
        this.relativ = new DOMMatrix().translate(10, 10);
        this.griff = null;
    }

    // Fläche → Welt: an die Ecke, 1 Einheit = kürzere Kante / 20
    basis() {
        const { x, y, w, h } = this.rect;
        const einheit = Math.min(w, h) / 20;
        return new DOMMatrix().translate(x, y).scale(einheit);
    }

    welt() { return this.basis().multiply(this.relativ); }

    set(x, y, w, h) {
        super.set(x, y, w, h);
        this.einpassen();  // nach Größenänderung sichtbar halten
    }

    // Mittelpunkt der Figur in die Fläche holen
    einpassen() {
        const { x, y, w, h } = this.rect;
        const c = this.welt().transformPoint({ x: 0, y: 0 });
        const cx = Math.min(x + w, Math.max(x, c.x));
        const cy = Math.min(y + h, Math.max(y, c.y));
        const T = new DOMMatrix().translate(cx - c.x, cy - c.y);
        const welt = T.multiply(this.welt());  // Weltverschiebung
        this.relativ = this.basis().inverse().multiply(welt);
    }

    down(p, id) {
        if (this.griff) return false;
        const lokal = this.welt().inverse().transformPoint(p);
        if (!TEST.isPointInPath(U, lokal.x, lokal.y)) return false;
        const T = new DOMMatrix().translate(p.x, p.y);
        this.griff = { id, p: T.inverse().multiply(this.welt()) };
        return true;
    }

    move(p, id) {
        if (this.griff?.id !== id) return;
        const T = new DOMMatrix().translate(p.x, p.y);
        const welt = T.multiply(this.griff.p);         // L = T · P
        this.relativ = this.basis().inverse().multiply(welt);
    }

    up(p, id) { if (this.griff?.id === id) this.griff = null; }
    cancel(id) { if (this.griff?.id === id) this.griff = null; }

    draw(ctx) {
        const { x, y, w, h } = this.rect;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, w, h);
        const basis = ctx.getTransform();  // enthält dpr-Faktor
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();  // nicht über den Rand malen
        ctx.setTransform(basis.multiply(this.welt()));
        ctx.fillStyle = this.griff ? '#b6163d' : '#00aadc';
        ctx.fill(U);
        ctx.restore();
    }
}
