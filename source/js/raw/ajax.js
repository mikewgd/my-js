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
 * @param {String} params.url Request URL.
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