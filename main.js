const FRTIME = 1;

//INFO
class Info {
    constructor() {
        this.ps = new Array;
        for(let i = 0; i < 100; i++) this.ps.push(new Grain(new Vec2D(Math.random() * window.innerWidth, Math.random() * window.innerHeight), new Vec2D(0, 0)));
        for(let i = 0; i < 20; i++)  this.ps.push(new Heavy(new Vec2D(Math.random() * window.innerWidth, Math.random() * window.innerHeight), new Vec2D(0, 0)));
        for(let i = 0; i < 100; i++) this.ps.push(new Antigrain(new Vec2D(Math.random() * window.innerWidth, Math.random() * window.innerHeight), new Vec2D(0, 0)));
    }
    tick(ctx, frtime) {
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
        
        this.ps.forEach(el => el.tick());
        this.ps.forEach(el => el.draw(ctx));
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
            throw("Division by zero (vec2d.div())");
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
            throw("Division by zero (vec2d.proj())");
        }
        return this.scalProd(vec) / vec.len();
    }
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

//PARTICLES
class Particle {
    constructor(pos, speed, mass) {
        this.pos = pos;
        this.speed = speed;
        this.mass = mass;
    }
    tick() {
        if(this.pos.x < 0) {
            this.speed.x = Math.abs(this.speed.x);
            this.pos.x = 0;
        }
        if(this.pos.y < 0) {
            this.speed.y = Math.abs(this.speed.y);
            this.pos.y = 0;
        }
        if(this.pos.x > window.innerWidth) {
            this.speed.x = -Math.abs(this.speed.x);
            this.pos.x = window.innerWidth;
        }
        if(this.pos.y > window.innerHeight) {
            this.speed.y = -Math.abs(this.speed.y);
            this.pos.y = window.innerHeight;
        }
    };
    draw(ctx) {
        
    };
    interact(p) {};
    accelerate(force) { this.speed = this.speed.add(force.div(this.mass)) };
}
class Grain extends Particle {
    constructor(pos, speed) {
        super(pos, speed, 100);
        this.inert = .95;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = '#0005';
        ctx.arc(this.pos.x, this.pos.y, 5, 0, Math.PI*2, true);
        ctx.fill();
    }
    tick() {
        super.tick();
        this.speed = this.speed.mult(this.inert);
    }
    interact(p) {
        switch (p.constructor.name) {
            case 'Grain': return calcGrav(this.mass, p.mass, this.pos, p.pos, 50, 10);
            case 'Antigrain': return calcGrav(this.mass, p.mass, this.pos, p.pos, 50, -10);
            case 'Heavy': return calcGrav(this.mass, p.mass, this.pos, p.pos, 50, 100);
        }
    }
}
class Antigrain extends Particle {
    constructor(pos, speed) {
        super(pos, speed, 100);
        this.inert = .95;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = '#0f05';
        ctx.arc(this.pos.x, this.pos.y, 5, 0, Math.PI*2, true);
        ctx.fill();
    }
    tick() {
        super.tick();
        this.speed = this.speed.mult(this.inert);
    }
    interact(p) {
        switch (p.constructor.name) {
            case 'Grain': return calcGrav(this.mass, p.mass, this.pos, p.pos, 50, -10);
            case 'Antigrain': return calcGrav(this.mass, p.mass, this.pos, p.pos, 50, 10);
            case 'Heavy': return calcGrav(this.mass, p.mass, this.pos, p.pos, 50, 100);
        }
    }
}
class Heavy extends Particle {
    constructor(pos, speed) {
        super(pos, speed, 100000);
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = '#f005';
        ctx.arc(this.pos.x, this.pos.y, 5, 0, Math.PI*2, true);
        ctx.fill();
    }
    tick() {
        super.tick();
        const SPEED = 5;
        if(this.speed.len() == 0) this.speed = new Vec2D(SPEED, 0);
        else this.speed = this.speed.norm().mult(SPEED);
    }
    interact(p) {
        switch (p.constructor.name) {
            case 'Grain': case 'Antigrain': return calcGrav(this.mass, p.mass, this.pos, p.pos, 50, 10);
            case 'Heavy': return new Vec2D(0,0);
        }
    }
}


function calcGrav(m1, m2, p1, p2, f, repmax) {
    let dist = p2.subtr(p1);
    if(dist.len() == 0) return new Vec2D(0,0);
    let r = dist.len() - f;
    if(r == 0) return new Vec2D(0,0);
    return dist.norm().mult(normalize(-m1*m2/(r*Math.abs(r)))*repmax);
}

function normalize(val) {
    return Math.atan(val) / Math.PI * 2;
}
function drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
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

function main() {
    let canvas = [document.querySelector('#main1'), document.querySelector('#main2')];
    let ctx = [canvas[0].getContext("2d"), canvas[1].getContext("2d")];
    let info = setup(canvas, ctx);
    process(canvas, ctx, 0, info);
}
function process(canvas, ctx, lastfrtime, info) {
    var start = new Date();
    let buff = switchBuffer(canvas);
    info = loop(canvas[buff], ctx[buff], Math.max(FRTIME, lastfrtime), info);
    var lastfrtime = new Date() - start;
    setTimeout(() => {
        process(canvas, ctx, lastfrtime, info);
    }, Math.max(0, FRTIME - lastfrtime));
}

function setup(canvas, ctx) {
    return new Info();
}
function loop(canvas, ctx, frtime, info) {
    //fps
    document.title = 'FPS=' + 1000/frtime;
    //canvas resizing
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    //drawing
    info.tick(ctx, frtime);
    return info;
}