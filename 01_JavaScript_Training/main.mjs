// main.mjs 
import Vector2, { add } from './js/vector.mjs';
import * as funcs from './js/funcs.mjs';


window.onload = () => {
    const touch = { id: 7, x: 120, y: 80, force: 0.9 };

    const { x, y, ...rest } = touch;  // rest = { id: 7, force: 0.9 } 
    const [first, second = null] = [touch, ];  // mit Default 

    console.log(first, second);
};

