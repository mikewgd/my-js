/* jshint browser: true, latedef: false */
/* global ML */

(function () {
  'use strict';

  /**
   * Carousel component.
   * @constructor
   * @param {HTMLElement} el The carousel element.
   * @param {object} [settings] Configuration settings.
   * @param {number} [settings.current=0] The current slide to start on. 0 based.
   * @param {boolean} [settings.rotate=false] The carousel will rotate automatically.
   * @param {boolean} [settings.dots=false] Dot navigation.
   * @param {boolean} [settings.nav=true] Arrow navigation.
   * @param {function} cb Callback function after slide has animated.
   * @param {number} cb.index The current slide index.
   * @param {HTMLElement} cb.el The carousel element.
   * The current slide index is returned.
   * @example
   * var carousel = new ML.Carousel(ML.El.$('initCarousel'), {
   *   rotate: true
   * }, function(index, el) {
   *   console.log('slide index: ', index);
   * })
   */
  ML.Carousel = function(el, settings, cb) {
    /**
     * Carousel defaults.
     * @type {object}
     * @private
     */
    var DEFAULTS = {
      current: 0,
      rotate: false,
      dots: false,
      nav: true
    };

    var current = parseInt(settings.current) || DEFAULTS.current;
    var rotate = settings.rotate || DEFAULTS.rotate;
    var dots = settings.dots || DEFAULTS.dots;
    var nav = settings.nav || DEFAULTS.nav;
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
      ul = ML.El._$('ul', el)[0];
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
      var lis = ML.El._$('li', el);
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
        var dotLinks = ML.El._$('a', dotsUl);

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
        if (ML.El.hasClass(this, 'inactive') || animating) {
          return;
        }

        stopCycle();
        self.next();
      });

      ML.El.evt(prevButton, 'click', function(e) {
        e.preventDefault();
        if (ML.El.hasClass(this, 'inactive') || animating) {
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

      ML.Animate(ul, {left: -desired}, {}, function() {
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
      if (!init && typeof cb === 'function') {
        cb(current, el);
      }

      ML.El.removeClass(nextButton, 'inactive');
      ML.El.removeClass(prevButton, 'inactive');

      if (current === 0) {
        ML.El.addClass(prevButton, 'inactive');
      } else if (current + 1 === total) {
        ML.El.addClass(nextButton, 'inactive');
      }

      if (dots) {
        ML.loop(dotsLis, function(li, i) {
          ML.El.removeClass(li, 'active');
          if (i === current) {
            ML.El.addClass(li, 'active');
          }
        });
      }
    }
  };
})();

(function() {
  var carouselEl = ML.El._$('div');
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
