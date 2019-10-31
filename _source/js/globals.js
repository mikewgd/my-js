/* jshint browser: true, latedef: false */

'use strict';

// Polyfill: Array.indexOf
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(e) {
    if (this === null) {
      throw new TypeError();
    }
    var t = Object(this);
    var n = t.length >>> 0;
    if (n === 0) {
      return -1;
    }
    var r = 0;
    if (arguments.length > 1) {
      r = Number(arguments[1]);
      if (r !== r) {
        r = 0;
      } else if (r !== 0 && r !== Infinity && r !== -Infinity) {
        r = (r > 0 || -1) * Math.floor(Math.abs(r));
      }
    }
    if (r >= n) {
      return -1;
    }
    var i = r >= 0 ? r : Math.max(n - Math.abs(r), 0);
    for (; i < n; i++) {
      if (i in t && t[i] === e) {
        return i;
      }
    }
    return -1;
  };
}

// Polyfill: window.getComputedStyle
if (!window.getComputedStyle) {
  window.getComputedStyle = function(el) {
    this.el = el;
    this.getPropertyValue = function(prop) {
      var re = /(\-([a-z]){1})/g;
      if (prop === 'float') {
        prop = 'styleFloat';
      }

      if (re.test(prop)) {
        prop = prop.replace(re, function() {
          return arguments[2].toUpperCase();
        });
      }

      return el.currentStyle[prop] ? el.currentStyle[prop] : null;
    };

    return this;
  };
}

// Polyfill: Event.preventDefault()
if (!Event.prototype.preventDefault) {
  Event.prototype.preventDefault = function() {
    this.returnValue = false;
  };
}

var ML = {} || function() {};
window.ML = window.ML || function() {};

/**
 * The main namespace.
 * @namespace
 */
