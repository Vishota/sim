//consts
const GR_COEF = 0.1;
const SPEED_COEF = 0.01;
const FRICT_COEF = 0.001;
//INFO
class Info {
    tick(frtime) {
        //FORCES then SPEEDS then POSITIONS

        let keys;

        //      _____CALCULATING FORCES_____
        keys = Object.keys(this.bodies);

        let forces = new Array();
        keys.forEach(i => {forces[i] = new Vec2D(0, 0)});   //START FORCES

        keys.forEach(i => {
            keys = keys.filter(f => {return f != i});   //DELETING [i] BODY FROM LIST
            keys.forEach(j => {
                let dist = this.bodies[j].pos.subtr(this.bodies[i].pos);
                forces[i] = forces[i].add(dist.norm().mult(GR_COEF * this.bodies[i].mass * this.bodies[j].mass / dist.len() / dist.len()));      //GRAVITY FOR [i]
                forces[j] = forces[j].add(dist.norm().mult(-GR_COEF * this.bodies[j].mass * this.bodies[i].mass / dist.len() / dist.len()));     //GRAVITY FOR [j]
            });
        });

        //      _____CALCULATING SPEEDS_____
        keys = Object.keys(this.bodies);
        keys.forEach(i => {
            keys = keys.filter(f => {return f != i});   //DELETING [i] BODY FROM LIST
            keys.forEach(j => {
                if(this.bodies[i].pos.diff(this.bodies[j].pos).len() < this.bodies[i].radius + this.bodies[j].radius) {            //COLLISION CHECK
                    let dist = this.bodies[j].pos.subtr(this.bodies[i].pos);

                    let iV0 = this.bodies[i].speed;
                    let jV0 = this.bodies[j].speed;

                    let iV0Pr = dist.norm().mult(iV0.proj(dist));
                    let jV0Pr = dist.norm().mult(jV0.proj(dist));

                    //v = m1v1+m2v2 / m1+m2
                    let v = iV0Pr.mult(this.bodies[i].mass).add(jV0Pr.mult(this.bodies[j].mass)).div(this.bodies[i].mass + this.bodies[j].mass);

                    //console.log(v);
                    this.bodies[i].speed = v.add(iV0.subtr(iV0Pr));
                    this.bodies[j].speed = v.add(jV0.subtr(jV0Pr));

                    //repulsive force
                    let depth = this.bodies[i].radius + this.bodies[j].radius - this.bodies[i].pos.diff(this.bodies[j].pos).len();
                    forces[i] = forces[i].add(dist.norm().mult(-depth*this.bodies[i].mass*0.5));
                    forces[j] = forces[j].add(dist.norm().mult(depth*this.bodies[j].mass*0.5));

                    //friction
                    let friction = 1 - (1 - this.bodies[i].friction) * (1 - this.bodies[j].friction);
                    console.log(friction*Math.atan(depth) / Math.PI * 2);
                    this.bodies[i].speed = this.bodies[i].speed.mult(friction*Math.atan(depth / FRICT_COEF)/Math.PI*2);
                    this.bodies[j].speed = this.bodies[j].speed.mult(friction*Math.atan(depth / FRICT_COEF)/Math.PI*2);
                }
            });
            this.bodies[i].speed = this.bodies[i].speed.add(forces[i].mult(frtime / this.bodies[i].mass));
        });

        //      _____CALCULATING POSITIONS_____
        keys = Object.keys(this.bodies);
        keys.forEach(i => {
            this.bodies[i].pos = this.bodies[i].pos.add(this.bodies[i].speed.mult(frtime * SPEED_COEF));
        });
    }
/*     tick(frtime) {
        //1. forces
        //2. speeds
        //3. coords
        let forces = {};
        Object.keys(this.bodies).forEach(i => {
            const b1 = this.bodies[i];
            forces[i] = new Vec2D(0,0);
            Object.keys(this.bodies).forEach(j => {
                if (i != j) {
                    const b2 = this.bodies[j];
                    let dist = b2.pos.subtr(b1.pos);

                    //gravity
                    forces[i] = forces[i].add( dist.norm().mult(GR_COEF * b1.mass * b2.mass / dist.len()));// / dist.len()) );
                    //normal force
                    if(dist.len() < b1.radius + b2.radius) {
                        //let s = b1.radius + b2.radius - dist.len();
                        //m1*v1 = m2*v2
                        //b1.speed = dist.norm()//b1.speed.add(b2.speed.mult(b2.mass / b1.mass));
                    }
                }
            });

        });
        Object.keys(this.bodies).forEach(i => {
            this.bodies[i].speed = this.bodies[i].speed.add(forces[i].mult(frtime / this.bodies[i].mass));
            Object.keys(this.bodies).forEach(j => {
                if(i!=j) {
                    let dist = this.bodies[j].pos.subtr(this.bodies[i].pos);
                    if(dist.len() < this.bodies[i].radius + this.bodies[j].radius) {
                        //let s = b1.radius + b2.radius - dist.len();
                        //m1*v1 = m2*v2
                        Object.keys(this.bodies).forEach(j => {
                            this.bodies[i].speed = this.bodies[i].speed.add(this.bodies[j].speed.mult(this.bodies[j].mass / this.bodies[i].mass));
                        });
                    }
                }
            });
        });
        Object.keys(this.bodies).forEach(i => {
            this.bodies[i].pos = this.bodies[i].pos.add(this.bodies[i].speed.mult(frtime * SPEED_COEF));
        });
    }*/
    constructor() {
        this.bodies = new Array();

        this.bodies.push(new Circle(new Vec2D(200, 100), new Vec2D(0, 30), 500, 20, '#ff0000', 0.95));
        this.bodies.push(new Circle(new Vec2D(180, 140), new Vec2D(0, 30), 500, 20, '#ff0000', 0.95));
        this.bodies.push(new Circle(new Vec2D(220, 140), new Vec2D(0, 30), 500, 20, '#ff0000', 0.95));
        this.bodies.push(new Circle(new Vec2D(200, 500), new Vec2D(0, -100), 500, 20, '#00ff00', 0.95));
        //this.bodies.push(new Circle(new Vec2D(100, 100), new Vec2D(0, 30), 5700, 50, '#ff0000', 0.9));
        //this.bodies.push(new Circle(new Vec2D(200, 500), new Vec2D(0, -20.5), 5000, 30, '#0000ff', 0.9));

        /*const W = 3, H = 3;
        for (let i = 0; i < W; i++) {
            for (let j = 0; j < H; j++) {
                this.bodies.push(new Circle(new Vec2D(i * viewportToPixels('100vw') / (W - 1), j * viewportToPixels('100vh') / (H - 1)), new Vec2D(0, 0), 500, 50, '#ff0000'));
            }
        }*/
    } 
}
class Vec2D {
    draw(ctx, color, start) {
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
//bodies
class Body {    //abstr body class
    // Body has pos, speed and mass
    draw(ctx) {  }
    constructor(pos, speed, mass) {
        this.pos = pos;
        this.speed = speed;
        this.mass = mass;
    }
}
class Circle extends Body {
    // Circle has all that body has, radius and color and friction
    constructor(pos, speed, mass, radius, color, friction) {
        super(pos, speed, mass);
        this.radius = radius;
        this.color = color;
        this.friction = friction;
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI, true);
        ctx.fill();
        //console.log(`x = ` + this.pos.x + `; y = ` + this.pos.y + `; r = ` + this.radius);
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
    info.bodies.forEach(el => {
        el.draw(ctx);
    });
    info.bodies.forEach(el => {
        el.speed.draw(ctx, '#000000', el.pos);
    });
    //tick
    info.tick(frtime);
    return info;
}