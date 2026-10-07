// main.mjs 
const SVG_NS = 'http://www.w3.org/2000/svg';
window.onload = () => {
    const svg = document.getElementById('szene');

    for (let i = 0; i < 5; i++) {
        // Jeder Kreis ist ein eigenes DOM-Objekt 
        const kreis = document.createElementNS(SVG_NS, 'circle');
        kreis.setAttribute('cx', 330 + i * 55);
        kreis.setAttribute('cy', 110);
        kreis.setAttribute('r', 22);
        kreis.setAttribute('fill', '#193058');
        svg.append(kreis);

        // Hit-Testing übernimmt der Browser 
        kreis.addEventListener('click', () => {
            kreis.setAttribute('fill', '#b6163d'); // nur Attribut ändern, 
        });                                        // Browser zeichnet neu 
    }

};