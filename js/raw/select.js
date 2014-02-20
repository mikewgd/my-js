(function () {	
	/**
	* @class SEL
	* @namespace ML
	* Custom select menu.
	*
	* @property {Object} inputs - all radios and checkboxes on the page are stored here.
	* @property {Object} custom - custom radios and checkboxes are stored here.
	* @property {Object} attachedEvents - events attached to <input> elements, i.e click/focus/blur event(s).
	* @property {Object} links - <a>s "options" in the custom select menu.
	*/
	ML.SEL = {
		selects: [],
		customs: [],
		attachedEvents: {click: [], focus: [], blur: [], change: []},
		links: [],
		
		/**
		* @function setup
		* Gets all the <select>s and stores them in an array.
		* Creates a custom select menu  for each <select> element and then its inserted into the DOM.
		*
		* @param {HTMLElement} findIn (optional) - an element to look for <select>. Good for when adding to the DOM.
		*/
		setup: function (findIn) {
			var self = this,
				select = (findIn) ? ML._$('select', findIn) : ML._$('select');
				
			ML.loop(select, function(_select, i) {
				if (ML.hasClass(_select, 'sys') || ML.hasClass(_select, 'styled')) return;
				self.selects.push(_select);
			});
			
			ML.loop(self.selects, function (select, i) {
				self.customs[i] = ML.El.create('div', {'class': 'select'});
				ML.addClass(select, 'styled');
			
				var dropdownLink = ML.El.create('a', {href: 'javascript:void(0);', 'class': 'dropdown-link', tabIndex: -1}),
					menuHolder = ML.El.create('div'),
					menu = ML.El.create('ul');
					
				// set up new select menu and place after the <select> tag
				self.customs[i].appendChild(dropdownLink);
				self.customs[i].appendChild(menuHolder);
				menuHolder.appendChild(menu);
				
				ML.El.clean(select.parentNode);
				
				// adds the custom select after the <select>
				select.parentNode.insertBefore(self.customs[i], select.nextSibling);
				
				if(select.disabled == true) {ML.addClass(self.customs[i], 'disabled');}
				
				self.createLiElems(select, self.customs[i]);
				self.pushEvents(select);
				ML.El.clean(self.customs[i]);
				
				// sets the width of the new select div to the width of the <ul>
				self.customs[i].style.width = ML._$('ul', self.customs[i])[0].offsetWidth + 'px';
			});
	
			self.bindEvents(false);
		},
		
		/**
		* @function attachOldEvt
		* Attaches the old events stored in the event object to be applied.
		*
		* @param {HTMLElement} el - the element to see if it is an event attached to it.
		* @param {String} evtType - type of event to look for.
		*/
		createLiElems: function (select, custom) {
			var options = ML._$('option', select),
				ul = ML._$('ul', custom)[0];
			
			for (var i=0; i<options.length; i++) {
				var li = ML.El.create('li', {'data-value': options[i].value, 'data-index': i}),
					link = ML.El.create('a', {'href': 'javascript:void(0);', tabIndex: -1}),
					text = document.createTextNode(options[i].innerHTML);	
					
				li.appendChild(link);
				link.appendChild(text);
				ul.appendChild(li);
				
				if (options[i].disabled) ML.addClass(li, 'disabled');
				
				// if there is a selected option, put it in the dropdown link
				if (options[i].selected == true) {
					var dropLink = ML._$('a', custom)[0];
					dropLink.innerHTML = options[i].innerHTML;
					dropLink.setAttribute('data-index', i);
					custom.setAttribute('sel-data-value', options[i].value);
				}
			}
		},
		
		/**
		* @function pushEvents
		* Any events attached to the radio buttons or checkboxes are pushed into an array to be used later.
		*
		* @param {HTMLElement} input - radio button or checkbox element.
		*/
		pushEvents: function (input) {
			var events = ML.El.Events;
			for (var i=0; i<events.length; i++) {
				var elem = events[i][0], type = events[i][1], func = events[i][2];
				// Only pushes the events if <input> has any events attached to it.	
				if (elem == input) this.attachedEvents[type].push([elem, func]);	
			}
		},
		
		/**
		* @function attachOldEvt
		* Attaches the old events stored in the event object to be applied.
		*
		* @param {HTMLElement} el - the element to see if it has an event attached to it.
		* @param {String} evtType - type of event to look for.
		*/
		attachOldEvt: function (el, evtType) {
			var evt = this.attachedEvents[evtType], inputEvt;
			for (i=0; i<evt.length; i++) {
				var attachedEl = evt[i][0];
				if (attachedEl == el) inputEvt = evt[i][1];
			}
			
			return inputEvt ? inputEvt.call() : (function(){return;});
		},
	
		/**
		* @function bindEvents
		* Binds events to the <select> and the custom select menu
		*
		* @param {HTMLElement} optEvnt - links in the custom select menu "options".
		*/
		bindEvents: function (optEvt) {
			var self = this;
			
			if (optEvt) {
				// Events for links in the custom select menu.
				ML.El.evt(optEvt, 'click', function(e){
					var clicked = ML.El.clicked(e), attr = ML.El.data, li = clicked.parentNode, custom = li.parentNode.parentNode.parentNode;
					var args = {index: attr(li, 'index'), value: attr(li, 'value'), text: clicked.innerHTML}
					
					if (ML.hasClass(li, 'disabled')) return;
					
					if (args.value !== ML.El.getAttr(custom, 'sel-data-value')) {
						self.selectOption(custom, args);
						self.attachOldEvt(custom.previousSibling, 'change');
					}
				});
				
				// Removes selected state from <li>
				ML.El.evt(optEvt, 'mouseover', function(e){
					var clicked = ML.El.clicked(e), ul = clicked.parentNode.parentNode;
					ML.loop(ML._$('li', ul), function(li, i){ML.removeClass(li, 'selected');});
				});
			} else {
				ML.loop(self.selects, function(select, i) {
					ML.El.evt(select, 'focus', function(e) {self.focusBlur(e);}, true);
					ML.El.evt(select, 'blur', function(e) {self.focusBlur(e);});
					ML.El.evt(select, 'change', function(e) {
						var el = ML.El.clicked(e), selected = el.selectedIndex;
						var args = {index:selected, value:el.childNodes[selected].value, text:el.childNodes[selected].innerHTML}
						
						self.selectOption(el.nextSibling, args);
					});
				});
				
				ML.El.evt(document, 'click', function(e) {
					var clicked = ML.El.clicked(e);
					
					if (ML.hasClass(clicked, 'disabled') || ML.hasClass(clicked.parentNode, 'disabled')) return;
					self.toggle(clicked, clicked.parentNode);
				});
			}
		}, 

		/**
		* @function toggle
		* This opens and closes the custom select menu and also allows only one to be open at a time.
		* Also has events attached to the <li> element to remove the selected state, to replicate the <select> functionality.
		*
		* @param {HTMLElement} clicked - element being clicked, event is bound to document to.
		* @param {HTMLElement} clickedParent - parent element to element being clicked on.
		*/
		toggle: function (clicked, clickedParent) {
			var self = this;
			
			if (ML.hasClass(clickedParent, 'select')) {
				if (clicked.className == 'dropdown-link') {
					var div = clickedParent;
					
					if (!ML.hasClass(div, 'focus')) ML.addClass(div, 'focus');
					
					// Handles the toggling of the select menu and allowing only one to be open at a time.
					ML.loop(ML.$C('.select'), function(c,i) {if (c!==clickedParent) ML.removeClass(c, 'active'); ML.removeClass(c, 'focus');});
					ML.toggleClass(div, 'active');
				
					self.links = '';
					self.links = ML._$('a',clicked.nextSibling);
					ML.loop(self.links, function(link, i) {self.bindEvents(link);});
					
					// Adds selected to currently selected item
					ML._$('li', div)[ML.El.data(clicked, 'index')].className = 'selected';
					self.attachOldEvt(div.previousSibling, 'click');		
				}
			} else {
				for (var i=0;i<self.customs.length;i++) {ML.removeClass(self.customs[i], 'active'); ML.removeClass(self.customs[i], 'focus');}
			}
		},
		
		/**
		* @function selectOption
		* Handles the changing of the selected item in the custom select menu as well as the <select>
		*
		* @param {HTMLElement} el - custom select menu.
		* @param {Object} args - arguments passed.
		*** @param {Number} index - position or index in the DOM.
		*** @param {String} value - value of the option/link selected.
		*** @param {String} text - the text within the option/link.
		*/
		selectOption: function(el, args) {
			var select = el.previousSibling,
				dropLink = ML._$('a', el)[0];
				
			dropLink.innerHTML = args.text;
			dropLink.setAttribute('data-index', args.index);
			el.setAttribute('sel-data-value', args.value);
			select.selectedIndex = args.index;
			select.childNodes[args.index].selected = '1';
		},
		
		/**
		* @function focusBlur
		* Focus and blur event attached to <select>, but made to match corresponding custom.
		*
		* @param {Object} evt - event being passed on "focus" or "blur".
		*/
		focusBlur: function (evt) {
			var e = evt || window.event,
				sel = ML.El.clicked(e),
				div =  sel.nextSibling;
			
			if (evt.type == 'focus') {
				ML.addClass(div, "focus");
			} else { 
				if (ML.hasClass(div, 'active')) ML.removeClass(div, 'active');
				ML.removeClass(div, "focus");
			}
			
			this.attachOldEvt(sel, evt.type);
			
			if (typeof e.preventDefault !== 'undefined') {
				e.preventDefault();    
			}
			return false;
		}
	}
	
	ML.SEL.setup();
}());