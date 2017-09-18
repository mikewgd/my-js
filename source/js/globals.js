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

var ML = {} || function() {};
window.ML = window.ML || function() {};

/**
 * The main namespace.
 * @namespace
 */
ML = {
  /**
   * Returns query paramaters.
   * @param {string|object} arg Query parameter.
   * @return {string}
   *
   * @example
   * var str = 'animal=cat&fruit=apple'; // 'animal=cat&fruit=apple' is returned.
   * var obj = {animal: 'cat', fruit: 'apple'}; // 'animal=cat&fruit=apple' is returned.
   */
  urlParams: function(arg) {
    var returned = [];

    if (typeof (arg) === 'string') {
      return arg;
    } else {
      for (var prop in arg) {
        if (arg.hasOwnProperty(prop)) {
          returned.push(encodeURIComponent(prop) + '=' + encodeURIComponent(arg[prop]));
        }
      }

      return returned.join('&');
    }
  },

  /**
   * Pass in a string and it will be returned as a boolean.
   * If the string is not "true" or "false", the string passed will be returned.
   * @param {string} str The string convert into a boolean.
   * @return {boolean}
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
   * Returns if a value is undefined or not.
   * @param {*} val The value to test if undefined.
   * @param {boolean} [empty=false] Checks if the value is empty, i.e. "". Parameter is
   * optional. If a value is empty and paramter is not set, false is returned.
   * @return {boolean}
   */
  isUndef: function(val, empty) {
    var undef = (val === null || val === false || val === undefined);

    if (empty) {
      undef = undef || val === '';
    }

    return undef;
  },

  /**
   * Returns whether the value is a boolean.
   * @param {*} val The value to test if a boolean.
   * @return {boolean}
   */
  isBool: function(val) {
    return ((typeof ML.bool(val)).toLowerCase() === 'boolean');
  },

  /**
   * Returns whether the value is a number.
   * @param {*} val The value to test if a number.
   * @return {boolean}
   */
  isNum: function(val) {
    return !isNaN(val);
  },

  /**
   * Merge defaults with user options
   * @param {object} defaults Default settings
   * @param {object} options User options
   * @return {object} Merged values of defaults and options
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
   * @param {array} arr The array to loop though.
   * @param {function} cb Function to be called during loop.
   * @param {*} cb.element The value of the array element.
   * @param {number} cb.index The index of the array element.
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
   * @return {object}
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
   * @param {string} str String to be parse.
   * @param {string} base Base of the string to be removed.
   * @param {string} sep Used to separate each property.
   * @return {object}
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
   * @param {string} str String that will have whitespace removed.
   * @return {string}
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
   * Stores events bound to elements.
   * @type {array}
   */
  Events: [],

  /**
   * Returns true/false if an element collides with another one.
   * @param {HTMLElement|object} arg1 Element to detect collision or object with coordinates.
   * @param {HTMLElement|object} arg2 Element to detect collision or object with coordinates.
   * @return {boolean}
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
   * @param {string} type The type of event.
   * @param {function} cb Callback function.
   * @param {Event} cb.e The Event Object.
   * @param {boolean} [capture]
   */
  evt: function(el, type, cb, capture) {
    var resize = {
      delay: 100,
      timeout: null,
      throttled: false
    };

    if (ML.isUndef(capture, true)) {
      capture = false;
    }

    // TODO: Separate out into separate event + function.
    // Make into custom event.
    if (type === 'resize.throttle') {
      ML.El.evt(window, 'resize', function() {
        
        if (!resize.throttled) {
          cb();
          resize.throttled = true;
          resize.timeout = setTimeout(function() {
            resize.throttled = false;
            clearTimeout(resize.timeout);
          }, resize.delay);
        } 
      }, capture);
      return;
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
   * Trigger events bound to elements.
   * @param {HTMLElement} el The element to trigger an event on.
   * @param {string} type The type of event to trigger.
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
   * @param {string} id The id of the element to return.
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
   * Returns an element based on its tag name.
   * If you provide a parent you can limit the amount of elements that get returned.
   * @param {string} tag The tag name of the element.
   * @param {HTMLElement} [parent=document] The parent element, default is document.
   * @return {HTMLElement}
   */
  _$: function(tag, parent) {
    var returned = document.getElementsByTagName(tag);

    if (returned.length < 1) {
      throw new Error('The first parameter needs to be a valid tag.');
    }

    if ((typeof parent).toLowerCase() === 'object') {
      returned = parent.getElementsByTagName(tag);
    }

    return returned;
  },

  /**
   * Returns an element based on class name.
   * @param {string} cn The class name of the element.
   * @param {HTMLElement} [parent=document] The parent element, default is document.
   * @return {HTMLElement}
   */
  $C: function(cn, parent) {
    var d = parent || document;
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
   * @param {string} classN Class names to be removed.
   * @param {boolean} [multiple] If there are multiple class names to be removed.
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
   * Returns true/flase if an element has a specific class name.
   * @param {HTMLElement} elem Element to check if it has a specific class name.
   * @param {string} classN The class name to check for.
   * @return {boolean}
   */
  hasClass: function(elem, classN) {
    var regex = new RegExp('(^|\\s)' + classN + '(\\s|$)');
    return regex.test(elem.className);
  },

  /**
   * Adds a class name to the element passed.
   * @param {HTMLElement} elem The element to add a class name to.
   * @param {string} classN The class name to add to the element passed.
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
   * @param {HTMLElement} elem The element to toggle class name
   * @param {string} classN The class name to toggle.
   */
  toggleClass: function(elem, classN) {
    if (ML.El.hasClass(elem, classN)) {
      ML.El.removeClass(elem, classN);
    } else {
      ML.El.addClass(elem, classN);
    }
  },

  /**
   * Returns the x and y position of an element.
   * @param {HTMLElement} elem The element to get x and y positions for.
   * @return {object}
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
   * @param {HTMLElement} elem The element to get dimensions for.
   * @return {object}
   */
  dimens: function(elem) {
    return {
      width: elem.style.width || elem.offsetWidth,
      height: elem.style.height || elem.offsetHeight,
      x: ML.El.position(elem).x,
      y: ML.El.position(elem).y
    };
  },

  /**
   * Returns an element to be created in the DOM with attributes passed.
   * @param {HTMLElement} element The tag to create, i.e. 'div'
   * @param {object} [attrs] Attributes to add to tag.
   * @return {HTMLElement}
   * 
   * @example
   * var div = ML.El.create('div', {'id': 'test-elem'});
   */
  create: function(element, attrs) {
    var elem = document.createElement(element);

    if (attrs && (typeof attrs).toLowerCase() === 'object') {
      for (var attr in attrs) {
        // IE does not support support setting class name with set attribute
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
   * Returns the computed style. [credit](http://snipplr.com/view/13523/getcomputedstyle-for-ie)
   * @return {string}
   */
  compStyle: function() {
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
  },

  /**
   * Returns a style for a specific element.
   * @param {HTMLElement} element The element to get styles for.
   * @param {string} styleProp Style property to get the value of.
   * @return {object}
   */
  getStyle: function(element, styleProp) {
    var y;

    if (element.currentStyle === undefined) {
      ML.El.compStyle();
      y = window.getComputedStyle(element, '').getPropertyValue(styleProp);
    } else {
      y = element.currentStyle[styleProp];
    }

    return y;
  },

  /**
   * Styles an element.
   * @param {HTMLElement} element
   * @param {object} props
   */
  setStyles: function(element, props) {
    for (var prop in props) {
      element.style[prop] = props[prop];
    }
  },

  /**
   * Returns attribute value for passed attribute.
   * @param {HTMLElement} element The element to get the attribute value for.
   * @param {string} attr The attribute to get a value from.
   * @return {string|number}
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
   * @param {string} attr The data attribute, excluding "data-".
   * @return {string|number}
   */
  data: function(element, attr) {
    return ML.El.getAttr(element, 'data-' + attr);
  }
};

/**
 * Animate elements easily with this constructor. Credit: http://learn.javascript.ru/js-animation, http://learn.javascript.ru/files/tutorial/js/animate.js But modified
 * @constructor
 * @param {HTMLElement} el The element to apply an animation to.
 * @param {object} props The CSS properties to be animated.
 * @param {object} [settings] Configuration settings.
 * @param {number} [settings.duration=400] The duration of the animation, defaults to 400ms.
 * @param {number} [settings.delay=13] The delay of the animation, defaults to 13.
 * @param {string} [settings.easing=linear] Type of animation (bounce, ease, etc..), defaults to linear
 * @param {function} [cb] Callback function.
 * 
 * @example
 * new ML.Animate(ML.$('el'), {width: 100, height: 100}, {delay: 15, duration: 500, easing: 'bounce'}, function() {
 *   alert('animation is complete');
 * });
 */
ML.Animate = function(el, props, settings, cb) {
  /**
   * Animate defaults.
   * @type {object}
   * @private
   */
  var DEFAULTS = {
    duration: 400,
    delay: 13,
    easing: 'linear'
  };

  var Easing = {
    linear: function(progress) {
      return progress;
    },

    elastic: function(progress) {
      return Math.pow(2, 10 * (progress - 1)) * Math.cos(20 * Math.PI * 1.5 / 3 * progress);
    },

    quad: function(progress) {
      return Math.pow(progress, 2);
    },

    quint: function(progress) {
      return Math.pow(progress, 5);
    },

    circ: function(progress) {
      return 1 - Math.sin(Math.acos(progress));
    },

    back: function(progress) {
      return Math.pow(progress, 2) * ((1 + 1.5) * progress - 1.5);
    },

    bounce: function(progress) {
      for (var a = 0, b = 1; 1; a += b, b /= 2) {
        if (progress >= (7 - 4 * a) / 11) {
          return -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2);
        }
      }
    }
  };

  var options = ML.extend(DEFAULTS, (ML.isUndef(settings, true)) ? {} : settings);
  var timer = null;
  var currProps = {};
  var progress = false;
  var time = new Date();

  /**
   * Initialization of animating elements.
   * @private
   */
  function init() {
    if (ML.isUndef(el.tagName)) {
      throw new Error('You can only animate a valid element on the page.');
    } else {
      if (!ML.isNum(options.duration)) {
        options.duration = DEFAULTS.duration;
      }

      if (!ML.isNum(options.delay)) {
        options.delay = DEFAULTS.delay;
      }

      if (ML.isUndef(Easing[options.easing])) {
        options.easing = Easing[DEFAULTS.easing];
      } else {
        options.easing = Easing[options.easing];
      }
    }

    move();
  }

  /**
   * Gets the current CSS values of the properties being animated.
   * @private
   */
  function getCurrs() {
    var currProp = '';
    currProps = {};

    for (var prop in props) {
      currProp = parseFloat(ML.El.getStyle(el, prop).replace('px', ''));
      currProps[prop] = currProp;

      if (prop === 'opacity') {
        currProps.filter = 'alpha(opacity=' + prop * 100 + ')';
      }
    }
  }

  /**
   * Animates the element with the new CSS values provided.
   * @private
   */
  function move() {
    getCurrs();

    timer = setInterval(function() {
      progress = (new Date() - time) / options.duration;

      if (progress > 1) {
        progress = 1;
      }

      for (var prop in props) {
        var value = Math.round(currProps[prop] + (props[prop] - currProps[prop]) * options.easing(progress));
        el.style[prop] = value + 'px';
      }

      if (progress === 1) {
        clearInterval(timer);
        if (typeof cb === 'function') {
          cb();
        }
      }
    }, options.delay);
  }

  init();
};

/**
 * * Vanilla ajax requests
 * * Supports `GET`, `POST`, `PUT`, `DELETE`, `JSONP` methods.
 * * When using `JSONP` request, you need to setup a global callback function and
 * pass in the function name as a string in `jsonpCallback`.
 *
 * @example <caption>GET Request</caption>
 * new ML.Ajax({
 *   responseType: 'json',
 *   url: 'https://reqres.in/api/users/2',
 *   success: function(xhr) {
 *     console.log(xhr.response.data);
 *   },
 *   error: function(xhr) {
 *     console.log('ERROR', xhr);
 *   }
 * });
 *
 * @example <caption>POST Request</caption>
 * new ML.Ajax({
 *   url: 'https://reqres.in/api/users',
 *   method: 'POST',
 *   responseType: 'json',
 *   data: {
 *     name: 'john smith',
 *     age: 22
 *   },
 *   success: function(xhr) {
 *     console.log(xhr.response);
 *   },
 *   error: function(xhr) {
 *     console.log('ERROR', xhr);
 *   }
 * });
 *
 * @example <caption>JSONP Request</caption>
 * var callbackFunction = function(response) {
 *   console.log(response);
 * };
 * 
 * new ML.Ajax({
 *   url: 'https://jsfiddle.net/echo/jsonp',
 *   method: 'JSONP',
 *   data: {
 *     name: 'john smith',
 *     age: 22
 *   },
 *   jsonpCallback: 'callbackFunction'
 * });
 * 
 * @param {object} params Configuration settings.
 * @param {string} [params.method=GET] The type of request.
 * @param {string} params.url The URL to make a request to.
 * @param {object} [params.headers={'Content-type': 'application/x-www-form-urlencoded'}] Adds headers to your request: request.setRequestHeader(key, value)
 * @param {string} [params.responseType=text] Format of the response. [info](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType)
 * @param {boolean} [params.cors=false] Cross domain request. 
 * @param {object|string} [params.data=null] Data to send with the request.
 * @param {string} params.jsonpCallback The name of the function for JSONP callback. Since 
 * JSONP requests do not accept callback functions. Create a global callback function and
 * pass in the function name a string to the callback option.
 * @param {function} params.success If the request is successful. XHR is returned.
 * @param {function} params.error If the request errors out. XHR is returned.
 * @constructor
 */
ML.Ajax = function(params) {
  /**
   * Ajax defaults.
   * @type {object}
   * @private
   */
  var DEFAULTS = {
    method: 'GET',
    url: null,
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    },
    responseType: 'text',
    cors: false, 
    data: null,
    jsonpCallback: '',
    success: function() {},
    error: function() {}
  };

  var xhr = null;
  var options = ML.extend(DEFAULTS, (ML.isUndef(params, true)) ? {} : params);

  /**
   * Initialization of ajax.
   * @private
   */
  function init() {
    if (window.location.host === '') {
      throw new Error('Must be hosted on a server.');
    } else {
      xhr = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
      options.method = options.method.toString().toUpperCase();
      options.cors = ML.bool(options.cors);

      if (!/[^/]+$/.test(options.url)) {
        throw new Error('Not a valid URL.');
      }

      if (!/^GET$|^POST$|^JSONP$|^PUT$|^DELETE$/.test(options.method)) {
        options.method = DEFAULTS.method;
      }

      if (ML.isUndef(options.responseType, true)) {
        options.responseType = DEFAULTS.responseType;
      }

      if (!ML.isBool(options.cors)) {
        options.cors = DEFAULTS.cors;
      }

      if ((typeof options.data) !== 'object') {
        options.data = DEFAULTS.data;
      } else {
        options.data = ML.urlParams(options.data);
      }

      if (options.method === 'JSONP') {
        jsonpRequest();
      } else {
        xhrRequest();
      }
    }
  }

  /**
   * JSONP Request.
   * @private
   */
  function jsonpRequest() {
    var script = ML.El.create('script');
    options.url += (options.url.indexOf('?') + 1 ? '&' : '?') + ML.urlParams(options.data);
    options.url += (options.url.indexOf('?') + 1 ? '&' : '?') + 'callback=' + options.jsonpCallback;
    script.src = options.url;

    document.body.appendChild(script);
  }

  /**
   * XHR Request: GET, POST, PUT, JSONP, DELETE
   * @private
   */
  function xhrRequest() {
    var readyState = function() {
      // Only run if the request is complete
      if (xhr.readyState !== 4) {
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        options.success(xhr);
      } else {
        options.error(xhr);
      }
    };

    ML.El.evt(xhr, 'readystatechange', readyState);

    if (options.cors) {
      if ('withCredentials' in xhr) {
        xhr.withCredentials = true;
      } else if (typeof XDomainRequest !== 'undefined') {
        xhr = new XDomainRequest();
      } else {
        throw new Error('CORS is not supported.');
      } 
    }

    xhr.open(options.method, options.url);
    xhr.responseType = options.responseType;

    for (var header in options.headers) {
      if (options.headers.hasOwnProperty(header)) {
        xhr.setRequestHeader(header, options.headers[header]);
      }
    }

    xhr.send(options.data);
  }

  /**
   * Returns the XHR.
   * @return {object|string}
   */
  this.xhr = xhr;
  
  init();
};