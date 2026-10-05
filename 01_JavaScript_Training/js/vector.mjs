// js/vector.mjs 
export default class Vector2 {
    constructor(x = 0, y = 0) { this.x = x; this.y = y; }
}
export function add(a, b) {
    return new Vector2(a.x + b.x, a.y + b.y);
}