ML = {
  /**
   * Returns query paramaters.
   * @param {String|Object} arg Query parameter.
   * @return {String}
   *
   * @example
   * var str = 'animal=cat&fruit=apple'; // 'animal=cat&fruit=apple' is returned.
   * var obj = {animal: 'cat', fruit: 'apple'}; // 'animal=cat&fruit=apple' is returned.
   */
  urlParams: function(arg) {
    var result = [];

    if (typeof (arg) === 'string') {
      return arg;
    } else {
      for (var prop in arg) {
        if (arg.hasOwnProperty(prop)) {
          result.push(encodeURIComponent(prop) + '=' + encodeURIComponent(arg[prop]));
        }
      }

      return result.join('&');
    }
  },

  /**
   * Pass in a string and it will be returned as a boolean.
   * If the string is not `true` or `false`, the string passed will be returned.
   * @param {String} str The string to convert into a boolean.
   * @return {Boolean}
   */
  bool: function(str) {
    if ((typeof str).toLowerCase() === 'string') {
      if (str === 'true') {
        return true;
      } else if (str === 'false') {
        return false;
      } else {
        return str;
      }
    } else {
      return str;
    }
  },

  /**
   * Returns `true` or `false` if a value is undefined.
   * @param {*} val Test value.
   * @param {Boolean} [empty=false] Checks if the value is empty, i.e. "". 
   * If a value is empty and parameter is not set, `false` is returned.
   * @return {Boolean}
   */
  isUndef: function(val, empty) {
    var undef = (val === null || val === false || val === undefined);

    if (empty) {
      undef = undef || val === '';
    }

    return undef;
  },

  /**
   * Returns `true` or `false` if value is a boolean.
   * @param {*} val Test value.
   * @return {Boolean}
   */
  isBool: function(val) {
    return ((typeof ML.bool(val)).toLowerCase() === 'boolean');
  },

  /**
   * Returns `true` or `false` if value is a number.
   * @param {*} val Test value.
   * @return {Boolean}
   */
  isNum: function(val) {
    return !isNaN(val);
  },

  /**
   * Returns `true` or `false` if value is a string.
   * @param {*} val Test value.
   * @return {Boolean}
   */
  isString: function(val) {
    return (typeof val).toLowerCase() === 'string';  
  },

  /**
   * Merge defaults with user options.
   * @param {Object} defaults Default settings.
   * @param {Object} options User options.
   * @return {Object} Merged values of defaults and options.
   */
  extend: function(defaults, options) {
    var extended = {};
    var prop;

    if ((typeof defaults).toLowerCase() !== 'object' || (typeof options).toLowerCase() !== 'object') {
      throw new Error('Parameters must be objects.');
    }
    
    for (prop in defaults) {
      if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
        extended[prop] = defaults[prop];
      }
    }

    for (prop in options) {
      if (Object.prototype.hasOwnProperty.call(options, prop)) {
        extended[prop] = options[prop];
      }
    }

    return extended;
  },

  /**
   * Loop through an array with callback.
   * 
   * @param {Arrays} arr The array.
   * @param {Function} cb Callback function.
   * @param {*} cb.element The value of the array.
   * @param {Number} cb.index The index of the array.
   * 
   * @example
   * var arr = ['apple', 'orange', 'blueberry', 'strawberry'];
   * ML.loop(arr, function(element, index) {
   *   console.log(element); // Will console out: apple, orange, etc...
   *   console.log(index); // Will console out the array item's index: 0, 1, etc...
   * })
   */
  loop: function(arr, cb) {
    for (var i = 0, len = arr.length; i < len; i++) {
      if (typeof arr[i] === 'object') {
        ML.El.clean(arr[i]);
      }

      cb.call(this, arr[i], i);
    }
  },

  /**
   * Returns the width and height of the window. [credit](http://www.howtocreate.co.uk/tutorials/javascript/browserwindow)
   * @return {Object}
   */
  windowDimen: function() {
    var h = 0;
    var w = 0;

    if (typeof(window.innerWidth) === 'number') {
      w = window.innerWidth;
      h = window.innerHeight;
    } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
      w = document.documentElement.clientWidth;
      h = document.documentElement.clientHeight;
    } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
      w = document.body.clientWidth;
      h = document.body.clientHeight;
    }

    return {
      w: w,
      h: h
    };
  },

  /**
   * Parses a string into an object.
   * @param {String} str String to be parse.
   * @param {String} base Base of the string to be removed.
   * @param {String} sep Used to separate each property.
   * @return {Object}
   */
  parObj: function(str, base, sep) {
    var obj = {};
    var stripData = (!base) ? str : str.substr(str.indexOf(base), str.length);
    sep = sep || ':';
    var string = (!base) ? str : stripData.replace(base, '');
    var arr = string.split(sep);

    for (var i = 0, len = arr.length; i < len; i += 2) {
      obj[arr[i]] = arr[i + 1];
    }

    // empty
    if (arr[0] === '') {
      obj = {};
    }
    
    return obj;
  },

  /**
   * Returns a string with whitespace removed.
   * @param {String} str String to remove whitespace.
   * @return {String}
   */
  trim: function(str) {
    return str.replace(/(^\s+|\s+$)/g, '');
  }
};

