/**
* @class CarouselHandler
* @namespace ML
* Handles calling the Carousel class.
*/
ML.CarouselHandler = function() {
    var car = ML.$C('.carousel');

    for (var i = 0; i < car.length; i++) {
        var data = ML.El.data(car[i], 'carousel');
        var c = new ML.Carousel(car[i], ML.ParObj({
            elem: data
        }));
        c.init();
    }
};

/**
* @class Carousel
* @namespace ML
*
* @property {Number} width - number to slide each <li>.
* @property {Number} curr - current active/shown slide.
* @property {Number} gutter - spacing between each slide (i.e. margin-right for each <li> element).
* @property {Number} total - total slides, needed for if more than one in viewer.
* @property {HTMLElement} el - carousel element.
* @property {HTMLElement} ul - ul element holding slides.
* @property {Object} lis - an array of all the slides (i.e. <li> elements) in the carousel.
* @property {Object} pag - the next and previous arrows.
* @property {Boolean} jump - true/false to show the jump links (i.e. dots).
* @property {Boolean} rotate - enable/disable auto rotate of the carousel.
* @property {Boolean} animating - carousel animating or not.
* @property {Number} rotateSpeed - auto rotate speed.
* @property {Function} animation - setTimeout function for animation.
*/
ML.Carousel = function(car, settings, func) {
    var defaults = {
        curr: 0,
        rotate: false
    };

    return {
        width: 0,
        curr: parseInt(settings.curr) || defaults.curr,
        gutter: 0,
        total: 0,

        el: car,
        ul: null,
        lis: [],
        pag: [],

        jump: false,
        rotate: Boolean(settings.rotate) || defaults.rotate,
        animating: false,
        rotateSpeed: 2000,

        animation: null,

        /**
        * @function init
        * Initialization of functions and sets the objects to appropriate values.
        */
        init: function() {
            var self = this,
                carousel = self.el;

            // Finds all elements in carousel
            ML.loop(carousel.childNodes, function(item, i) {
                if (ML.hasClass(item, 'jump')) {
                    self.jump = item;
                } else if (ML.hasClass(item, 'viewer')) {
                    item.style.overflow = 'hidden';
                    self.ul = item.childNodes[0];
                    self.width = item.offsetWidth;
                } else if (ML.hasClass(item, 'pag')) {
                    self.pag.push(item);
                }
            });

            self.lis = ML._$('li', self.ul);

            var firstLi = self.lis[0],
                slideLength = self.lis.length;

            self.gutter = parseInt(ML.El.getStyl(firstLi, 'marginRight').replace('px', ''));
            self.width = self.width + self.gutter;
            self.total = self.getTotal(slideLength, firstLi.offsetWidth);

            // Sets the current slide position & set UL width
            ML.El.styl(self.ul, {
                'left': -self.width * self.curr + 'px',
                'width': (firstLi.offsetWidth * slideLength) + (self.gutter * slideLength) + 'px'
            });

            if (self.jump) self.createJumpLinks();
            self.bindEvents();
            self.callback(true);
            
            if (self.rotate) setTimeout(function() {
                self.cycle();
            }, self.rotateSpeed);
        },

        /**
        * @function getTotal
        * Returns the real total number of slides. Uses the width to figure out how many <li>s are in the viewer.
        * Then translates that into the amount of slides to assign to the carousel.
        *
        * @param {Number} len - total <li> elements in carousel viewer.
        * @param {Number} wi - width of the first <li> element.
        */
        getTotal: function(len, wi) {
            var t;
            for (var i = 0; i < len; i++) {
                var eq = (wi + this.gutter) * i;
                if (eq == this.width) t = i;
            }

            return len / t;
        },

        /**
        * @function createJumpLinks
        * Creates the jump links if it is enabled.
        */
        createJumpLinks: function() {
            var self = this;
            var jumpUL = ML.El.create('ul');

            self.jump.appendChild(jumpUL);

            for (var i = 0; i < self.total; i++) {
                var li = ML.El.create('li');
                li.innerHTML = '<a href="javascript:void(0)" rel="' + i + '">&bull;</a>';
                jumpUL.appendChild(li);
            }
        },

        /**
        * @function bindEvents
        * Binds events to necessary elements.
        */
        bindEvents: function() {
            var self = this,
                jumpLinks = ML._$('a', self.jump);

            // Previous & Next Arrows
            ML.loop(self.pag, function(item, i) {
                ML.El.evt(item, 'click', function(e) {
                    e.preventDefault;
                    var link = ML.El.clicked(e);
                    if (ML.hasClass(link, 'inactive') || self.animating) return;
                    (link.rel == 'nxt') ? self.curr++ : self.curr--;

                    self.stopCycle();
                    self.slide();
                    return false;
                });
            });

            ML.loop(jumpLinks, function(item, i) {
                ML.El.evt(item, 'click', function(e) {
                    var link = ML.El.clicked(e),
                        num = parseInt(link.rel);

                    if (self.animating || num == self.curr) return;

                    self.curr = num;
                    self.stopCycle();
                    self.slide();
                });
            });
        },

        /**
        * @function slide
        * Animates the carousel to slide to each desired slide.
        */
        slide: function() {
            var self = this;

            self.animating = true;
            var desired = self.width * self.curr;

            ML.animate(self.ul, {left: -desired}, function(){
                self.animating = false;
                self.callback(false);
            });
        },

        /**
        * @function callback
        * Function to be called after each slide.
        *
        * @param {Boolean} init - intialization of the callback. Used to set elements inactive/active on load.
        */
        callback: function(init) {
            var self = this,
                curr = self.curr;

            if (!init && func) func(curr, self.el);

            // Arrow control
            ML.loop(self.pag, function(item, i) {
                ML.removeClass(item, 'inactive');

                if (item.rel == 'prv' && curr == 0) {
                    ML.addClass(item, 'inactive');
                } else if (item.rel == 'nxt' && curr + 1 == self.total) {
                    ML.addClass(item, 'inactive');
                }
            });

            // Jump Links
            if (self.jump) {
                var lis = ML._$('li', this.jump);

                ML.loop(lis, function(li, i) {
                    ML.removeClass(li, 'active');
                    if (i == curr) ML.addClass(li, 'active');
                });
            }
        },

        /**
        * @function stopCycle
        * Stops the autorotation of the carousel.
        */
        stopCycle: function() {
            this.rotate = false;
            clearTimeout(this.animation);
        },

        /**
        * @function cycle
        * Rotates through the slides in the carousel based on a timer.
        */
        cycle: function() {
            var self = this;

            if (!self.rotate) return;

            (self.curr < self.total) ? self.curr++ : self.curr--;

            if (self.curr == self.total) self.curr = 0;

            self.animation = setTimeout(function() {
                self.cycle();
            }, self.rotateSpeed);

            self.slide();
        }
    }
};