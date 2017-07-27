(function () {
	/**
	* @function PHsupported
	* Find out if the "placeholder" attribute is supported.
	*/
	var PHsupported = function () {
		var createInput = ML.El.create('input');
		return ('placeholder' in createInput) ? true : false;
	}

	/**
	* @class InputControl
	* @namespace ML
	* Adds placeholder functionality if not supported and adds a class of "focus" when input is focused.
	*
	* @param {String} ph - value of "placeholder" attribute.
	* @param {HTMLElement} el - input field.
	* @param {function} cursorTimer - timer for activating the move cursor function, needed for Chrome.
	*/
	ML.InputControl = function (input) {
		return {
			ph: ML.El.getAttr(input, 'placeholder'),
			el: input,
			cursorTimer: null,

			/**
			* @function init
			* Initialization of input control.
			* If a placeholder attribute is on the input, takes the value and places it into the value attribute.
			*/
			init: function () {
				if (this.ph !== null) {
					this.el.setAttribute('value', this.ph);
					ML.addClass(this.el, 'placeholder');
				}
			
				this.bindEvents();
			},

			/**
			* @function bindEvents
			* Binds events to the input(s).
			*/
			bindEvents: function () {
				var self = this;
				
				ML.El.evt(self.el, 'focus', function (e){
					var inp = ML.El.clicked(e);
				
					ML.addClass(inp, 'focus');
				
					self.moveCursor(inp);
					self.cursorTimer = setTimeout(function() {self.moveCursor(inp)}, 1);
				});
				
				ML.El.evt(self.el, 'blur', function (e){
					ML.removeClass(ML.El.clicked(e), 'focus');
					clearTimeout(self.cursorTimer);
				});
				
				ML.El.evt(self.el, 'click', function (e) {
					if (ML.hasClass(ML.El.clicked(e), 'focus')) self.moveCursor(ML.El.clicked(e));
				});
				
				if (self.ph !== null) {
					ML.El.evt(input, 'keyup', function (e) {self.clearUnclear(ML.El.clicked(e));});
				}
			},

			/**
			* @function moveCursor
			* When input is focused. This will move the cursor to the beginning of the text in the input.
			* This is to replicate the same effect of the "placeholder" attribute in supported browsers.
			* Credits: http://stackoverflow.com/questions/8189384/i-want-to-put-cursor-in-beginning-of-text-box-onfocus
			*
			* @param {HTMLElement} inp - input focused/clicked on.
			*/
			moveCursor: function (inp) {
				if (!ML.hasClass(inp, 'placeholder')) {
					return;
				} else {
					if (typeof inp.selectionStart == "number") {
						inp.selectionStart = inp.selectionEnd = 0;
					} else if (typeof inp.createTextRange != "undefined") {
						inp.focus();
						var range = inp.createTextRange();
						range.collapse(true);
						range.select();
					}
				}
			},

			/**
			* @function clearUnclear
			* Once user starts typing in the input field. This removes the current value in the input field.
			* Replicates the "placeholder" functionality in supported browsers.
			*
			* @param {HTMLElement} _input - input field.
			*/
			clearUnclear: function (_input) {
				var old = ML.El.getAttr(_input, 'placeholder'),
					_new = _input.value.replace(old, '');
			
				if (ML.hasClass(_input, 'placeholder')) _input.value = _new;
				ML.removeClass(_input, 'placeholder');
			
				// No characters in input field
				if (_input.value.length < 1) {
					_input.value = old;
					ML.addClass(_input, 'placeholder');
					this.moveCursor(_input);
				}                                       
			}
		}
	}

	// If "placeholder" attribute is not supported Loop around all <input> tags.
	if (!PHsupported()) {
		var allInputs = ML._$('input');
		for (var i=0; i<allInputs.length; i++) {
			if(allInputs[i].type == 'text') {
				var ic = new ML.InputControl(allInputs[i]);
				ic.init();
			}
		}
	}
}());