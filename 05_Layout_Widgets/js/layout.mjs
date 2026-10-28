// layout.mjs — Layout-Baum: Container teilen ihre Fläche auf

export class Layout {
    static rahmen = false;   // Hilfsrahmen zum Debuggen

    constructor({ abstand = 0 } = {}) {
        this.kinder = [];        // [{ kind, gewicht }]
        this.abstand = abstand;  // in CSS-Pixeln
        this.rect = { x: 0, y: 0, w: 0, h: 0 };
    }

    add(kind, gewicht = 1) {
        this.kinder.push({ kind, gewicht });
        return this;             // erlaubt Verkettung
    }

    set(x, y, w, h) {
        this.rect = { x, y, w, h };
        this.anordnen();
    }

    anordnen() { }               // in Unterklassen

    draw(ctx) {
        for (const { kind } of this.kinder) kind.draw(ctx);
        if (Layout.rahmen) {
            const { x, y, w, h } = this.rect;
            ctx.strokeStyle = '#b6163d';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
            ctx.setLineDash([]);
        }
    }

    // alle Widgets in Zeichenreihenfolge (rekursiv)
    *widgets() {
        for (const { kind } of this.kinder) {
            if (kind instanceof Layout) yield* kind.widgets();
            else yield kind;
        }
    }
}

// Breite nach Gewichten aufteilen, Höhe voll ausnutzen
export class HorizontalLayout extends Layout {
    anordnen() {
        const { x, y, w, h } = this.rect;
        const a = this.abstand, n = this.kinder.length;
        const summe = this.kinder
            .reduce((s, k) => s + k.gewicht, 0);
        const frei = w - a * (n + 1);  // ohne Abstände
        let px = x + a;
        for (const { kind, gewicht } of this.kinder) {
            const kw = frei * gewicht / summe;
            kind.set(px, y + a, kw, h - 2 * a);
            px += kw + a;
        }
    }
}

// Höhe nach Gewichten aufteilen, Breite voll ausnutzen
export class VerticalLayout extends Layout {
    anordnen() {
        const { x, y, w, h } = this.rect;
        const a = this.abstand, n = this.kinder.length;
        const summe = this.kinder
            .reduce((s, k) => s + k.gewicht, 0);
        const frei = h - a * (n + 1);
        let py = y + a;
        for (const { kind, gewicht } of this.kinder) {
            const kh = frei * gewicht / summe;
            kind.set(x + a, py, w - 2 * a, kh);
            py += kh + a;
        }
    }
}

// quer: nebeneinander, hoch: untereinander
export class ToggleLayout extends Layout {
    constructor({ abstand = 0, verhaeltnis = 1 } = {}) {
        super({ abstand });
        this.verhaeltnis = verhaeltnis;  // Schwelle w/h
        this.quer = true;
    }

    anordnen() {
        const { w, h } = this.rect;
        this.quer = w > h * this.verhaeltnis;
        const Art = this.quer ? HorizontalLayout : VerticalLayout;
        // Methode der passenden Klasse mit this aufrufen
        Art.prototype.anordnen.call(this);
    }
}