/**
* Element based functions.
* @namespace
*/
ML.El = {
  /**
   * Stored Element Events.
   * @type {Arrays}
   */
  Events: [],

  /**
   * Returns parent element specified.
   * Returns false if element is not found.
   * @param {HTMLElement} el The child element to search for ancestor elements.
   * @param {String} tag Name of tag to search for.
   * @param {String} classN Class name of the tag to search for.
   * @return {HTMLElement|Boolean}
   */
  findParent: function (el, tag, classN) {
    while (el.parentNode) {
      el = el.parentNode;
      if (el.tagName === tag && ML.El.hasClass(el, classN)) {
        return el;
      }
    }

    return false;
  },
  
  /**
   * Returns `true` or `false` if an event is bound to an element.
   * @param {HTMLElement} node The HTML element to track.
   * @param {String} type The type of event, i.e. `click`, `focus` etc...
   * @param {String} funcName The name of the function bound to the element.
   * @return {Boolean}
   */
  isBound: function(node, type, funcName) {
    var result = false;
    var boundEvt = null;

    if (!ML.isString(type) || !ML.isString(funcName)) {
      throw new Error('The type of event i.e. "click" must be a string and the name' +
        ' of the function must be a string.');
    }

    for (var i = 0, len = this.Events.length; i < len; i++) {
      boundEvt = this.Events[i];

      if (node === boundEvt[0] && type === boundEvt[1] && funcName === boundEvt[2].name) {
        boundEvt[3] = i;
        result = boundEvt;
        break;
      }
    }

    return result;
  },

  /**
   * Returns `true` or `false` if an element collides with another one.
   * @param {HTMLElement|Object} arg1 Element to detect collision or object with coordinates.
   * @param {HTMLElement|Object} arg2 Second element to detect collision or object with coordinates.
   * @return {Boolean}
   *
   * @example
   * var elem1 = ML.El.$('test-elem-1');
   * var elem2 = {width: 100, height: 300, x: 0, y: 200}; // You can also pass in an 
   * var collides = ML.El.collides(elem1, elem2);         // object of coordinates.
   *                                                      // i.e. width, height, x and y.
   * if (collides) {
   *   console.log('Elements are colliding.');
   * } else {
   *   console.log('No collision detected.')
   * }
   */
  collides: function(arg1, arg2) {
    var dimens1 = arg1;
    var dimens2 = arg2;

    if (!ML.isUndef(arg1) && !ML.isUndef(arg2)) {
      if (arg1.nodeType === 1) {
        dimens1 = ML.El.dimens(arg1);
      }

      if (arg2.nodeType === 1) {
        dimens2 = ML.El.dimens(arg2);
      }

      return !(
        ((dimens1.y + dimens1.height) < (dimens2.y)) ||
        (dimens1.y > (dimens2.y + dimens2.height)) ||
        ((dimens1.x + dimens1.width) < dimens2.x) ||
        (dimens1.x > (dimens2.x + dimens2.width))
      );
    }
  },

  /**
   * Event listener bound to elements.
   * @param {HTMLElement} el The element to bind an event to.
   * @param {String} type The type of event.
   * @param {Function} cb Callback function.
   * @param {Event} cb.e The Event Object.
   * @param {Boolean} [capture]
   */
  evt: function(el, type, cb, capture) {
    if (ML.isUndef(capture, true)) {
      capture = false;
    }

    if (el.addEventListener) {// other browsers
      el.addEventListener(type, cb, capture);
    } else if (el.attachEvent) { // ie 8 and below
      el.attachEvent('on' + type, cb);
    } else { // for older browsers
      el['on' + type] = cb;
    }

    ML.El.Events.push([el, type, cb]);
  },

  /**
   * Remove event listener bound to an element.
   * @param {HTMLElement} el The element to remove the event from.
   * @param {String} type The type of event.
   * @param {Function} cb Callback function.
   * @param {Event} cb.e The Event Object.
   * @param {Boolean} [capture]
   */
  removeEvt: function(el, type, cb) {
    if (el.removeEventListener) {
      el.removeEventListener(type, cb, false);
    } else if (el.detachEvent) {
      el.detachEvent('on' + type, cb);
    } else {
      el['on' + type] = null;
    }
  },

  /**
   * Trigger events bound to elements.
   * @param {HTMLElement} el The element to trigger an event on.
   * @param {String} type The type of event to trigger.
   */
  evtTrigger: function(el, type) {
    var event;

    if (document.createEvent) {
      event = document.createEvent('HTMLEvents');
      event.initEvent(type, true, true);
    } else if (document.createEventObject) { // IE < 9
      event = document.createEventObject();
      event.eventType = type;
    }

    event.type = type;

    if (el.dispatchEvent) {
      el.dispatchEvent(event);
    } else if (el.fireEvent) { // IE < 9
      el.fireEvent('on' + event.eventType, event); // can trigger only real event (e.g. 'click')
    } else if (el[type]) {
      el[type]();
    } else if (el['on' + type]) {
      el['on' + type]();
    }
  },

  /**
   * Returns an element without whitespace.
   * @param {HTMLElement} node The element to remove whitespace from.
   * @return {HTMLElement}
   */
  clean: function(node) {
    var child = null;

    for (var i = 0, len = node.childNodes.length; i < len; i++) {
      child = node.childNodes[i];

      if (child !== undefined) {
        if (child.nodeType === 3 && !/\S/.test(child.nodeValue)) {
          node.removeChild(child);
          i--;
        }
        if (child.nodeType === 1) {
          ML.El.clean(child);
        }
      }
    }

    return node;
  },

  /**
   * Returns element that was clicked on.
   * @param {Event} evt The event object.
   * @return {HTMLElement}
   */
  clicked: function(evt) {
    var element = null;

    if (!evt) {
      evt = window.event;
    }

    element = evt.target || evt.srcElement;

    if (element.nodeType === 3) {
      element = element.parentNode; // http://www.quirksmode.org/js/events_properties.html
    }

    return element;
  },

  /**
   * Returns HTMLElement based on id attriube.
   * @param {String} id The id of the element to return.
   * @return {HTMLElement}
   */
  $: function(id) {
    if (ML.isUndef(document.getElementById(id), true)) {
      throw new Error('Element can\'t be found.');
    } else {
      return document.getElementById(id);
    }
  },

  /**
   * Returns an element based on tag.
   * If you provide a parent you can limit the amount of elements that get returned.
   * @param {String} tag The tag name of the element.
   * @param {HTMLElement} [parent=document] The parent element, default is `document`.
   * @return {HTMLElement}
   */
  _$: function(tag, parent) {
    var result = document.getElementsByTagName(tag);

    if (result.length < 1) {
      throw new Error('The first parameter needs to be a valid tag.');
    }

    if ((typeof parent).toLowerCase() === 'object') {
      result = parent.getElementsByTagName(tag);
    }

    return result;
  },

  /**
   * Returns an element based on class name.
   * @param {String} cn The class name of the element.
   * @param {HTMLElement} [parent=document] The parent element, default is `document`.
   * @return {HTMLElement}
   */
  $C: function(cn, parent) {
    var elms = [];
    var cnSplit = cn.split('.');
    var classN = (cnSplit.length > 1) ? cnSplit[1] : cnSplit[0];

    if (document.getElementsByClassName) { // for browsers that support getElementsByClassName
      if ((typeof parent).toLowerCase() === 'object') {
        elms = parent.getElementsByClassName(classN);
      } else {
        elms = document.getElementsByClassName(classN);
      }
    } else {
      var tags = ((typeof parent).toLowerCase() === 'object') ?
        ML.El._$('*', parent) : ML.El._$('*', document);
      var regex = new RegExp('(^|\\s)' + classN + '(\\s|$)');

      for (var i = 0, len = tags.length; i < len; i++) {
        if (regex.test(tags[i].className)) {
          elms.push(tags[i]);
        }
      }      
    }

    return elms;
  },

  /**
   * Removes a class name from an element. [credit](http://blkcreative.com/words/simple-javascript-addclass-removeclass-and-hasclass)
   * @param {HTMLElement} elem The element of the class name to be removed.
   * @param {String} classN Class names to be removed.
   * @param {Boolean} [multiple] If there are multiple class names to be removed.
   */
  removeClass: function(elem, classN, multiple) {
    var currClass = ML.trim(elem.className);
    var regex = new RegExp('(^|\\s)' + classN + '(\\s|$)', 'g');

    elem.className = ML.trim(currClass.replace(regex, ' '));

    if (multiple) {
      var classNames = classN.split(' ');

      for (var i = 0, len = classNames.length; i < len; i++) {
        ML.El.removeClass(elem, classNames[i]);
      }
    }
  },

  /**
   * Returns `true` or `false` if an element has a specific class name.
   * @param {HTMLElement} elem Element to check if it has a specific class name.
   * @param {String} classN The class name to check for.
   * @return {Boolean}
   */
  hasClass: function(elem, classN) {
    var regex = new RegExp('(^|\\s)' + classN + '(\\s|$)');
    return regex.test(elem.className);
  },

  /**
   * Adds a class name to the element passed.
   * @param {HTMLElement} elem The element to add a class name to.
   * @param {String} classN The class name to add.
   */
  addClass: function(elem, classN) {
    var currClass = ML.trim(elem.className);
    var addedClass = (currClass.length === 0) ? classN : currClass + ' ' + classN;

    if (!ML.El.hasClass(elem, classN)) {
      elem.className = addedClass;
    }
  },

  /**
   * Toggles the class name of an element.
   * @param {HTMLElement} elem The element to toggle class name.
   * @param {String} classN The class name to toggle.
   * @param {Boolean} [cond] Boolean value to determine whether class name should be added or removed.
   */
  toggleClass: function(elem, classN, cond) {
    var _cond = ML.bool(cond);
    var someCond = ML.isBool(_cond) ? _cond : ML.El.hasClass(elem, classN);

    if (someCond) {
      ML.El.removeClass(elem, classN);
    } else {
      ML.El.addClass(elem, classN);
    }
  },

  /**
   * Returns the x and y position of an element.
   * @param {HTMLElement} elem The element's x and y position.
   * @return {Object}
   */
  position: function(elem) {
    var posX = 0;
    var posY = 0;

    while (elem !== null) {
      posX += elem.offsetLeft;
      posY += elem.offsetTop;
      elem = elem.offsetParent;
    }

    return {
      x: posX,
      y: posY
    };
  },

  /**
   * Returns the width, height, x and y position of an element.
   * @param {HTMLElement} elem The element's dimensions.
   * @return {Object}
   */
  dimens: function(elem) {
    return {
      width: elem.offsetWidth,
      height: elem.offsetHeight,
      x: ML.El.position(elem).x,
      y: ML.El.position(elem).y
    };
  },

  /**
   * Returns an element to be created in the DOM with attributes passed.
   * @param {HTMLElement} element The tag to create, i.e. `div`.
   * @param {Object} [attrs] Attributes to add to tag.
   * @return {HTMLElement}
   * 
   * @example
   * // NOTE: When setting class name make sure to put in quotes, see example:
   * var div = ML.El.create('div', {'id': 'test-elem', 'class': 'cool-div'});
   */
  create: function(element, attrs) {
    var elem = document.createElement(element);

    if (attrs && (typeof attrs).toLowerCase() === 'object') {
      for (var attr in attrs) {
        // IE does not support support setting class name with set attribute.
        if ([attr] === 'class') {
          elem.className = attrs[attr];
        } else {
          elem.setAttribute([attr], attrs[attr]);
        }
      }
    }

    return elem;
  },

  /**
   * Returns a style for a specific element.
   * @param {HTMLElement} element The element to get styles for.
   * @param {String} styleProp Style property to get the value of.
   * @return {Object}
   */
  getStyle: function(element, styleProp) {
    var y;

    if (element.currentStyle === undefined) {
      y = window.getComputedStyle(element, '').getPropertyValue(styleProp);
    } else {
      // TODO: Added for IE < 9 kebab case to camelCase.
      y = element.currentStyle[styleProp.replace(/-([a-z])/g, function (m, w) {
        return w.toUpperCase();
      })];
    }

    return y;
  },

  /**
   * Styles an element.
   * @param {HTMLElement} element The element to set styles to.
   * @param {Object} props Style properties and values.
   */
  setStyles: function(element, props) {
    for (var prop in props) {
      element.style[prop] = props[prop];
    }
  },

  /**
   * Returns attribute value for passed attribute.
   * @param {HTMLElement} element The element to get the attribute value for.
   * @param {String} attr The attribute to get a value from.
   * @return {String|Number}
   */
  getAttr: function(element, attr) {
    var att;

    if (attr === 'class') {
      att = element.className;
    } else if (attr === 'style') {
      att = element.style;
    } else {
      att = element.getAttribute(attr);
    }

    return att;  
  },

  /**
   * Returns a data attribute.
   * @param {HTMLElement} element The element to get the data attribute value for.
   * @param {String} attr The data attribute, excluding `data-`.
   * @return {String|Number}
   */
  data: function(element, attr) {
    return ML.El.getAttr(element, 'data-' + attr);
  }
};
