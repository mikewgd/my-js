/**
* @class CarouselHandler
* @namespace ML
* Handles calling the Carousel class.
*/
ML.CarouselHandler = function () {
	var car = ML.$C('.carousel');
		
	for (var i=0; i<car.length; i++) {
		var data = ML.El.data(car[i], 'carousel');
		var c = new ML.Carousel(car[i],  ML.ParObj({elem: data}));
		c.init();
	}
};

/**
* @class Carousel
* @namespace ML
*
* @property {Number} width - number to slide each carousel holder (i.e. <ul> element).
* @property {Number} curr - current active/shown slide.
* @property {Number} gutter - spacing between each slide (i.e. margin-right for each <li> element).
* @property {Number} incr - number to be incremented for animation.
* @property {Number} total - total slides, this is NOT the length of the slides. Needed for if more than one in viewer. 
* @property {HTMLElement} el - carousel element.
* @property {HTMLElement} holder - ul element holding slides.
* @property {Object} slides - an array of all the slides (i.e. <li> elements) in the carousel.
* @property {Object} pag - the next and previous arrows.
* @property {Boolean} jump - true/false to show the jump links (i.e. dots).
* @property {Boolean} rotate - enable/disable auto rotate of the carousel.
* @property {Boolean} animating - carousel animating or not.
* @property {Function} animation - setTimeout function for animation.
*/
ML.Carousel = function(car, settings, func) {
	
	var defaults = {curr: 0, rotate: false};
	
	return {
		width: 0,
		curr: parseInt(settings.curr) || defaults.curr,
		gutter: 0,
		incr: 0,
		total: 0,
		
		el: car,
		holder: null,
		slides: [],
		pag: [],
		
		jump: false,
		rotate: Boolean(settings.rotate) || defaults.rotate,
		animating: false,
		
		animation: null,
		
		/**
		* @function init
		* Initialization of functions and sets the objects to appropriate values.
		*/
		init: function () {
			var self = this, carousel = self.el;
									
			// Finds all elements in carousel			
			ML.loop(carousel.childNodes, function(item, i) {
				if (ML.hasClass(item, 'jump')) {
					self.jump = item;
				} else if (ML.hasClass(item, 'viewer')) {
					item.style.overflow = 'hidden';
					self.holder = item.childNodes[0];
					self.width = item.offsetWidth;
				} else if (ML.hasClass(item, 'pag')) {
					self.pag.push(item);
				}
			});
						
			self.slides = ML._$('li', self.holder);
			
			var firstLi = self.slides[0],
				slideLength = self.slides.length;
				
			self.gutter = parseInt(ML.El.getStyl(firstLi, 'margin-right').replace('px', ''));
			self.width = self.width+self.gutter;
			self.total = self.getTotal(slideLength, firstLi.offsetWidth);
						
			// Sets the current slide position & set UL width
			ML.El.styl(self.holder, {
				'left': -self.width*self.curr+'px',
				'width': (firstLi.offsetWidth*slideLength)+(self.gutter*slideLength)+'px'
			});
			
			if (self.jump) self.createJumpLinks();
			self.bindEvents();
			self.callback(true);
			if (self.rotate) setTimeout(function(){self.cycle();}, 8000);
		},
		
		/**
		* @function getTotal
		* Returns the real total number of slides. Uses the width to figure out how many <li>s are in the viewer.
		* Then translates that into the amount of slides to assign to the carousel.
		* 
		* @param {Number} len - total <li> elements in carousel viewer.
		* @param {Number} wi - width of the first <li> element.
		*/
		getTotal: function (len, wi) {
			var t;
			for (var i=0; i<len; i++) {
				var eq = (wi+this.gutter)*i;
				if (eq == this.width) t = i;
			}
			
			return len/t;
		},
		
		/**
		* @function createJumpLinks
		* Creates the jump links if it is enabled.
		*/
		createJumpLinks: function () {
			var self = this;
			var jumpUL = ML.El.create('ul');
			
			self.jump.appendChild(jumpUL);
			
			for (var i=0; i<self.total; i++) {
				var li = ML.El.create('li');
				li.innerHTML = '<a href="javascript:void(0)" rel="'+i+'">&bull;</a>';
				jumpUL.appendChild(li);	
			}
		},
		
		/**
		* @function bindEvents
		* Binds events to necessary elements.
		*/
		bindEvents: function () {
			var self = this,
				jumpLinks = ML._$('a', self.jump);
				
			// Previous & Next Arrows
			ML.loop(self.pag, function (item, i) {
				ML.El.evt(item, 'click', function (e) {
					e.preventDefault;
					var link = ML.El.clicked(e);
					if (ML.hasClass(link, 'inactive') || self.animating) return;
					self.stopCycle();
					self.animate(link.rel, false);
					return false;
				}, true);
			});
			
			ML.loop(jumpLinks, function (item, i) {
				ML.El.evt(item, 'click', function (e) {
					var link = ML.El.clicked(e),d,
						num = parseInt(link.rel);
						
					if (self.animating || num == self.curr) return;
					
					d = (num > self.curr) ? 'nxt' : 'prv';
					self.curr = num;
					
					self.stopCycle();
					self.animate(d, true);
					
				}, true);
			});
		},
		
		/**
		* @function animate
		* Animates the carousel to slide to each desired slide.
		* 
		* @param {String} dir - direction for the holder to go nxt (next), prv (previous).
		*/
		animate: function (dir, override) {
			var self = this,
				ul = self.holder,
				currLeft = parseInt(ul.style.left.replace('px', '')),
				fwd = (dir == 'nxt') ? true : false, n;
			
			self.incr = 0;
			self.animating = true;
			
			if (!override) {
				(fwd) ? self.curr++ : self.curr--;
			}
		
			var current = self.curr;
			var desired = self.width*current;
						
			// Speeds up increment 
			for (var i=1; i<5; i++) {if (self.width % i == 0) n=i;	}
			
			/**
			* @function anim
			* Animates the <ul> element in the carousel.
			*/
			var anim = function () {
				self.incr = self.incr+n;
				
				ul.style.left = ((fwd) ? currLeft-self.incr : currLeft+self.incr) +'px';
				self.animation = setTimeout(function() {anim()},0);
				
				var newLeft = Math.abs(parseInt(ul.style.left.replace('px', '')));
				
				if (newLeft == desired) {
					clearTimeout(self.animation);
					self.animating = false;
					self.callback(false);
				}
			}

			anim();
		},
		
		/**
		* @function callback
		* Function to be called after each slide.
		*
		* @param {Boolean} init - intialization of the callback. Used to set elements inactive/active on load.
		*/
		callback: function (init) {
			var self = this,
				curr = self.curr;
				
			if (!init && func) func(curr);
			
			// Arrow control
			ML.loop(self.pag, function (item, i) {
				ML.removeClass(item, 'inactive');
				
				if (item.rel == 'prv' && curr == 0) {
					ML.addClass(item, 'inactive');
				} else if (item.rel == 'nxt' && curr+1 == self.total) {
					ML.addClass(item, 'inactive');
				}
			});
	
			// Jump Links
			if (self.jump) {
				var lis = ML._$('li', this.jump);
				
				ML.loop(lis, function(li, i){
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
		cycle: function () {
			var self = this;
			
			if (!self.rotate) return;
			var d = (self.curr < self.total) ? 'nxt' : 'prv';
			
			if (self.curr < self.total) { 
				self.curr++; 
			} else { 
				self.curr--; 
			}
			
			if (self.curr == self.total) {
				self.curr = 0;	
				d='prv';
			}
			
			self.animation = setTimeout(function () { self.cycle() }, 8000);
			self.animate(d, true);
		}
	}
	
};