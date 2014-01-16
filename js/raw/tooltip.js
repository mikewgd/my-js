/**
* @class TooltipHandler
* @namespace ML
* Handles calling the Tooltip class.
*/
ML.TooltipHandler = function () {
	var tags = ML._$('*', document.body);
	
	for (var i=0; i<tags.length; i++) {
		var attr = ML.El.data;
		
		if (attr(tags[i], 'tooltip') !== null) {
			if (tags[i].title) tags[i].rel = 'mlTooltip-'+i;	
			var t = new ML.Tooltip(tags[i],  ML.ParObj({elem: ML.El.data(tags[i], 'tooltip')}));
			t.init();
		}
	}
};

/**
* @class Tooltip
* @namespace ML
*
* @property {Number} width - width of tooltip.
* @property {String} direction - where to show the the tooltip.
* @property {HTMLElement} link - element that activates tooltip, does not need to be a link.
* @property {HTMLElement} el - the tooltip.
* @property {String} template - standard template/HTML structure of a tooltip.
* @property {HTMLElement} arrow - arrow element in tooltip.
*/
ML.Tooltip = function(tip, settings) {
	
	var defaults = {width: 300, direction: 'right'};
	
	return {
		width: parseInt(settings.width) || defaults.width,
		direction: settings.direction || defaults.direction,
		link: tip,
		el: null,
		template: '<span class="arrow"></span><p class="content">{{message}}</p>',
		arrow: null,

		/**
		* @function init
		* Initialization of functions. Also creates the dynamic tooltip.
		*/
		init : function () {
			if (this.link.title){
				this.create(this.link);
				this.link.removeAttribute('title');
			} else {
				this.el = ML.$(this.link.rel)
			}
							
			if (this.el == null) {return false;}
			
			this.bindEvents();
		},
		
		/**
		* @function bindEvents
		* Binds events to the link (tooltip activation).
		*/
		bindEvents: function() {
			var self = this;
			
			ML.El.evt(self.link, 'mouseover', function(e) {self.show();}, true);
			ML.El.evt(self.link, 'mouseout', function(e) {self.hide();}, true);
		},
		
		/**
		* @function create
		* Creates a custom tooltip and adds it to the DOM.
		* 
		* @param {HTMLElement} dyn - element that needs a custom tooltip.
		*/
		create: function(dyn) {
			var div = ML.El.create('div', {'class': 'tooltip hidden', id: dyn.rel});
			div.innerHTML = this.template.replace('{{message}}', dyn.title);
			document.body.appendChild(div);
			this.el = div;
		},
		
		/**
		* @function show
		* Shows the tooltip and put the set width on it and etc...
		*/
		show: function () {
			var self = this,
				tooltip = self.el,
				tags = tooltip.getElementsByTagName('*');
						
			ML.removeClass(tooltip, 'hidden');
			ML.addClass(tooltip, self.direction);
			tooltip.style.width = self.width+'px';
			
			for (var i=0; i<tags.length; i++) {
				if (ML.hasClass(tags[i], 'arrow')) self.arrow = tags[i];
			}
			
			self.positionTooltip();
		},
		
		/**
		* @function hide
		* Hides all tooltips.
		*/
		hide: function() {
			var tooltips = ML.$C('.tooltip');
			
			for (var i=0; i<tooltips.length; i++) {
				ML.removeClass(tooltips[i], this.direction);
				ML.addClass(tooltips[i], 'hidden');
			}
		},
		
		/**
		* @function positionTooltip
		* Positions the tooltip based on the direction set.
		*/
		positionTooltip: function() {
			var tooltip = this.el, arrow = this.arrow,
				linkDimens = ML.El.dimens(this.link),
				tipDimens = ML.El.dimens(tooltip);
				
			this.arrow.removeAttribute('style');
			
			switch (this.direction) {
				case 'right':
					ML.El.styl(tooltip, {
						top: Math.abs((tipDimens.height/2) - linkDimens.y - linkDimens.height)-arrow.offsetWidth + 'px', 
						left: linkDimens.x  + linkDimens.width + 'px'
					});
					
					ML.El.styl(arrow, {left:0, top:(tipDimens.height/2)-(arrow.offsetHeight/2) + 'px'});
				break;
				
				case 'left':
					ML.El.styl(tooltip, {
						top: Math.abs((tipDimens.height/2) - linkDimens.y - linkDimens.height)-arrow.offsetWidth + 'px', 
						left: linkDimens.x-tooltip.offsetWidth + 'px'
					});
					
					ML.El.styl(arrow, {right:0, top:(tipDimens.height/2)-(arrow.offsetHeight/2) + 'px'});
				break;
				
				case 'top':
					ML.El.styl(tooltip, {
						top: linkDimens.y - tipDimens.height + 'px', 
						left: linkDimens.x - (tooltip.offsetWidth/2) + (linkDimens.width/2) + 'px'
					});
										
					ML.El.styl(arrow, {bottom:0, left:(tooltip.offsetWidth/2)  + 'px'});
				break;
				
				case 'bottom':
					ML.El.styl(tooltip, {
						top: linkDimens.y + linkDimens.height + 'px', 
						left: linkDimens.x - (tooltip.offsetWidth/2) + (linkDimens.width/2) + 'px'
					});
										
					ML.El.styl(arrow, {top:0, left:(tooltip.offsetWidth/2)  + 'px'});
				break;
			}
		}
	}
	
};