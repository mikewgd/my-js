/**
 * * Easily animate CSS values. [credit](https://javascript.info/js-animation)
 * * The following easing options are available: `linear`, `elastic`, `quad`,
 * `quint`, `circ`, `back` or `bounce`.
 * * You can animate relative values by doing `+25` or `-25` for a value. Which will take the 
 * current property value and increase or decrease the property balue by 25 (see demo). 
 * * The `to` menthod is used to animate css values and override global configuration.
 * * The `delay` method is used to delay the animation from occuring.
 * * [See it in action + some notes! 😀](/animate.html)
 * 
 * @example
 * // Global configuration
 * var settings = {duration: 500, easing: 'bounce'};
 * var animation = new ML.Animate(ML.El.$q('#el'), settings);
 *
 * animation.to({ width: 100 }, {}, function() {
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
  this.delayed = [];
  this.delayExecution = false;
  this.delayCount = 0;   
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
  var self = this;
  var options = this.validateSettings(settings);
  var el = this.el;
  var timer = null;
  var currProps = {};
  var initialProps = {};
  var progress = false;
  var time = new Date();

  /**
   * Handles the delay of an animation happening.
   * @param {Function} func The callback function
   * @private
   */
  function handleDelay(func){
    self.delayed.push(func);
    self.delayCount++;
  }

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
      if (firstChar.charAt(0) === '+' || firstChar === '-') {
        value = initialProps[prop] + parseFloat(props[prop]) * options.easing(progress);
      } else {
        value = currProps[prop] + (props[prop] - currProps[prop]) * options.easing(progress);
      }
      if (prop === 'opacity') {
        el.style.opacity = value;
      } else {
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

  if (self.delayExecution) {
    var toArgs = arguments;
    handleDelay(function() {
      self.to(toArgs[0], toArgs[1], toArgs[2]);
    });
  } else {
    setInitialProps();
    timer = requestAnimationFrame(move);
  }
  
  return this;
};

/**
 * Delays animating the element.
 * 
 * @param {Number} time The amount of time to delay the animation, in ms.
 * @memberof ML.Animate
 */
ML.Animate.prototype.delay = function(time) {
  var self = this;
  this.delayExecution = true;

  var delayDone = function() {
    self.delayExecution = false;
     if (typeof(self.delayed[0]) === 'function') {
       self.delayed[0]();
       self.delayed.splice(0, 1);
     }
     if (self.delayed.length > 0) {
      self.delayExecution = true;
     }
  };

  var timer = setTimeout(function(){
    delayDone();
    clearTimeout(timer);
  }, time);

  return this;
};
