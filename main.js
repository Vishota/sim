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
    setup(canvas, ctx);
    process(canvas, ctx, 0);
}
function process(canvas, ctx, lastfrtime) {
    const FRTIME = 16;
    var start = new Date();
    let buff = switchBuffer(canvas);
    let info = loop(canvas[buff], ctx[buff], lastfrtime);
    var lastfrtime = new Date() - start;
    setTimeout(() => {
        process(canvas, ctx, lastfrtime);
    }, Math.max(0, FRTIME - lastfrtime));
}
//CODE
function setup(canvas, ctx) {
    canvas[0].width = viewportToPixels('100vw');
    canvas[0].height = viewportToPixels('100vh');
    canvas[1].width = viewportToPixels('100vw');
    canvas[1].height = viewportToPixels('100vh');
}
function loop(canvas, ctx, frtime, info) {
}