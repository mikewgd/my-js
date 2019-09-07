/* jshint browser: true, latedef: false */

'use strict';

var ML = {} || function() {};
window.ML = window.ML || function() {};

// Polyfill: Custom Event < IE 11
// https://gomakethings.com/custom-events-with-vanilla-javascript/
(function () {
  if (typeof window.CustomEvent === 'function') {
    return false;
  }

  function CustomEvent (event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
   }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
})();

/**
 * Main namespace.
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
   * Returns the width and height of the window.
   * @return {Object}
   */
  windowDimen: function() {
    return {
      w: window.innerWidth,
      h: window.innerHeight
    };
  },

  /**
   * Returns nodes as an array.
   * @param {Nodes} nodeList Nodes from a list of nodes.
   * @returns {Array}
   */
  nodeArr: function(nodeList) {
    return Array.prototype.slice.call(nodeList);
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
   * @param {Boolean} [capture=false]
   */
  evt: function(el, type, cb, capture) {
    if (ML.isUndef(capture, true)) {
      capture = false;
    }

    el.addEventListener(type, cb, capture);
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
    el.removeEventListener(type, cb, false);
  },

  /**
   * 
   * @param {String} name The name of the custom event.
   * @param {Object} data Data to send with the custom event.
   * @param {HTMLElement} [el=document] Element to attach the custom event to.
   */
  customEventTrigger: function(name, data, el) {
    var eventName = new CustomEvent(name, {detail: data});
    var element = ML.isUndef(el) ? document : el;
    element.dispatchEvent(eventName);
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
   * Returns element that was clicked.
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
   * Returns a DOM element.
   * @param {String} selector The DOM selector.
   * @returns {HTMLElement}
   */
  $q: function(selector) {
    if (ML.isUndef(document.querySelector(selector), true)) {
      throw new Error('Element can\'t be found.');
    }

    return document.querySelector(selector);
  },

  /**
   * Returns an array of DOM ellements.
   * @param {String} selectors Selectors to find in the DOM.
   * @returns {Array}
   */
  $qAll: function(selectors) {
    if (ML.isUndef(document.querySelectorAll(selectors), true)) {
      throw new Error('Element(s) can\'t be found.');
    }

    return ML.nodeArr(document.querySelectorAll(selectors));
  },

  /**
   * Applies a CSS transition to an element.
   * @param {HTMLElement} el Element to apply style to.
   * @param {String} values The css transition values to apply.
   */
  cssTransition: function(el, values) {
    el.style.webkitTransition = values;
    el.style.transition = values;
  },

  /**
   * Applies CSS transform to an element.
   * @param {HTMLElement} el Element to apply style to.
   * @param {String} values The CSS transform values to apply.
   */
  cssTransform: function(el, values) {
    el.style.webkitTransform = values;
    el.style.transform = values;
  },

  /**
   * Removes a class name from an element.
   * @param {HTMLElement} elem The element of the class name to be removed.
   * @param {String} classN Class name(s) to be removed.
   * @param {Boolean} [multiple=false] If there are multiple class names to be removed.
   */
  removeClass: function(elem, classN, multiple) {
    var currClass = elem.classList;

    if (multiple) {
      var classnames = classN.split(' ');

      for (var i = 0, len = classnames.length; i < len; i++) {
        currClass.remove(classnames[i]);
      }
    } else {
      currClass.remove(classN);
    }
  },

  /**
   * Returns `true` or `false` if an element has a specific class name.
   * @param {HTMLElement} elem Element to check if it has a specific class name.
   * @param {String} classN The class name to check for.
   * @return {Boolean}
   */
  hasClass: function(elem, classN) {
    if (ML.isUndef(elem.classList)) {
      return;
    }

    return elem.classList.contains(classN);
  },

  /**
   * Adds a class name to the element passed.
   * @param {HTMLElement} elem The element to add a class name to.
   * @param {String} classN The class name to add.
   */
  addClass: function(elem, classN) {
    elem.classList.add(classN);
  },

  /**
   * Toggles the class name of an element.
   * @param {HTMLElement} elem The element to toggle class name.
   * @param {String} classN The class name to toggle.
   * @param {Boolean} [cond] Boolean value to determine whether class name should be added or removed.
   */
  toggleClass: function(elem, classN, cond) {
    elem.classList.toggle(classN, cond);
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
    return window.getComputedStyle(element, '').getPropertyValue(styleProp);
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
 * @param {Object} params Configuration settings.
 * @param {String} [params.method=GET] The type of request.
 * @param {String} params.url The URL to make a request to.
 * @param {Object} [params.headers={'Content-type': 'application/x-www-form-urlencoded'}] Adds headers to your request: `request.setRequestHeader(key, value)`
 * @param {String} [params.responseType=text] Format of the response. [info](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType)
 * @param {Boolean} [params.cors=false] Cross domain request. 
 * @param {Object|String} [params.data=null] Data to send with the request.
 * @param {String} params.jsonpCallback The name of the function for JSONP callback.
 * @param {Function} params.success If the request is successful. XHR is returned.
 * @param {Function} params.error If the request errors out. XHR is returned.
 * @constructor
 */
ML.Ajax = function(params) {
  /**
   * Ajax defaults.
   * @type {Object}
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
   * @return {Object|String}
   */
  this.xhr = xhr;
  
  init();
};
