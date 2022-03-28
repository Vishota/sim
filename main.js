//INFO
class Info {
    constructor() {
        this.ps = new Array; //parcticles
        //this.ps.push(new Particle1(new Vec2D(window.innerWidth / 2, 200), 1000, 150, new Vec2D(2, 0),'#00f'));
        /*this.ps.push(new Particle(new Vec2D(400, 600), 1000, 200, new Vec2D(1, -1),'#0f0'));
        this.ps.push(new Particle(new Vec2D(600, 600), 1000, 200, new Vec2D(-1, 0),'#f00'));
        this.ps.push(new Particle(new Vec2D(600, 400), 1000, 200, new Vec2D(0, 1),'#ff0'));*/
        for(let i = 0; i < 10; i++) {
            for(let j = 0; j < 10; j++) {
                this.ps.push(new Particle2(new Vec2D(100 + 20 * i, 100 + 20 * j), 180, 100, new Vec2D(2, 10),'#0005', .9));
            }
        }
        for(let i = 0; i < 5; i++) {
            for(let j = 0; j < 5; j++) {
                this.ps.push(new Particle1(new Vec2D(window.innerWidth - 20 * i, window.innerHeight + 20 * j), 500, 100, new Vec2D(2, 10),'#99f'));
            }
        }
        //this.ps.push(new Particle1(new Vec2D(window.innerWidth/2 , 500), 3000, 200, new Vec2D(-.2, 0),'#0f0'));
    }
    tick(ctx, frtime) {
        let numbers;
        numbers = Object.keys(this.ps);
        numbers.forEach(i => {this.ps[i].draw(ctx)});
        //FORCES
        numbers = Object.keys(this.ps);
        let forces = new Array;
        numbers.forEach(i => {
            forces[i] = new Vec2D(0,0);
        });
        
        numbers.forEach(i => {
            numbers = numbers.filter(f => {return f != i});
            numbers.forEach(j => {
                //FORCES -> INTERACTION
                let interForce = this.ps[i].interact(this.ps[j]);
                forces[i] = forces[i].add(interForce);
                forces[j] = forces[j].subtr(interForce);
            });
            //FORCES -> BOUNDS
            const F_BOUND = 0.01;
        });

        //SPEEDS
        numbers = Object.keys(this.ps);
        numbers.forEach(i => {
            //SPEEDS -> FORCES
            this.ps[i].speed = this.ps[i].speed.add(forces[i].div(this.ps[i].mass));
            //SPEEDS -> BOUNDS
            const BOUND_COLL_SAVE = .5;
            if(this.ps[i].pos.x < 0) this.ps[i].speed.x = Math.abs(this.ps[i].speed.x)*BOUND_COLL_SAVE;
            if(this.ps[i].pos.y < 0) this.ps[i].speed.y = Math.abs(this.ps[i].speed.y)*BOUND_COLL_SAVE;
            if(this.ps[i].pos.x > window.innerWidth) this.ps[i].speed.x = -Math.abs(this.ps[i].speed.x)*BOUND_COLL_SAVE;
            if(this.ps[i].pos.y > window.innerHeight) this.ps[i].speed.y = -Math.abs(this.ps[i].speed.y)*BOUND_COLL_SAVE;
            //SPEEDS -> LIMIT
            const SPEED_MAX = 1000;
            this.ps[i].speed = this.ps[i].speed.norm().mult(Math.min(this.ps[i].speed.len(), SPEED_MAX));
            //SPEEDS -> FRICTION
        });

        //POSITIONS
        numbers = Object.keys(this.ps);
        numbers.forEach(i => {
            if(this.ps[i].pos.x < 0) this.ps[i].pos.x = 0;
            if(this.ps[i].pos.y < 0) this.ps[i].pos.y = 0;
            if(this.ps[i].pos.x > window.innerWidth) this.ps[i].pos.x = window.innerWidth;
            if(this.ps[i].pos.y > window.innerHeight) this.ps[i].pos.y = window.innerHeight;
            this.ps[i].pos = this.ps[i].pos.add(this.ps[i].speed);
        });

        numbers = Object.keys(this.ps);
        numbers.forEach(i => {
            this.ps[i].tick();
        });

        //this.ps[1].pos.x+=1;
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
function calcGrav(p1, p2, f, repmax) {
    let dist = p1.pos.subtr(p2.pos);
    let dl = dist.len();
    let res = dist.norm().mult(-p1.mass * p2.mass / dl / dl);
    res = res.add(res.div(-dl/f));
    if(res.len()!=0)return res.norm().mult(Math.min(repmax, res.len()));
    return res;
}
function calcGrav_n(p1, p2, f, repmax) {
    let dist = p1.pos.subtr(p2.pos);
    let dl = dist.len();
    let res = dist.norm().mult(-p1.mass * p2.mass / dl / dl);
    res = res.add(res.div(-dl/f));
    //if(res.len()!=0) {
        return res.norm().mult(normalize(res.len())*repmax);
    //}
    //return res;
}
//PARTICLES
class Particle {
    constructor(pos, mass, focus, speed, color) {
        this.pos = pos;
        this.mass = mass;
        this.focus = focus;
        this.speed = speed;
        this.color = color;
    }
    interact(p) {
    }
    tick() {
    }
    draw(ctx) {
        const R_COEF = .015;
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.pos.x, this.pos.y, this.mass*R_COEF, 0, Math.PI*2, true);
        ctx.fill();
    }
}
class Particle1 extends Particle {
    constructor(pos, mass, focus, speed, color) {
        super(pos, mass, focus, speed, color);
    }
    tick() {
    }
    interact(p) {
        switch(p.constructor.name) {
            case 'Particle1':
                return calcGrav_n(this, p, (this.focus + p.focus), 100);
            case 'Particle2':
                return calcGrav_n(this, p, 500, 5000);
        }
    }
}
class Particle2 extends Particle {
    constructor(pos, mass, focus, speed, color, inert) {
        super(pos, mass, focus, speed, color);
        this.inert = inert;
    }
    interact(p) {
        let f;
        switch(p.constructor.name) {
            case 'Particle2':
                return calcGrav_n(this, p, 50, 10);
            case 'Particle1':
                return calcGrav_n(this, p, 100, 50);
        }
    }
    tick() {
        this.speed = this.speed.mult(this.inert);
    }
}
//FUNCTIONS
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