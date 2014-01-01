/**
* @namespace ML
* Main namespace for all scripts.
*/
var ML = {} || function () {};
window.ML = window.ML || function () {};

/**
* @namespace ML
* Base class for JS functionality.
*/
ML = {
	
	/**
    * @function $
    * Returns an element based on it's id.
	*
	* @param {String} id - the name of the id you would like to retrieve.
    */
	$: function (id) {
		return document.getElementById(id);
	},
	
	/**
    * @function _$
    * Returns an element based on its tag name.
	* If you provide a parent you can limit the amount of elements that get returned.
	*
	* @param {String} tag - name of tag you want to return.
    * @param {HTMLElement} parent (optional) - parent of the tag you want to return.
	*/
	_$: function (tag, parent) {
		var p = parent || document; 
		return p.getElementsByTagName(tag);
	},
	
	/**
    * @function _$C
    * Returns an element based on its class name.
	*
	* @param {String} cn - class name to search for, i.e. '.test'.
	*/
	$C: function (cn) {
		var d = document, elms = [],
			cnSplit = cn.split('.'),
			classN = (cnSplit.length > 1) ? cnSplit[1] : cnSplit[0];
		
		if (d.getElementsByClassName) {	// for browsers that support getElementsByClassName
			return d.getElementsByClassName(classN);	
		} else {
			var tags = this._$('*'),
				regex = new RegExp("(^|\\s)"+classN+"(\\s|$)");
			
			for (var i=0; i<tags.length; i++) {
				if (regex.test(tags[i].className)) {
					elms.push(tags[i]);	
				}
			}
			
			return elms;
		}
	},	
	
	/**
    * @function loop
    * Loops through an array with callback function.
	*
	* @param {HTMLElement} arr - array to be looped through.
    * @param {function} callback - function to be called in the loop.
	*/
	loop: function(arr, callback) {		
		for(i=0;i<arr.length;i++) {
			if (typeof arr[i] == 'object') ML.El.clean(arr[i]);
			callback.call(this,arr[i],i);
		}
	},

	/**
    * @function windowDimen
    * Returns the width and height of the window.
	* Thanks to http://www.howtocreate.co.uk/tutorials/javascript/browserwindow (revised)
    */
	windowDimen: function() {
		var h = 0, w = 0;
		if (typeof(window.innerWidth) == 'number') {
			w = window.innerWidth;
			h = window.innerHeight;
		} else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
			w = document.documentElement.clientWidth;
			h = document.documentElement.clientHeight;
		} else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
			w = document.body.clientWidth;
			h = document.body.clientHeight;
		}
		
		return { w : w, h : h};
	},
	
	/**
    * @function docDimen
    * Returns the width and height of the document.
    */
	docDimen: function () {
		var w = Math.max(
			Math.max(document.body.scrollWidth, document.documentElement.scrollWidth),
			Math.max(document.body.offsetWidth, document.documentElement.offsetWidth),
			Math.max(document.body.clientWidth, document.documentElement.clientWidth)
		);
		
		var h = Math.max(
			Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
			Math.max(document.body.offsetHeight, document.documentElement.offsetHeight),
			Math.max(document.body.clientHeight, document.documentElement.clientHeight)
		);
		
		return {w: w, h: h};
	},
	
	/**
    * @function compStyle
    * If there is no window.getComputedStyle, it overwrites it.
	* Credits: http://snipplr.com/view/13523/getcomputedstyle-for-ie/
    */
	compStyle: function () {
		if (!window.getComputedStyle) {
    		window.getComputedStyle = function(el, pseudo) {
        		this.el = el;
        		this.getPropertyValue = function(prop) {
            		var re = /(\-([a-z]){1})/g;
            		if (prop == 'float') prop = 'styleFloat';
            		if (re.test(prop)) {
                		prop = prop.replace(re, function () {
                    		return arguments[2].toUpperCase();
                		});
            		}
					
            		return el.currentStyle[prop] ? el.currentStyle[prop] : null;
        		}
				
        		return this;
    		}
		}
	},
	
	/**
    * @function ParObj
    * Parses a string into an object.
	*
	* @param {Object} args - arguments passed.
	*** @param {String} elem - string to be parsed.
	*** @param {String} remove - base of string to be removed, i.e. "modal::".
	*** @param {String} sep - string to separate each property, i.e. ":".
	*/
	ParObj: function(args) {
		var obj = {},
			passedData = args.elem,
			stripData = (!args.remove) ? passedData : passedData.substr(passedData.indexOf(args.remove),passedData.length);
		
		var sep = args.sep || ':',
			string = (!args.remove) ? passedData : stripData.replace(args.remove,''),
			arr = string.split(sep);
						
		for (i=0; i<arr.length; i+= 2) {obj[arr[i]] = arr[i + 1];}	
		return obj;
	},
	
	/**
    * @function contains
    * Returns true/false if a string has another string inside it.
	* If there is more than one instance an object is returned.
	*
	* @param {String} haystack - string to look at.
	* @param {String} needle - string to locate in the haystack.
	*/
	contains: function(haystack, needle) {
		var count = 0,
			_split = haystack.split(' ')
		
		if (haystack.indexOf(needle) != -1) {
			for (var i=0; i<_split.length; i++) {
				if(_split[i].match(needle)) {
					count++;	
				}
			}
			
			// If result is greater than or equal to 2, return an object with boolean and the amount of times it appears.
			return (count >= 2) ? {boo:true, count: count} : true;
		} else {
			return false;	
		}
	},
	
	/**
    * @function trim
    * Returns a string with whitepace removed.
	*
	* @param {String} str - string.
    */
	trim: function (str) {
		return str.replace(/(^\s+|\s+$)/g,'');
	},
	
	/**
    * @function removeClass
    * Removes a class name from an element.
	* Thanks to http://blkcreative.com/words/simple-javascript-addclass-removeclass-and-hasclass/
	*
	* @param {HTMLElement} elem - element of class name you want removed.
	* @param {String} classN - class name to be removed.
    */
	removeClass: function(elem, classN) {
		var currClass = this.trim(elem.className),
			regex = new RegExp("(^|\\s)"+classN+"(\\s|$)", "g");
			
		elem.className = this.trim(currClass.replace(regex, " "));
	},
	
	/**
    * @function hasClass
    * Returns true or false if an element has a specifc class name.
	* Thanks to http://blkcreative.com/words/simple-javascript-addclass-removeclass-and-hasclass/
	*
	* @param {HTMLElement} elem - element that may have the class name specified.
	* @param {String} classN - class name to be checked for.
    */
	hasClass: function(elem, classN) {
		var regex = new RegExp("(^|\\s)"+classN+"(\\s|$)");
		return regex.test(elem.className);
	},
	
	/**
    * @function addClass
    * Adds a class name to a given element.
	*
	* @param {HTMLElement} elem - element that you want a class name added to.
	* @param {String} classN - new class name you want added to element.
    */
	addClass: function(elem, classN) {
		var currClass = this.trim(elem.className),
			addedClass = (currClass.length == 0) ? classN : currClass+' '+classN;
		
		if (!this.hasClass(elem, classN)) elem.className = addedClass;	
	},
	
	/**
    * @function toggleClass
    * Toggles the class name of an element.
	*
	* @param {HTMLElement} elem - element who's class you want to be toggled.
	* @param {String} classN - class name to be toggled.
    */
	toggleClass: function(elem, classN) {
		(ML.hasClass(elem, classN)) ? ML.removeClass(elem, classN) : ML.addClass(elem, classN);
	}
	
}

