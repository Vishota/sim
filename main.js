//INFO
class Info {
    constructor() {
        this.startTime = new Date();
        this.circle1 = new Circle(new Vec2D(800, 200), new Vec2D(700, 0), 50, 20, '#ff0000');
        this.circle2 = new Circle(new Vec2D(800, 400), new Vec2D(0, 0), 5000, 100, '#00ff00');
    }
}
class Vec2D {
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
        //switch (typeof val) {
        //    case Number:
        return new Vec2D(this.x * val, this.y * val);
            //case Vec2D:
        //}
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
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
//bodies
class Body {    //abstr body class
    // Body has pos, speed and weight
    draw(ctx) {  }
    calcGravity(body) {
        //G*m1*m2/r^2
        const GR_COEFF = 50;
        //F = (GR_COEFF * this.weight * body.weight / this.pos.subtr(body.pos).len())
        let dist = body.pos.subtr(this.pos);
        return dist.norm().mult((GR_COEFF * this.weight * body.weight / dist.len()));
    }
    calcSpeed(force, frtime) {
        // a = f/m
        // v += a * frtime / 1000
        // v += f / m * frtime / 1000
        this.speed = this.speed.add(force.div(this.weight).mult(frtime / 1000));
    }
    calcPos(frtime) {
        this.pos = this.pos.add(this.speed.mult(frtime / 1000));
    }
    constructor(pos, speed, weight) {
        this.pos = pos;
        this.speed = speed;
        this.weight = weight;
    }
}
class Circle extends Body {
    // Circle has all that body has, radius and color
    constructor(pos, speed, weight, radius, color) {
        super(pos, speed, weight);
        this.radius = radius;
        this.color = color;
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI, true);
        ctx.fill();
        console.log(`x = ` + this.pos.x + `; y = ` + this.pos.y + `; r = ` + this.radius);
    }
}
//FUNCTIONS
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
    const FRTIME = 16;
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
    info.circle1.draw(ctx);
    info.circle2.draw(ctx);
    //gravity
    info.circle1.calcSpeed(info.circle1.calcGravity(info.circle2), frtime)
    info.circle2.calcSpeed(info.circle2.calcGravity(info.circle1), frtime)
    
    info.circle1.calcPos(frtime);
    info.circle2.calcPos(frtime);
    //console.log(info.circle1.calcGravity(info.circle2), frtime);
    return info;
}