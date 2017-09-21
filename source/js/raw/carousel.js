/* jshint browser: true, latedef: false */
/* global ML */

(function () {
  'use strict';

  /**
   * * blah
   * * blah, _MLCarousel added - options and methods.
   *
   * @example
   * var carousel = new ML.Carousel(ML.El.$('initCarousel'), {
   *   autoplay: true
   * }, function(index, el) {
   *   console.log('slide index: ', index);
   * })
   * 
   * @param {HTMLElement} el The carousel element.
   * @param {object} [settings] Configuration settings.
   * @param {number} [settings.current=0] The current slide to start on. 0 based.
   * @param {boolean} [settings.autoplay=false] The carousel will start automatically.
   * @param {number} [settings.autoplaySpeed=2000] The autoplay interval in milliseconds.
   * @param {boolean} [settings.dots=false] Dot navigation.
   * @param {boolean} [settings.nav=true] Arrow navigation.
   * @param {function} cb Callback function after slide has animated.
   * @param {number} cb.index The current slide index.
   * @param {HTMLElement} cb.el The carousel element.
   * @constructor
   */
  ML.Carousel = function(el, settings, cb) {
    /**
     * Carousel defaults.
     * @type {object}
     * @private
     */
    var DEFAULTS = {
      current: 0,
      autoplay: false,
      autoplaySpeed: 2000,
      dots: false,
      nav: true
    };

    var options = {};
    var current = 0;
    var self = this;

    var slides = [];
    var ul = null;
    var nextButton = null;
    var prevButton = null;
    var dotsUl = null;
    var dotsLis = [];
    var initialized = false;

    var animating = false;
    var autoplayTimer = null;
    var total = 0;
    var width = 0;
    var carouselHTML = null;

    /**
     * Initializes the carousel.
     */
    this.init = function() {
      carouselHTML = null;
      var gutter = 0;

      if ((typeof el).toLowerCase() !== 'object' && ML.isUndef(el.tagName)) {
        throw new Error('The carousel element must be an HTMLElement.');
      } else {
        options = ML.extend(DEFAULTS, (ML.isUndef(settings, true)) ? {} : settings);
        current = parseInt(options.current);
        width = el.offsetWidth;
        carouselHTML = el.innerHTML;
        options.autoplay = ML.bool(options.autoplay);
        options.dots = ML.bool(options.dots);
        options.nav = ML.bool(options.nav);

        if (!ML.isNum(current)) {
          current = DEFAULTS.current;
        }

        if (!ML.isNum(options.autoplaySpeed)) {
          options.autoplaySpeed = DEFAULTS.autoplaySpeed;
        }

        if (!ML.isBool(options.autoplay)) {
          options.autoplay = DEFAULTS.autoplay;
        }

        if (!ML.isBool(options.nav)) {
          options.nav = DEFAULTS.nav;
        }

        if (!ML.isBool(options.dots)) {
          options.dots = DEFAULTS.dots;
        }
      }

      slides = getSlides();
      total = slides.length;
      gutter = parseInt(ML.El.getStyle(slides[0], 'margin-right').replace('px', ''));
      width = width + gutter;

      el.innerHTML = '<div class="carousel-viewer" style="overflow: hidden;">' + carouselHTML + '</div>';
      ul = ML.El._$('ul', el)[0];
      ul.style.left = -(width * current) + 'px';

      if (options.nav) {
        createNav();
      }

      if (options.dots) {
        createDots();
      }

      initialized = true;
      el._MLCarousel = ML.extend(options, this);
      el._MLCarousel.init = true;
      el._MLCarousel.current = current;

      bindEvents();
      callback(true);

      if (options.autoplay) {
        this.autoplay(true);
      }

      ML.El.addClass(el, 'js-carousel-initialized');
    };

    /**
     * Show the next slide.
     */
    this.next = function() {
      if ((current + 1) === total || !initialized) {
        return;
      }

      current++;
      el._MLCarousel.current = current;
      slide();
    };

    /**
     * Show the previous slide.
     */
    this.prev = function() {
      if (current === 0 || !initialized) {
        return;
      }

      current--;
      el._MLCarousel.current = current;
      slide();
    };

    /**
     * Goes to a specific slide.
     * @param {number} index The slide index.
     */
    this.goTo = function(index) {
      if (initialized) {
        current = index;
        el._MLCarousel.current = current;
        slide();
      }
    };

    /**
     * Toggle autoplay.
     * @param {boolean} start Starts or stops autoplay.
     */
    this.autoplay = function(start) {
      var timer = null;

      if (start) {
        timer = setTimeout(function() {
          cycle();
          clearTimeout(timer);
        }, options.autoplaySpeed);
      } else {
        if (autoplayTimer !== null) {
          clearTimeout(autoplayTimer);
          autoplayTimer = null;
        }
      }
    };

    /**
     * Destroys instance of the carousel.
     */
    this.destroy = function() {
      initialized = false;
      this.autoplay(false);

      if (options.dots) {
        var dotLinks = ML.El._$('a', dotsUl);

        ML.loop(dotLinks, function(item) {
          item.removeEventListener('click', dotClick, false);
        });
      }

      nextButton.removeEventListener('click', paginationClick, false);
      prevButton.removeEventListener('click', paginationClick, false);

      nextButton.parentNode.removeChild(nextButton);
      prevButton.parentNode.removeChild(prevButton);
      dotsUl.parentNode.removeChild(dotsUl);

      el.innerHTML = carouselHTML;

      ML.El.removeClass(el, 'js-carousel-initialized');

      current = 0;
      dotsUl = null;
      dotsLis = [];

      animating = false;
      autoplayTimer = null;
      total = 0;
      width = 0;
      carouselHTML = null;
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
      if (options.dots) {
        var dotLinks = ML.El._$('a', dotsUl);

        ML.loop(dotLinks, function(item) {
          ML.El.evt(item, 'click', dotClick);
        });
      }

      ML.El.evt(nextButton, 'click', paginationClick);

      ML.El.evt(prevButton, 'click', paginationClick);
    }

    /**
     * Click event bound to dot navigation.
     * @param {Event} e The Event object.\
     * @private
     */
    function dotClick(e) {
      e.preventDefault();
      if (self.animating || e.currentTarget.rel === self.curr) {
        return;
      }

      self.autoplay(false);
      self.goTo(parseInt(e.currentTarget.rel));
    }

    /**
     * Click event bound to next and previous buttons.
     * @param {Event} e The Event object.
     * @private
     */
    function paginationClick(e) {
      e.preventDefault();

      if (ML.El.hasClass(e.currentTarget, 'inactive') || animating) {
        return;
      }

      self.autoplay(false);

      if (ML.El.hasClass(e.currentTarget, 'prev')) {
        self.prev();
      } else {
        self.next();
      }
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
    * autoplays through the slides in the carousel based on a timer.
    * @private
    */
    function cycle() {
      if (current < total) {
        current++;
      } else {
        current--;
      }

      if (current === total) {
        current = 0;
      }

      el._MLCarousel.current = current;

      autoplayTimer = setTimeout(function() {
        cycle();
      }, options.autoplaySpeed);

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

      if (options.dots) {
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