/**
* @class El
* @namespace ML
* Base functionality for elements.
*
* @property {Object} Events - holds all events added using the handler.
*/
ML.El = {
	Events: [],
	
	/**
    * @function evt
    * Adds events to elements.
	* Also adds all the events to an array to keep track of them.
	*
	* @param {HTMLElement} el - element that event should be attched/added to.
    * @param {String} type - type of event to be added to element, minus "on".
	* @param {function} func - callback function to be called on click.
	* @param {Boolean} capture - true/false
	*/
	evt: function (el, type, func, capture) {
		if (el.addEventListener)  // other browsers
			el.addEventListener(type, func, capture);
		else if (el.attachEvent) { // ie 8 and below
			el.attachEvent("on"+type, func);
		} else { // for older browsers
			el[type] = func;
		}
		
		this.Events.push([el, type, func]);
	},
	
	/**
    * @function clean
    * Returns an element with no whitespace.
	* This is useful when retrieving elements for the DOM. Since there is usually whitespace between elements.
	*
	* @param {HTMLElement} node - element.
    */
	clean: function (node) {
		for (var i=0; i<node.childNodes.length; i++) {
			var child = node.childNodes[i];
			if(child.nodeType == 3 && !/\S/.test(child.nodeValue)) {
				node.removeChild(child);
				i--;
			}
			if(child.nodeType == 1) {
				ML.El.clean(child);
			}
		}
		
		return node;
	},
	
	/**
    * @function clicked
    * Returns the element that was clicked om.
	* Good when used on the document.
	*
	* @param {HTMLElement} evt - element clicked on.
	*/
	clicked: function(evt) {
		var element = evt.target || evt.srcElement;
		if (element.nodeType == 3) element = element.parentNode; // http://www.quirksmode.org/js/events_properties.html
		return element;
	},
	
	/**
    * @function position
    * Returns the x and y position of an element.
	* Credits go to Eric Pascarello of CodeRanch for this function
	*
	* @param {HTMLElement} elem - element you want to get the position of.
    */
	position: function(elem){
		var posX = 0;  
		var posY = 0;  
		while (elem!= null) {  
			posX += elem.offsetLeft;  
			posY += elem.offsetTop;  
			elem = elem.offsetParent;  
		}  
		
		return { x : posX, y : posY }; 
	},
	
	/**
    * @function dimens
    * Returns the width, height, x and y position of an element.
	*
	* @param {HTMLElement} elem - element you want to get the dimensions for.
    */
	dimens: function(elem) {
		return {
			width: elem.style.width || elem.offsetWidth,
			height: elem.style.height || elem.offsetHeight,
			x: this.position(elem).x,
			y: this.position(elem).y	
		}
	},

	/**
    * @function center
    * Returns the x and y of an element to make it centered to the window.
	*
	* @param {HTMLElement} elem - element you want to get the center position of.
    */
	center: function (elem) {
		var win = ML.windowDimen(elem),
			mvX = (win.w - elem.offsetWidth) / 2 + "px",
			mvY = (win.h - elem.offsetHeight) / 2 + "px";
		
		while(elem!= null) {
			elem.style.top = mvY;
			elem.style.left = mvX;
			elem = elem.offsetChild;
		}
		
		return { x : mvY, y : mvX };
	},
	
	/**
    * @function create
    * Returns an element to be created in the DOM and adds attributes. 
	* NOTE: It is best to put it in a variable.
	* Usage: var test = ML.El.create(element, 'attribute': 'attributeValue'});
	*
	* @param {String} tag - tag you want to created, i.e "div", "span", etc...
	* @param {Object} args - arguments passed.
	*** @param {Object} attrs - attributes you want on the tag, i.e. class="test", src="img.jpg", etc...
    */
	create: function(element, arg) {
		var elem = document.createElement(element);
			
		if (arg) {
			var attrs = arg;
			
			for (var attr in attrs) {
				// IE does not support support setting class name with set attribute
				([attr]=='class') ? elem.className = attrs[attr] : elem.setAttribute([attr], attrs[attr]);
			}
		}
		
		return elem;
	},
	
	/**
    * @function getStyl
    * Returns a style for a specific element.
	* Credits: http://www.quirksmode.org/dom/getstyles.html
	*
	* @param {HTMLElement} element - element you want to get the style for.
	* @param {String} styleProp - style property you want the value of.
    */
	getStyl: function(element, styleProp) {	
		var y;
		
		if (element.currentStyle == undefined) {
			ML.compStyle();
			y = window.getComputedStyle(element, "").getPropertyValue(styleProp);
		} else {
			y = element.currentStyle[styleProp];			
		}
		
		return y;
	},
	
	/**
    * @function styl
    * Adds styles to an element. 
	* Usage: ML.El.styl(element, 'display': 'none', 'overflow': 'hidden'});
	*
	* @param {HTMLElement} element - element you want styled.
	* @param {Object} args - arguments passed.
	*** @param {Object} arg.props - styles you want applied to the element.
    */
	styl: function(element, arg) {
		var props = arg;
		
		for (var prop in props) {
			element.style[prop] = props[prop];	
		}
	}, 
	
	/**
    * @function getAttr
    * Returns an attribute for a specific element
	*
	* @param {HTMLElement} element - element to get an attribute for.
	* @param {String} attr - attribute you want returned.
    */
	getAttr: function(element, attr) {
		var att;
		
		if (attr=='class') {
			att = element.className;	
		} else if (attr=='style') {
			att = element.style;
		} else {
			att = element.getAttribute(attr);	
		}
		
		return att;
	},
	
	/**
    * @function data
    * Returns a data attribute for an element.
	*
	* @param {HTMLElement} element - element to get an attribute for.
	* @param {String} attr - attribute you want returned, sans the "data-".
    */
	data: function(element, attr) {
		return element.getAttribute('data-'+attr);
	},
	
	/**
    * @function animate
    * Animates an element.
	*
	* @param {HTMLElement} el - element you want to animate.
	* @param {Object} props - css properties you want to animate.
	* @param {Function} func (optional) - function to be called after completion of animation.
    */
	animate: function (el, props, func) {
		var timer, currProps = {},
			stopAnim = false, inc = 0, counter = 0;
		
		/**
		* @function getCurrs
		* Gets the current css values of the properties beng animated.
		*/
		function getCurrs() {
			currProps = {};
						
			for (var prop in props) {
				var currProp = parseFloat(ML.El.getStyl(el, prop).replace('px', ''));
				currProps[prop] = currProp;
				
				if (prop == 'opacity') {					
					currProps.filter = 'alpha(opacity='+prop*100+')';	
				}
			}
		}
			
		/**
		* @function move
		* Animates the element with the new css values provided.
		*/
		function move () {
			getCurrs();
			counter++;
			
			for (var prop in props) {
				inc = 0;
				(props[prop] < currProps[prop]) ? inc-- : inc++;
				
				if (prop == 'opacity') {
					props[prop] = props[prop]*100;
					el.style.opacity = (currProps[prop]+inc/100);
				} else {
					el.style[prop] = (currProps[prop]+inc) + 'px';
				}
				
				if (props[prop] === currProps[prop]+inc) stopAnim = true;
			}
			
			timer = setTimeout(move, 10);		
			if (stopAnim) {
				clearTimeout(timer);
				if (func) func();
				inc = 0;
				counter = 0;
			}
		}
		
		move();
	}
	
}

