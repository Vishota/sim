//INFO
class Info {
    constructor() {
        this.ps = new Array; //parcticles
        //this.ps.push(new Particle(new Vec2D(window.innerWidth / 2, -100), 500, 200, new Vec2D(10, 0),'#00f'));
        /*this.ps.push(new Particle(new Vec2D(400, 600), 1000, 200, new Vec2D(1, -1),'#0f0'));
        this.ps.push(new Particle(new Vec2D(600, 600), 1000, 200, new Vec2D(-1, 0),'#f00'));
        this.ps.push(new Particle(new Vec2D(600, 400), 1000, 200, new Vec2D(0, 1),'#ff0'));*/
        for(let i = 0; i < 40; i++) {
            for(let j = 0; j < 20; j++) {
                this.ps.push(new Particle1(new Vec2D(100 + 40 * i, 100 + 40 * j), 100, 50, new Vec2D(0, 0),'#0003'));
            }
            /*for(let j = 0; j < 20; j++) {
                this.ps.push(new Particle1(new Vec2D(window.innerWidth - 100 - 40 * i, 100 + 40 * j), 100, 50, new Vec2D(0, 0),'#0003'));
            }*/
        }
        this.ps.push(new Particle1(new Vec2D(window.innerWidth/2, window.innerHeight/2), 5000, 10000, new Vec2D(0, 0),'#0f0'));
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
            //forces[i] = forces[i].add(new Vec2D(window.innerWidth / 2 - this.ps[i].pos.x, window.innerHeight / 2 - this.ps[i].pos.y)).mult(F_BOUND);
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
            //this.ps[i].speed = this.ps[i].speed.mult(0.97);
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

        //numbers = Object.keys(this.ps);

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
        return new Vec2D(this.x / val, this.y / val);
    }
    len() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    norm() {
        return this.div(this.len());
    }
    proj(vec) {
        return this.scalProd(vec) / vec.len();
    }
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
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
    draw(ctx) {
        const R_COEF = .02;
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
    interact(p) {
        switch(p.constructor.name) {
            case 'Particle1':
                const REPULSE_MAX = 5000;
                let dist = this.pos.subtr(p.pos);
                let dl = dist.len();
                let f = (this.focus + p.focus) / 2;
                let res = dist.norm().mult(-this.mass * p.mass / dl / dl);
                res = res.add(res.div(-dl/f));
                if(res.len()!=0)return res.norm().mult(Math.min(REPULSE_MAX, res.len()));
                return res;
                //return res.add(res.div(-Math.min(dl/f, this.mass * REPULSE_MAX)));
        }
    }
}
class Particle2 extends Particle {
    constructor(pos, mass, focus, speed, color) {
        super(pos, mass, focus, speed, color);
    }
    interact(p) {
    }
}
//FUNCTIONS
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