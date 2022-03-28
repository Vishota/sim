const SPEED_MAX = 3;
//INFO
class Info {
    constructor() {
        this.ps = new Array;
        for(let i = 0; i < 10; i++) this.ps.push(new Proton(new Vec2D(Math.random()*window.innerWidth,Math.random()*window.innerHeight), new Vec2D(0,0)));
        for(let i = 0; i < 10; i++) this.ps.push(new Neutron(new Vec2D(Math.random()*window.innerWidth,Math.random()*window.innerHeight), new Vec2D(0,0)));
        for(let i = 0; i < 100; i++) this.ps.push(new Electron(new Vec2D(Math.random()*window.innerWidth,Math.random()*window.innerHeight), new Vec2D(0,0)));//new Vec2D(Math.random(),Math.random())));
    }
    tick(ctx, frtime) {
        this.ps.forEach(el => el.draw(ctx));
        this.ps.forEach(el => el.tick());

        let forces = new Array;
        let keys = Object.keys(this.ps);
        keys.forEach(i=>{forces[i] = new Vec2D(0,0)});
        keys.forEach(i => {
            delete keys[i];
            keys.forEach(j => {
                let force = this.ps[i].interact(this.ps[j]);;
                forces[i] = forces[i].add(force.mult(-1));
                forces[j] = forces[j].add(force);
            });
        });
        keys = Object.keys(this.ps);
        keys.forEach(i=>{
            this.ps[i].accelerate(forces[i]);
        });
        keys.forEach(i => {
            this.ps[i].pos = this.ps[i].pos.add(this.ps[i].speed);
        });
    }
}
class Vec2D {
    draw(ctx, start) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(start.x + this.x, start.y + this.y);
        ctx.stroke();
    }
    add(vec) {
        return new Vec2D(this.x + vec.x, this.y + vec.y);
    }
    subtr(vec) {
        return new Vec2D(this.x - vec.x, this.y - vec.y);
    }
    diff(vec) {
        return new Vec2D(Math.abs(this.x - vec.x), Math.abs(this.y - vec.y));
    }
    mult(val) {
        return new Vec2D(this.x * val, this.y * val);
    }
    scalProd(vec) {
        return this.x * vec.x + this.y * vec.y;
    }
    div(val) {
        if(val==0) {
            console.log("Division by zero (vec2d.div())");
            return this;
        }
        return new Vec2D(this.x / val, this.y / val);
    }
    len() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    norm() {
        return this.div(this.len());
    }
    proj(vec) {
        if(vec.len==0) {
            console.log("Division by zero (vec2d.proj())");
            return vec;
        }
        return this.scalProd(vec) / vec.len();
    }
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
//FORMULES
//PARTICLES
class Particle {
    constructor(pos, speed, mass) {
        this.pos = pos;
        this.speed = speed;
        this.mass = mass;
    }
    tick() {
        if(this.pos.x < 0) this.speed.x = Math.abs(this.speed.x);
        if(this.pos.y < 0) this.speed.y = Math.abs(this.speed.y);
        if(this.pos.x > window.innerWidth) this.speed.x = -Math.abs(this.speed.x);
        if(this.pos.y > window.innerHeight) this.speed.y = -Math.abs(this.speed.y);
    };
    draw(ctx) {};
    interact(p) {};
    accelerate(force) {
        let speed_add = force.div(this.mass).len();
        let tomax = SPEED_MAX - this.speed.len();
        let speed = normalize(speed_add)*tomax;
        this.speed = this.speed.add(force.div(this.mass)).norm().mult(this.speed.len()+speed);
        normalize(this.speed.len());
    }
}
class Subatom extends Particle {
    constructor(pos, charge, mass, speed) {
        super(pos, speed, mass);
        this.charge = charge;
    }
    interact(p) {
        return calcGravity(this.mass, p.mass, this.pos, p.pos).add(calcCoulomb(this.charge, p.charge, this.pos, p.pos));
    };
}
class Proton extends Subatom {
    constructor(pos, speed) {
        super(pos, 1, 1, speed);
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = '#f009';
        ctx.arc(this.pos.x, this.pos.y, 15, 0, Math.PI*2, true);
        ctx.fill();
    }
}
class Neutron extends Subatom {
    constructor(pos, speed) {
        super(pos, 0, 1.0014, speed);
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = '#999d';
        ctx.arc(this.pos.x, this.pos.y, 15, 0, Math.PI*2, true);
        ctx.fill();
    }
}
class Electron extends Subatom {
    constructor(pos, speed) {
        super(pos, -1, 0.000546, speed);
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = '#55fd';
        ctx.arc(this.pos.x, this.pos.y, 5, 0, Math.PI*2, true);
        ctx.fill();
    }
}
//FUNCTIONS
function calcGravity(m1, m2, p1, p2) {
    const G = 1;
    let dist = p1.subtr(p2);
    let r = dist.len();
    return dist.norm().mult(G*m1*m2/r/r);
}
function calcCoulomb(q1, q2, p1, p2) {
    const K = 1;
    let dist = p1.subtr(p2);
    let r = dist.len();
    return dist.norm().mult(-K*q1*q2/r/r);
}

function normalize(val) {
    return Math.atan(val)/Math.PI * 2;
}
function drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
function viewportToPixels(value) {
    var parts = value.match(/([0-9\.]+)(vh|vw)/)
    var q = Number(parts[1])
    var side = window[['innerHeight', 'innerWidth'][['vh', 'vw'].indexOf(parts[2])]]
    return side * (q/100)
}
function switchBuffer(canvas) {
    //returns invisible canvas number
    if(canvas[0].getAttribute("style") == "") {
        canvas[0].setAttribute("style", "display: none");
        canvas[1].setAttribute("style", "");
        return 0;
    }
    else {
        canvas[0].setAttribute("style", "");
        canvas[1].setAttribute("style", "display: none");
        return 1;
    }
}
//MAIN AND PROCESS
function main() {
    let canvas = [document.querySelector('#main1'), document.querySelector('#main2')];
    let ctx = [canvas[0].getContext("2d"), canvas[1].getContext("2d")];
    let info = setup(canvas, ctx);
    process(canvas, ctx, 0, info);
}
function process(canvas, ctx, lastfrtime, info) {
    const FRTIME = 1;
    var start = new Date();
    let buff = switchBuffer(canvas);
    info = loop(canvas[buff], ctx[buff], Math.max(FRTIME, lastfrtime), info);
    var lastfrtime = new Date() - start;
    setTimeout(() => {
        process(canvas, ctx, lastfrtime, info);
    }, Math.max(0, FRTIME - lastfrtime));
}

//CODE
function setup(canvas, ctx) {
    return new Info();
}
function loop(canvas, ctx, frtime, info) {
    //fps
    document.title = 'FPS=' + 1000/frtime;
    //canvas resizing
    canvas.width = viewportToPixels('100vw');
    canvas.height = viewportToPixels('100vh');
    //drawing
    info.tick(ctx, frtime);
    return info;
}