/**
* @class Ajax
* @namespace ML
*
* @property {String} loaderPath - location of where the ajax loader is.
*/
ML.Ajax = {
	loaderPath: 'images/ajax-loader.gif',
	
	/**
    * @function init
    * Making the ajax request/call.
	*
	* @param {String} elem - id of the element you want the ajax response to appear.
	* @param {String} setURL - url of the ajax request. 
    */
	init: function(elem, setURL) {
		var self = this,
			xmlhttp;
					
		if(window.location.host =='') {
			alert('Cross origin requests are not supported. Please run on a server or Ajax will not function properly.');
			return false;
		} else {
			if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
				xmlhttp = new XMLHttpRequest();
			} else {// code for IE6, IE5
				xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
			}
			
			xmlhttp.onreadystatechange = function(e) {
				if (xmlhttp.readyState <= 3) {
					self.ajaxLoader(elem,'show');
				}
				
				if (xmlhttp.readyState == 4 && (xmlhttp.status==200)) {
					self.ajaxLoader(elem,'show');
					
					_$(elem).innerHTML = xmlhttp.responseText;
				}
			}
			
			xmlhttp.open("GET",setURL,true);
			xmlhttp.send();
		}
	},
	
	/**
    * @function loader
    * Loader for ajax call.
	*
	* @param {String} container - id of the element you want the ajax response to appear.
	* @param {String} visibility - shows or hides the loader, will only show if value is "show". 
    */
	loader: function(container, visibility) {
		var center = _$(container).offsetHeight/2-15,
			loader = '<div class="loader"><img src="'+this.ajaxLoaderPath+'" style="margin-top:'+center+'px" /></div>';
			
		if(visibility == 'show') {
			_$(container).innerHTML = loader;
		} 
	}
	
}

// Allows indexOf to work cross browser
if(!Array.prototype.indexOf){Array.prototype.indexOf=function(e){"use strict";if(this==null){throw new TypeError}var t=Object(this);var n=t.length>>>0;if(n===0){return-1}var r=0;if(arguments.length>1){r=Number(arguments[1]);if(r!=r){r=0}else if(r!=0&&r!=Infinity&&r!=-Infinity){r=(r>0||-1)*Math.floor(Math.abs(r))}}if(r>=n){return-1}var i=r>=0?r:Math.max(n-Math.abs(r),0);for(;i<n;i++){if(i in t&&t[i]===e){return i}}return-1}}