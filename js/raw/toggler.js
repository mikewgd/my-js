(function () {	
	/**
	* @class Toggle
	* @namespace ML
	*
	* @property {HTMLElement} c - element you want toggled.
	* @property {function} func (optional) - function you want performed after each toggle.
	*/
	ML.Toggle = function (c, func) {
		var content = c;
		var currVis = ML.El.getStyl(content, 'display');
		
		content.style.display = (currVis == 'block') ? 'none' : 'block';
		if (func) func((currVis == 'block') ? false : true);
	}
	
	/**
	* @class slideToggle
	* @namespace ML
	*
	* @property {HTMLElement} c - element you want toggled.
	* @property {function} func (optional) - function you want performed after each toggle.
	*/
	ML.slideToggle = function (c, func) {
		var content = c;
		var currVis = ML.El.getStyl(content, 'display');
						
		var slide = (currVis == 'block') ? 'up' : 'down';
		var increment = 0,
			animation = null;
		
		ML.El.styl(content, {
			overflow: 'hidden',
			display: 'block',
			height: 'auto'
		});
		
		content.setAttribute('data-height', content.offsetHeight);
		content.style.height = (slide == 'down') ? '0px' : content.offsetHeight+'px'

		animate();
		
		/**
		* @function currHeight
		* Returns the current height of the content element.
		*/
		function currHeight() {
			var styleHeight = content.style.height.split('px')[0];
			return parseInt(styleHeight);
		}
		
		/**
		* @function animate
		* Handles on animating the content up and down.
		*/
		function animate() {
			increment++;
						
			content.style.height = ((slide == 'down') ? increment : ML.El.data(content, 'height')-increment)+'px';
			animation = setTimeout(animate, 0);
						
			if (currHeight() == ML.El.data(content, 'height') || currHeight() == 0) {
				clearTimeout(animation);
				if (currHeight() == 0) content.style.display = 'none';	
				if (func) func((currVis == 'block') ? false : true);
			}
		}
	}
}());