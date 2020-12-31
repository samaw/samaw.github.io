import * as functions from "https://samaw.github.io/Interactive-webapp/modules/functions.mjs";
import * as interactive from "https://samaw.github.io/Interactive-webapp/modules/interactive.js";

globalThis.functions = functions;
globalThis.interactive = interactive;

const { nChooseK, diceValueProbability, parseURLHash, Noise } = functions;
const { Draw, Controls, keyMap } = interactive;
//...

let seed = parseURLHash(location.hash.slice(1)) || 'consistency';
window.addEventListener('hashchange', () => { seed = parseURLHash(location.hash.slice(1)); }, false);
//...
let draw = new Draw;
class Vector {
    constructor(e1, e2) {
        this.e1 = e1;
        this.e2 = e2;
        Object.freeze(this);
    }
    static of(e1, e2) {
        return Reflect.construct(Vector, [e1, e2]);
    }
    static from(that) {
        return Array.isArray(that) ? Reflect.construct(Vector, that) : Vector.of(that?.e1, that?.e2);
    }
    add(that) {
        return Vector.of(this.e1 + that.e1, this.e2 + that.e2);
    }
    get aInv() {
        return Vector.of(-this.e1, -this.e2);
    }
    scale(that) {
        return Vector.of(this.e1 * that, this.e2 * that);
    }
    dist(that) {
        let vec = that ? that.add(this.aInv) : this;
        return Math.sqrt(vec.e1 ** 2 + vec.e2 ** 2);
    }
}
class PointMass {
    constructor({ position, velocity, dampening = 0.999, mass = 1, color = '#ffffff' } = {}) {
        this.pos = position;
        this.vel = velocity;
        this.damp = dampening;
        this.mass = mass;
        this.massInv = 1 / mass;
        this.color = color;
    }
    static of({ position, velocity, mass, color, dampening } = {}) {
        return Reflect.construct(PointMass, [{ position, velocity, mass, color, dampening }]);
    }
    integrate(time, acceleration) {
        const classThis = this;
        let position = this.pos.add(this.vel.scale(time));
        let velocity = this.vel.scale(this.damp ** time).add(acceleration.scale(time));
        return PointMass.of({
            mass: classThis.mass,
            color: classThis.color,
            dampening: classThis.damp,
            position,
            velocity,
        });
    }
}
let testLoop00 = (particle, controller, noise) => () => {
    let [x, y] = [Math.round(noise.nextInSequence() * 2 - 1), Math.round(noise.nextInSequence() * 2 - 1)];
    let nudge = new Vector((controller.axes(keyMap.get('rightLeft')) || x) * 3, (controller.axes(keyMap.get('upDown')) || y) * -3)
    particle.pos = particle.pos.add(nudge);
    draw.fillStyle = controller.pressed(keyMap.get('fire')) ? 'rgb(200,100,100)' :
        controller.pressed(keyMap.get('confirm')) ? 'rgb(100,200,100)' :
            controller.pressed(keyMap.get('cancel')) ? 'rgb(100,100,100)' :
                'rgb(200,200,200)';
    draw.clear();
    draw.point(particle.pos, 4);
    window.requestAnimationFrame(testLoop00(particle, controller, noise));
}
window.requestAnimationFrame(testLoop00(new PointMass({ position: new Vector(0, 0) }), new Controls, new Noise(seed)))
