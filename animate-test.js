/* * * Animation.Options:
* Opts.delta(time) - time function, time = 0..1.By
default linear.*Opts.step(progress) - drawing
function,
progress = 0..1.
* Opts.complete - function to be executed at the end of the animation * Opts.delta - delay between frames, the
default 13 * * Returns the timer animation,
it can be cleaned from the outside.*/
function animate(opts) {
    var start = new Date;
    var delta = opts.delta || linear;

    var timer = setInterval(function() {
        var progress = (new Date - start) / opts.duration;

        if (progress > 1) progress = 1;

        var value = Math.round(opts.start + (opts.end - opts.start) * delta(progress));
        opts.elem.style[opts.prop] = value + 'px';

        if (progress == 1) {
            clearInterval(timer);
            opts.complete && opts.complete();
        }
    }, opts.delay || 13);

    console.log(opts);
    //return timer;
}

/**
 * Animation CSS-properties element in opts.prop opts.elem
 * From opts.start to opts.end duration opts.duration
 *
 * The remaining properties are transferred to animate
 * For example: animateProp ({
 * Elem: ...,
 * Prop: 'height',
 * Start: 0, / / ​​all sizes in pixels * End: 100 * Duration: 1000 *
}) */

function animateProp(opts) {
    var start = opts.start,
        end = opts.end,
        prop = opts.prop;

    console.log(opts);



    animate(opts);
}
// ------------------Time functions------------------

function elastic(progress) {
    return Math.pow(2, 10 * (progress - 1)) * Math.cos(20 * Math.PI * 1.5 / 3 * progress);
}

function linear(progress) {
    return progress;
}

function quad(progress) {
    return Math.pow(progress, 2);
}

function quint(progress) {
    return Math.pow(progress, 5);
}

function circ(progress) {
    return 1 - Math.sin(Math.acos(progress));
}

function back(progress) {
    return Math.pow(progress, 2) * ((1 + 1.5) * progress - 1.5);
}


function bounce(progress) {
    for (var a = 0, b = 1, result; 1; a += b, b /= 2) {
        if (progress >= (7 - 4 * a) / 11) {
            return -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2);
        }
    }
}

function makeEaseInOut(delta) {
    return function(progress) {
        if (progress < .5)
            return delta(2 * progress) / 2;
        else
            return (2 - delta(2 * (1 - progress))) / 2;
    }
}


function makeEaseOut(delta) {
    return function(progress) {
        return 1 - delta(1 - progress);
    }
}