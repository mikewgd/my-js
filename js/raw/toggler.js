(function () {	
	/**
	* @class Toggle
	* @namespace ML
	*
	* @property {HTMLElement} c - element you want toggled.
	* @property {function} func (optional) - function you want performed after each toggle.
	*/
	ML.Toggle = function (c, func) {
		var content = c,
			currVis = ML.El.getStyl(content, 'display');
		
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
		var content = c, actualHeight,
			currVis = ML.El.getStyl(content, 'display'),
			slide = (currVis == 'block') ? 'up' : 'down';
		
		content.style.overflow = 'hidden';
		
		if (slide == 'down') {
			content.style.display = 'block';
			actualHeight = content.offsetHeight;
			content.style.height = 0;
		} else {
			actualHeight = 0;
		}
		
		ML.El.animate(content, {height: (slide == 'down') ? actualHeight : 0}, function() {
			if (actualHeight == 0) {
				content.removeAttribute('style');
				content.style.display = 'none';	
			}

			if (func) func((currVis == 'block') ? false : true);
		});
	}
}());