(function () {
  /**
   * * A component for cycling through images, text and other elements, like a carousel.
   * * Nested carousels are not supported, and generally not compliant with accessibility standards.
   * * Each carousel should have a unique `id` attribute.
   * * Every initialized carousel gets `MLCarousel` added to the element. For an example see example below.
   * * When setting `arrowKeys: true`, please note you need to focus on the carousel or an 
   * element within the carousel for the arrow keys to work correctly.
   * * `js-carousel-initialized` class name gets added to the carousel element.
   * * You can initialize carousels via `data-carousel` or JavaScript.
   * * Carousel should be formatted as an unordered list `<ul>` and each `<li>` should 
   * have a class name of `carousel-slide`, i.e. `<li class="carousel-slide"></li>`
   * * [See it in action + some notes!](/carousel.html)
   *
   * @example <caption>Sample carousel HTML (initialized via <code>data-</code> with default settings.):</caption> {@lang xml}
   * <div class="carousel" id="customCarousel" data-carousel>
   *   <ul>
   *     <li class="carousel-slide"><span>0</span><img alt="" src="images/carousel-imgs/giraffe.jpg" /></li>
   *     <li class="carousel-slide"><span>1</span><img alt="" src="images/carousel-imgs/eagle.jpg" /></li>
   *     <li class="carousel-slide"><span>2</span><img alt="" src="images/carousel-imgs/elephant.jpg" /></li>
   *     <li class="carousel-slide"><span>3</span><img alt="" src="images/carousel-imgs/lion.jpg" /></li>
   *   </ul>
   * </div>
   *
   * @example <caption>Rendered HTML with all settings.</caption> {@lang xml}
   * <div class="carousel animals js-carousel-initialized" data-carousel="autoplay:true:dots:true:arrowKeys:true:autoplay:true:infinite:true:current:1" tabindex="0">
   *   <div class="carousel-viewer" style="overflow: hidden;">
   *     <ul style="left: -620px;">
   *       <li class="carousel-slide"><span>3</span><img alt="" src="images/carousel-imgs/lion.jpg" /></li>
   *       <li class="carousel-slide"><span>0</span><img alt="" src="images/carousel-imgs/giraffe.jpg" /></li>
   *       <li class="carousel-slide"><span>1</span><img alt="" src="images/carousel-imgs/eagle.jpg" /></li>
   *       <li class="carousel-slide"><span>2</span><img alt="" src="images/carousel-imgs/elephant.jpg" /></li>
   *       <li class="carousel-slide"><span>3</span><img alt="" src="images/carousel-imgs/lion.jpg" /></li>
   *       <li class="carousel-slide"><span>0</span><img alt="" src="images/carousel-imgs/giraffe.jpg" /></li>
   *     </ul>
   *   </div>
   *   
   *   <a href="#" class="carousel-nav prev"><i>←</i> <span>Previous</span></a>
   *   <a href="#" class="carousel-nav next"><span>Next</span> <i>→</i></a>
   * 
   *   <div class="carousel-dots">
   *     <ul>
   *       <li class=""><a href="#" rel="0">•</a></li>
   *       <li class="active"><a href="#" rel="1">•</a></li>
   *       <li class=""><a href="#" rel="2">•</a></li>
   *       <li class=""><a href="#" rel="3">•</a></li>
   *     </ul>
   *   </div>
   * </div>
   *
   * @example <caption>Initializing carousel via JavaScript</caption>
   * var carousel = new ML.Carousel(ML.El.$('initCarousel'), {
   *   dots: true,
   *   arrowKeys: true,
   *   infinite: true
   * }, function(index, el) {
   *   // Slide complete function. 
   *   // index = current slide index. el = carousel element.
   *   console.log(index, el);
   * });
   *
   * @example <caption>Referencing carousel object in JavaScript.</caption> {@lang xml}
   * <div class="carousel" id="customCarousel" data-carousel>
   *   ...
   * </div>
   *
   * <button id="carouselNext">Next button</button>
   *
   * <script>
   *   var carousel = ML.El.$('customCarousel').MLCarousel;
   *   
   *   carousel.complete(function(index, el) {
   *     console.log(index, el);
   *   });
   *   
   *   ML.El.evt(ML.El.$('carouselNext'), 'click', function(e) {
   *     carousel.next();
   *   });
   * </script>
   * 
   * @param {HTMLElement} el The carousel element.
   * @param {Object} [settings] Configuration settings.
   * @param {Number} [settings.current=0] The current slide to start on.
   * @param {Boolean} [settings.autoplay=false] The carousel will start automatically.
   * @param {Number} [settings.autoplaySpeed=2000] The autoplay interval in milliseconds.
   * @param {Boolean} [settings.dots=false] Dot navigation.
   * @param {Boolean} [settings.nav=true] Arrow navigation.
   * @param {Boolean} [settings.arrowKeys=false] Arrow keyboard navigation.
   * @param {Boolean} [settings.infinite=false] Infinte amount of slides.
   * @param {Function} cb Callback function after slide has animated.
   * @param {Number} cb.index The current slide index.
   * @param {HTMLElement} cb.el The carousel element.
   * @constructor
   */
  ML.Carousel = function(el, settings, cb) {
    /**
     * Carousel defaults.
     * @type {Object}
     * @private
     */
    var DEFAULTS = {
      current: 0,
      autoplay: false,
      autoplaySpeed: 2000,
      dots: false,
      nav: true,
      arrowKeys: false,
      infinite: false
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
    var firstSlide = null;
    var lastSlide = null;
    var slideDirection = 'next';

    var methods = {
      complete: function() {}
    };

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
        options.infinite = ML.bool(options.infinite);
        options.arrowKeys = ML.bool(options.arrowKeys);

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

        if (!ML.isBool(options.infinite)) {
          options.infinite = DEFAULTS.infinite;
        }

        if (!ML.isBool(options.arrowKeys)) {
          options.arrowKeys = DEFAULTS.arrowKeys;
        }

        if (!ML.isBool(options.dots)) {
          options.dots = DEFAULTS.dots;
        }
      }

      slides = getSlides();
      total = slides.length;
      gutter = parseInt(ML.El.getStyle(slides[0], 'margin-right').replace('px', ''));
      width = width + gutter;

      if (!options.infinite) {
        el.innerHTML = '<div class="carousel-viewer" style="overflow: hidden;">' + carouselHTML + '</div>';
        ul = ML.El._$('ul', el)[0];
        ul.style.left = -(width * current) + 'px';
      } else {
        firstSlide = slides[0];
        lastSlide = slides[total - 1];

        firstSlide.parentNode.insertBefore(lastSlide.cloneNode(true), firstSlide);
        lastSlide.parentNode.insertBefore(firstSlide.cloneNode(true), lastSlide.nextSibling);

        el.innerHTML = '<div class="carousel-viewer" style="overflow: hidden;">' + el.innerHTML + '</div>';
        ul = ML.El._$('ul', el)[0];
        ul.style.left = -(width * (current + 1)) + 'px';
      }

      if (options.nav) {
        createNav();
      }

      if (options.dots) {
        createDots();
      }

      initialized = true;
      el.MLCarousel = ML.extend(options, this);
      el.MLCarousel.init = true;
      el.MLCarousel.complete = function(cb2) {
        methods.complete = cb2;
      };
      el.MLCarousel.currentSlideIndex = current;
      ML.El.addClass(el, 'js-carousel-initialized');
      el.setAttribute('tabindex', 0);

      bindEvents();
      callback(true);

      if (options.autoplay) {
        this.autoplay(true);
      }
    };

    /**
     * Show the next slide.
     */
    this.next = function() {
      if (!initialized || animating) {
        return;
      }

      if ((current + 1) === total) {
        if (options.infinite) {
          current = -1;
        } else {
          return;
        }
      }

      self.autoplay(false);
      slideDirection = 'next';

      current++;
      el.MLCarousel.currentSlideIndex = current;
      slide();
    };

    /**
     * Show the previous slide.
     */
    this.prev = function() {
      if (!initialized || animating) {
        return;
      }

      if (current === 0) {
        if (options.infinite) {
          current = total;
        } else {
          return;
        }
      }

      self.autoplay(false);
      slideDirection = 'prev';

      current--;
      el.MLCarousel.currentSlideIndex = current;
      slide();
    };

    /**
     * Goes to a specific slide.
     * @param {Number} index The slide index.
     */
    this.goTo = function(index) {
      if (initialized) {
        self.autoplay(false);
        slideDirection = (current < index) ? 'next' : 'prev';

        current = index;
        el.MLCarousel.currentSlideIndex = current;

        if (options.infinite) {
          goToSlideInfinite();
        } else {
          slide();
        }
      }
    };

    /**
     * Toggle autoplay.
     * @param {Boolean} start Starts or stops autoplay.
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

        dotsUl.parentNode.removeChild(dotsUl);
      }

      if (options.nav) {
        nextButton.removeEventListener('click', paginationClick, false);
        prevButton.removeEventListener('click', paginationClick, false);

        nextButton.parentNode.removeChild(nextButton);
        prevButton.parentNode.removeChild(prevButton);
      }

      if (options.arrowKeys) {
        document.removeEventListener('keydown', paginationKeydown, false);
        el.removeAttribute('tabindex');
      }      

      delete el.MLCarousel;
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
     * @return {Array}
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

      if (options.arrowKeys) {
        // To prevent being bound more than once.
        if (!ML.El.isBound(document, 'keydown', 'paginationKeydown')) {
          ML.El.evt(document, 'keydown', paginationKeydown);
        }
      }
    }

    /**
     * Keydown event bound to document to change current slide.
     * @param {Event} e The Event object.
     * @return {Boolean}
     * @private
     */
    function paginationKeydown(e) {
      var target = document.activeElement;
      var targetParent = ML.El.findParent(target, 'DIV', 'js-carousel-initialized');
      var carouselEl = null;

      if (!ML.isUndef(target.MLCarousel)) {
        carouselEl = target.MLCarousel;
      } else if (targetParent !== false) {
        carouselEl = targetParent.MLCarousel;
      } else {
        return;
      }

      if (carouselEl.arrowKeys) {
        if (e.keyCode === 39) {
          carouselEl.next();
        } else if (e.keyCode === 37) {
          carouselEl.prev();
        }
      }
    }

    /**
     * Click event bound to dot navigation.
     * @param {Event} e The Event object.
     * @private
     */
    function dotClick(e) {
      var target = (e.currentTarget) ? e.currentTarget : e.srcElement;

      e.preventDefault();

      if (self.animating || target.rel === self.curr) {
        return;
      }

      self.goTo(parseInt(target.rel));
    }

    /**
     * Click event bound to next and previous buttons.
     * @param {Event} e The Event object.
     * @private
     */
    function paginationClick(e) {
      var target = (e.currentTarget) ? e.currentTarget : e.srcElement;

      e.preventDefault();

      if (ML.El.hasClass(target, 'inactive') || animating) {
        return;
      }

      // Added for IE.
      if (/carousel-nav/.test(target.parentNode.className)) {
        target = target.parentNode;
      }

      if (ML.El.hasClass(target, 'prev')) {
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
      var desired = -(width * current);
      animating = true;

      if (options.infinite) {
        var delta = (slideDirection === 'prev') ? -1 : 1;
        desired = parseInt(window.getComputedStyle(ul).getPropertyValue("left")) + (-width * delta);
      }

      ML.Animate(ul, {left: desired}, {relative: false}, function() {
        animating = false;
        callback(false);

        if (options.infinite) {
          if (current === 0 && slideDirection === 'next') {
            ul.style.left = -width + 'px';
          } else if (current === (total - 1) && slideDirection === 'prev') {
            ul.style.left = -(width * total) + 'px';
          }
        }
      });
    }

    /**
     * Animates the carousel to slide to each desired slide.
     * Spearate function when navigating via dots and when `infinite: true`
     * @private
     */
    function goToSlideInfinite() {
      var desired = -(width * (current + 1));
      animating = false;

      ML.Animate(ul, {left: desired}, {relative: false}, function() {
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

      el.MLCarousel.currentSlideIndex = current;

      autoplayTimer = setTimeout(function() {
        cycle();
      }, options.autoplaySpeed);

      slide();
    }

    /**
    * Function to be called after each slide.
    * @param {Boolean} init Intialization of the callback.
    * Used to set elements inactive/active on load.
    * @private
    */
    function callback(init) {
      if (!init) {
        methods.complete(current, el);

        if (typeof cb === 'function') {
          cb(current, el);
        }
      }

      ML.El.removeClass(nextButton, 'inactive');
      ML.El.removeClass(prevButton, 'inactive');

      if (!options.infinite) {
        if (current === 0) {
          ML.El.addClass(prevButton, 'inactive');
        } else if (current + 1 === total) {
          ML.El.addClass(nextButton, 'inactive');
        }
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
