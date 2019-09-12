/**
 * * Easily animate CSS values. [credit](https://javascript.info/js-animation)
 * * The following easing options are available: `linear`, `elastic`, `quad`,
 * `quint`, `circ`, `back` or `bounce`.
 * * [Demo](/animate.html)
 * 
 * @example
 * var settings = {duration: 500, easing: 'bounce'};
 * var animation = new ML.Animate(ML.El.$q('#el'), settings);
 * animation.to({ width: 100 }, { delay: 400 }, function() {
 *  console.log('animation complete');
 * })
 * 
 * @param {HTMLElement} el Element to animate.
 * @param {Object} [settings] Global configuration settings.
 * @param {Number} [settings.duration=200] The duration of the animation, in ms.
 * @param {String} [settings.easing=linear] Type of animation (`bounce`, `elastic`, etc..), defaults to `linear`
 * @class
 * @constructor
 */
ML.Animate = function(el, settings) {
  /**
   * Animate defaults.
   * @type {Object}
   * @private
   */
  var DEFAULTS = {
    duration: 200,
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

  /**
   * Validates animation settings.
   * @param {Object} overrides Custom animation settings.
   * @returns {Object}
   */
  this.validateSettings = function(overrides) {
    var options = ML.extend(DEFAULTS, (ML.isUndef(overrides, true)) ? {} : overrides);

    if (!ML.isNum(options.duration)) {
      options.duration = DEFAULTS.duration;
    }

    if (!ML.isNum(options.delay)) {
      options.delay = DEFAULTS.delay;
    }

    if (ML.isUndef(Easing[options.easing])) {
      options.easing = Easing[DEFAULTS.easing];
    } else {
      options.easing = Easing[options.easing];
    }

    return options;
  };

  if (ML.isUndef(el.tagName)) {
    throw new Error('You can only animate a valid element on the page.');
  }

  this.el = el;
  this.options = this.validateSettings(settings);
};

/**
 * Animate element.
 * 
 * @param {Object} props CSS properties to animate.
 * @param {Object} [settings] Override Global Configuration settings.
 * @param {Number} [settings.duration=200] The duration of the animation, defaults to 400ms.
 * @param {String} [settings.easing=linear] Type of animation (`bounce`, `elastic`, etc..), defaults to `linear`
 * @param {Function} [cb] Callback function.
 * @memberof ML.Animate
 */
ML.Animate.prototype.to = function(props, settings, cb) {
  var options = this.validateSettings(settings);
  var el = this.el;
  var timer = null;
  var currProps = {};
  var initialProps = {};
  var progress = false;
  var time = new Date();

  /**
   * Sets initial props for animating relative values.
   * @private
   */
  function setInitialProps() {
    var currProp = '';

    for (var prop in props) {
      currProp = parseFloat(ML.El.getStyle(el, prop).replace('px', ''));
      initialProps[prop] = currProp;
    }
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
    var firstChar = '';
    getCurrs();
    
    value = 0;
    progress = (new Date() - time) / options.duration;

    if (progress > 1) {
      progress = 1;
    }

    for (var prop in props) {
      firstChar = props[prop].toString().charAt(0);
      if (prop === 'opacity') {
        fadeEl();
      } else {
        if (firstChar.charAt(0) === '+' || firstChar === '-') {
          value = initialProps[prop] + parseFloat(props[prop]) * options.easing(progress);
        } else {
          value = currProps[prop] + (props[prop] - currProps[prop]) * options.easing(progress);
        }
        
        el.style[prop] = Math.round(value) + 'px';
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

  setInitialProps();
  timer = requestAnimationFrame(move);
  
  return this;
};