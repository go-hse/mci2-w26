// zeiger.mjs — Pointer Events an Widgets verteilen

export function verbindeZeiger(canvas, wurzel) {
    const besitzer = new Map();          // pointerId → Widget
    // Position relativ zur Canvas in CSS-Pixeln
    const pos = (e) => ({ x: e.offsetX, y: e.offsetY });

    canvas.addEventListener('pointerdown', (e) => {
        // zuletzt gezeichnet = oben → rückwärts suchen
        const liste = [...wurzel.widgets()].reverse();
        for (const w of liste) {
            if (w.hit(pos(e)) && w.down(pos(e), e.pointerId)) {
                besitzer.set(e.pointerId, w);
                canvas.setPointerCapture(e.pointerId);
                break;                   // nur ein Empfänger
            }
        }
    });

    canvas.addEventListener('pointermove', (e) => {
        besitzer.get(e.pointerId)?.move(pos(e), e.pointerId);
    });

    canvas.addEventListener('pointerup', (e) => {
        besitzer.get(e.pointerId)?.up(pos(e), e.pointerId);
        besitzer.delete(e.pointerId);
    });

    canvas.addEventListener('pointercancel', (e) => {
        besitzer.get(e.pointerId)?.cancel(e.pointerId);
        besitzer.delete(e.pointerId);
    });
}
