//INFO
class Info {
    constructor() {
        this.ps = new Array; //parcticles
        this.ps.push(new Particle(new Vec2D(100, 50), 100, 30, new Vec2D(0, 0),'#00f'));
        this.ps.push(new Particle(new Vec2D(20, 60), 100, 30, new Vec2D(0, 0), '#f00'));
    }
    tick(ctx, frtime) {
        let numbers = Object.keys(this.ps);
        numbers.forEach(i => {
            numbers = numbers.filter(f => {return f != i});
            numbers.forEach(j => {
                this.ps[i].calcGrav(this.ps[j]).draw(ctx, this.ps[i].pos);
            });
        });

        numbers = Object.keys(this.ps);
        numbers.forEach(i => {this.ps[i].draw(ctx)});

        this.ps[1].pos.x+=1;
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
        this.color = color;
    }
    calcGrav(p) {
        let dist = this.pos.subtr(p.pos);
        let dl = dist.len();
        let f = (this.focus + p.focus) / 2;
        let res = dist.norm().mult(-this.mass * p.mass / dl);
        res = res.add(res.div(Math.max(-dl/f)));
        return res;
        //dist.norm().mult(-this.mass * p.mass / dl / dl); - simple gravity
    }
    draw(ctx) {
        const R_COEF = .1;
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.pos.x, this.pos.y, this.mass*R_COEF, 0, Math.PI*2, true);
        ctx.fill();
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
    const FRTIME = 10;
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