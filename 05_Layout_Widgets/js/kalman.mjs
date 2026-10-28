// kalman.mjs — Kalman-Filter für eine Koordinate
//
// Zustand: Position p und Geschwindigkeit v, Unsicherheit als
// Kovarianzmatrix P = [[p00, p01], [p01, p11]].
// Modell: konstante Geschwindigkeit, zufällige Beschleunigung.
//   q: Prozessrauschen — wie stark darf die Bewegung abweichen?
//      klein: glatt, aber träge in Kurven; groß: folgt, zittert
//   r: Messrauschen — Varianz der Messung in px² (4 px → 16)

export class Kalman1D {
    constructor(q, r) {
        this.q = q;
        this.r = r;
        this.bereit = false;
    }

    reset() { this.bereit = false; }

    // eine Messung z, dt Millisekunden nach der vorigen
    schritt(z, dt) {
        if (!this.bereit) {             // erste Messung: Start
            this.p = z; this.v = 0;
            this.p00 = this.r; this.p01 = 0; this.p11 = 1;
            this.bereit = true;
            return;
        }
        // 1. Vorhersage: p += v · dt, Unsicherheit wächst
        const { q } = this;
        this.p += this.v * dt;
        const p00 = this.p00 + 2 * dt * this.p01
            + dt * dt * this.p11 + q * dt ** 3 / 3;
        const p01 = this.p01 + dt * this.p11 + q * dt * dt / 2;
        const p11 = this.p11 + q * dt;
        // 2. Korrektur: Messung und Vorhersage gewichtet mischen
        const s = p00 + this.r;       // Unsicherheit der Differenz
        const k0 = p00 / s, k1 = p01 / s; // Kalman-Verstärkung
        const y = z - this.p;            // Abweichung der Messung
        this.p += k0 * y;
        this.v += k1 * y;
        this.p00 = (1 - k0) * p00;
        this.p01 = (1 - k0) * p01;
        this.p11 = p11 - k1 * p01;
    }

    // Position h Millisekunden nach der letzten Messung
    vorhersage(h) { return this.p + this.v * h; }
}
