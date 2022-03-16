function main() {
    let canvas = document.querySelector('#main');
    setup(canvas);
    process(canvas, 0);
}
function process(canvas, lastfrtime) {
    const FRTIME = 16;
    var start = new Date();
    loop(canvas, lastfrtime);
    var lastfrtime = new Date() - start;
    setTimeout(() => {
        process(canvas, lastfrtime);
    }, Math.max(0, FRTIME - lastfrtime));
}

function setup(canvas) {
    
}
function loop(canvas, frtime) {
    
}