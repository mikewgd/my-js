/**
 * * Easily animate CSS values. [credit](https://javascript.info/js-animation)
 * * The following easing options are available: `linear`, `elastic`, `quad`,
 * `quint`, `circ`, `back` or `bounce`.
 * 
 * @example
 * var props = {width: 100, height: 100};
 * var settings = {duration: 500, easing: 'bounce'};
 * 
 * new ML.Animate(ML.$('el'), props, settings, function() {
 *   alert('animation is complete');
 * });
 * 
 * @param {HTMLElement} el Element to animate.
 * @param {Object} props CSS properties to animate.
 * @param {Object} [settings] Configuration settings.
 * @param {Number} [settings.duration=400] The duration of the animation, defaults to 400ms.
 * @param {String} [settings.easing=linear] Type of animation (`bounce`, `elastic`, etc..), defaults to `linear`
 * @param {Function} [cb] Callback function.
 * @constructor
 */
ML.Animate = function(el, props, settings, cb) {
  /**
   * Animate defaults.
   * @type {Object}
   * @private
   */
  var DEFAULTS = {
    duration: 400,
    easing: 'linear'
  };

  /**
   * Easing functions
   * @private
   */
  var Easing = {
    linear: function(progress) {
      return progress;
    },

    elastic: function(progress) {
      return Math.pow(2, 10 * (progress - 1)) * Math.cos(20 * Math.PI * 1.5 / 3 * progress);
    },

    quad: function(progress) {
      return Math.pow(progress, 2);
    },

    quint: function(progress) {
      return Math.pow(progress, 5);
    },

    circ: function(progress) {
      return 1 - Math.sin(Math.acos(progress));
    },

    back: function(progress) {
      return Math.pow(progress, 2) * ((1 + 1.5) * progress - 1.5);
    },

    bounce: function(progress) {
      for (var a = 0, b = 1; 1; a += b, b /= 2) {
        if (progress >= (7 - 4 * a) / 11) {
          return -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2);
        }
      }
    }
  };

  var options = ML.extend(DEFAULTS, (ML.isUndef(settings, true)) ? {} : settings);
  var timer = null;
  var currProps = {};
  var progress = false;
  var time = new Date();

  /**
   * Initialization of animating elements.
   * @private
   */
  function init() {
    if (ML.isUndef(el.tagName)) {
      throw new Error('You can only animate a valid element on the page.');
    } else {
      if (!ML.isNum(options.duration)) {
        options.duration = DEFAULTS.duration;
      }

      if (ML.isUndef(Easing[options.easing])) {
        options.easing = Easing[DEFAULTS.easing];
      } else {
        options.easing = Easing[options.easing];
      }
    }

    timer = requestAnimationFrame(move);
  }

  /**
   * Gets the current CSS values of the properties being animated.
   * @private
   */
  function getCurrs() {
    var currProp = '';
    currProps = {};

    for (var prop in props) {
      currProp = parseFloat(ML.El.getStyle(el, prop).replace('px', ''));
      currProps[prop] = currProp;
    }
  }

  /**
   * Fade in/out an element.
   * @private
   */
  function fadeEl() {
    var curr = (currProps.opacity * 100);
    var desr = (props.opacity * 100);
    var whole = Math.round(curr + (desr - curr) * options.easing(progress));

    el.style.opacity = whole / 100;
  }

  /**
   * Animates the element with the new CSS values provided.
   * @private
   */
  function move() {
    var value = 0;
    getCurrs();
    
    value = 0;
    progress = (new Date() - time) / options.duration;

    if (progress > 1) {
      progress = 1;
    }

    for (var prop in props) {
      if (prop === 'opacity') {
        fadeEl();
      } else {
        value = Math.round(currProps[prop] + (props[prop] - currProps[prop]) * options.easing(progress));
        el.style[prop] = value + 'px';
      }
    }

    if (progress === 1) {
      cancelAnimationFrame(timer);
      if (typeof cb === 'function') {
        cb();
      }
      return;
    }

    timer = requestAnimationFrame(move);
  }

  init();
};