/* jshint browser: true, latedef: false */
/* global ML */

'use strict';

/**
 * @callback carouselCallback
 * @param {number} index The current slide index.
 * @param {HTMLElement} el The carousel element.
 */

/**
 * Carousel component.
 * @constructor
 * @param {HTMLElement} el The carousel element.
 * @param {object} [settings] Configuration settings.
 * @param {number} [settings.current=0] The current slide to start on. 0 based.
 * @param {boolean} [settings.rotate=false] The carousel will rotate automatically.
 * @param {boolean} [settings.dots=false] Dot navigation.
 * @param {boolean} [settings.nav=true] Arrow navigation.
 * @param {carouselCallback} cb Callback function after slide has animated.
 * The current slide index is returned.
 * @example
 * var carousel = new ML.Carousel(ML.$('initCarousel'), {
 *   rotate: true
 * }, function(index, el) {
 *   console.log('slide index: ', index);
 * })
 */
ML.Carousel = function(el, settings, cb) {
  /**
   * Carousel defaults.
   * @type {object}
   * @property {number} CURRENT The current slide index.
   * @property {boolean} ROTATE Automatically rotate the slides.
   * @property {boolean} DOTS Dot navigation.
   * @property {boolean} NAV Arrow navigation.
   * @private
   */
  var DEFAULTS = {
    CURRENT: 0,
    ROTATE: false,
    DOTS: false,
    NAV: true
  };

  var current = parseInt(settings.current) || DEFAULTS.CURRENT;
  var rotate = settings.rotate || DEFAULTS.ROTATE;
  var dots = settings.dots || DEFAULTS.DOTS;
  var nav = settings.nav || DEFAULTS.NAV;
  var self = this;

  var slides = getSlides();
  var ul = null;
  var nextButton = null;
  var prevButton = null;
  var dotsUl = null;
  var dotsLis = [];

  var animating = false;
  var rotateSpeed = 2000;
  var animation = null;
  var total = slides.length;
  var width = el.offsetWidth;

  /**
   * Initializes the carousel.
   */
  this.init = function() {
    var carouselHtml = el.innerHTML;
    var gutter = parseInt(ML.El.getStyle(slides[0], 'margin-right').replace('px', ''));
    width = width + gutter;

    el.innerHTML = '<div class="carousel-viewer" style="overflow: hidden;">' + carouselHtml + '</div>';
    ul = ML._$('ul', el)[0];
    ul.style.left = -(width * current) + 'px';

    if (nav) {
      createNav();
    }

    if (dots) {
      createDots();
    }

    bindEvents();
    callback(true);

    if (rotate) {
      setTimeout(function() {
        cycle();
      }, rotateSpeed);
    }
  };

  /**
   * Show the next slide.
   */
  this.next = function() {
    if ((current + 1) === total) {
      return;
    }

    current++;
    slide();
  };

  /**
   * Show the previous slide.
   */
  this.prev = function() {
    if (current === 0) {
      return;
    }

    current--;
    slide();
  };

  /**
   * Goes to a specific slide.
   * @param {number} index The slide index.
   */
  this.goTo = function(index) {
    current = index;
    slide();
  };

  /**
   * Returns the slide elements.
   * @return {array}
   * @private
   */
  function getSlides() {
    var lis = ML._$('li', el);
    var arr = [];

    for (var i = 0, len = lis.length; i < len; i++) {
      if (lis[i].className === 'carousel-slide') {
        arr.push(lis[i]);
      }
    }

    return arr;
  }

  /**
   * Creates the arrow navigation and adds into the DOM.
   * @private
   */
  function createNav() {
    nextButton = ML.El.create('a', {'href': '#', 'class': 'carousel-nav next'});
    prevButton = ML.El.create('a', {'href': '#', 'class': 'carousel-nav prev'});

    prevButton.innerHTML = '<i>&larr;</i> <span>Previous</span>';
    nextButton.innerHTML = '<span>Next</span> <i>&rarr;</i>';

    el.appendChild(prevButton);
    el.appendChild(nextButton);
  }

  /**
   * Creates the dot navigation.
   * @private
   */
  function createDots() {
    var div = ML.El.create('div', {'class': 'carousel-dots'});
    var li = null;
    var link = null;
    dotsUl = ML.El.create('ul');

    div.appendChild(dotsUl);
    el.appendChild(div);

    for (var i = 0, len = slides.length; i < len; i++) {
      li = ML.El.create('li');
      link = ML.El.create('a', {'href': '#', 'rel': i});
      link.innerHTML = '&bull;';
      dotsLis.push(li);
      li.appendChild(link);
      dotsUl.appendChild(li);
    }
  }

  /**
   * Events bound to elements.
   * @private
   */
  function bindEvents() {
    if (dots) {
      var dotLinks = ML._$('a', dotsUl);

      ML.loop(dotLinks, function(item) {
        ML.El.evt(item, 'click', function(e) {
          e.preventDefault();
          if (self.animating || this.rel === self.curr) {
            return;
          }

          stopCycle();
          self.goTo(parseInt(this.rel));
        });
      });
    }

    ML.El.evt(nextButton, 'click', function(e) {
      e.preventDefault();
      if (ML.hasClass(this, 'inactive') || animating) {
        return;
      }

      stopCycle();
      self.next();
    });

    ML.El.evt(prevButton, 'click', function(e) {
      e.preventDefault();
      if (ML.hasClass(this, 'inactive') || animating) {
        return;
      }

      stopCycle();
      self.prev();
    });
  }

  /**
  * Animates the carousel to slide to each desired slide.
  * @private
  */
  function slide() {
    var desired = width * current;
    animating = true;

    ML.Animate(ul, {left: -desired}, function(){
      animating = false;
      callback(false);
    });
  }

  /**
  * Stops the auto rotation of the carousel.
  * @private
  */
  function stopCycle() {
    rotate = false;
    clearTimeout(animation);
  }

  /**
  * Rotates through the slides in the carousel based on a timer.
  * @private
  */
  function cycle() {
    if (!rotate) {
      return;
    }

    if (current < total) {
      current++;
    } else {
      current--;
    }

    if (current === total) {
      current = 0;
    }

    animation = setTimeout(function() {
      cycle();
    }, rotateSpeed);

    slide();
  }

  /**
  * Function to be called after each slide.
  * @param {boolean} init Intialization of the callback.
  * Used to set elements inactive/active on load.
  * @private
  */
  function callback(init) {
    if (!init && cb) {
      cb(current, el);
    }

    ML.removeClass(nextButton, 'inactive');
    ML.removeClass(prevButton, 'inactive');

    if (current === 0) {
      ML.addClass(prevButton, 'inactive');
    } else if (current + 1 === total) {
      ML.addClass(nextButton, 'inactive');
    }

    if (dots) {
      ML.loop(dotsLis, function(li, i) {
        ML.removeClass(li, 'active');
        if (i === current) {
          ML.addClass(li, 'active');
        }
      });
    }
  }
};

(function() {
  var carouselEl = ML._$('div');
  var carousel = null;
  var settings = {};

  for (var i = 0; i < carouselEl.length; i++) {
    if (ML.El.data(carouselEl[i], 'carousel') !== null) {
      settings = ML.parObj(ML.El.data(carouselEl[i], 'carousel'));
      carousel = new ML.Carousel(carouselEl[i], settings);
      carousel.init();
    }
  }
})();
