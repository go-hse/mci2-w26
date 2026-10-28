// widgets.mjs — Bedienelemente mit gemeinsamer Schnittstelle

// Mindestgrößen für Touch-Ziele in CSS-Pixeln
export const MIN_PFLICHT = 24;     // WCAG 2.5.8 (AA)
export const MIN_EMPFEHLUNG = 44;  // WCAG 2.5.5 (AAA), Apple HIG

export class Widget {
    constructor() {
        this.rect = { x: 0, y: 0, w: 0, h: 0 };
    }

    set(x, y, w, h) { this.rect = { x, y, w, h }; }

    hit(p) {
        const { x, y, w, h } = this.rect;
        return p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h;
    }

    // Zeiger-Schnittstelle; down() gibt true zurück = übernommen
    down(p, id) { return false; }
    move(p, id) { }
    up(p, id) { }
    cancel(id) { }

    draw(ctx) { this.warnung(ctx); }

    bedienbar() { return false; }  // nur Bedienelemente prüfen

    warnung(ctx) {  // zu kleine Touch-Ziele markieren
        if (!this.bedienbar()) return;
        const { x, y, w, h } = this.rect;
        const kante = Math.min(w, h);
        if (kante >= MIN_EMPFEHLUNG) return;
        const rot = kante < MIN_PFLICHT;
        ctx.strokeStyle = rot ? '#b6163d' : '#e08a00';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);
    }
}

export class Anzeige extends Widget {
    constructor(text) {                 // text: Funktion → String
        super();
        this.text = text;
    }

    draw(ctx) {
        const { x, y, w, h } = this.rect;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#193058';
        ctx.font = `${Math.min(18, h * 0.4)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text(), x + w / 2, y + h / 2, w - 8);
        super.draw(ctx);
    }
}

// Knopf: löst beim Loslassen aus, nur wenn der Zeiger drauf ist
export class Button extends Widget {
    constructor(text, beiKlick) {
        super();
        this.text = text;
        this.beiKlick = beiKlick;
        this.zeiger = null;  // pointerId, der den Knopf hält
        this.gedrueckt = false;
    }

    bedienbar() { return true; }

    down(p, id) {
        if (this.zeiger !== null) return false;
        this.zeiger = id;
        this.gedrueckt = true;
        return true;
    }

    move(p, id) {                       // wegziehen = abbrechen
        if (id === this.zeiger) this.gedrueckt = this.hit(p);
    }

    up(p, id) {
        if (id !== this.zeiger) return;
        if (this.hit(p)) this.beiKlick();
        this.zeiger = null;
        this.gedrueckt = false;
    }

    cancel(id) {
        if (id !== this.zeiger) return;
        this.zeiger = null;
        this.gedrueckt = false;
    }

    farbe() { return this.gedrueckt ? '#193058' : '#00aadc'; }

    draw(ctx) {
        const { x, y, w, h } = this.rect;
        ctx.fillStyle = this.farbe();
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, Math.min(w, h) * 0.2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.min(18, h * 0.4)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, x + w / 2, y + h / 2, w - 8);
        super.draw(ctx);
    }
}

// Schalter: ein Button mit Zustand an/aus
export class Schalter extends Button {
    constructor(text, beiAenderung) {
        super(text, () => {
            this.an = !this.an;
            beiAenderung(this.an);
        });
        this.an = false;
    }

    farbe() {
        if (this.gedrueckt) return '#193058';
        return this.an ? '#b6163d' : '#7fa7b8';
    }
}
