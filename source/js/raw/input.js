/* jshint browser: true, latedef: false */
/* global ML */

'use strict';

/**
 * Input placeholder attribute polyfill. By default all inputs on the page will be passed
 * into this class.
 * @constructor
 * @param {HTMLElement} input The input element.
 * @example
 * var input = new ML.InputControl(ML.$('input'));
 */
ML.InputControl = function(input) {
  var placeholder = ML.El.getAttr(input, 'placeholder');
  var cursorTimer = null;

  /**
   * Events bound to the input.
   * @private
   */
  function bindEvents() {
    ML.El.evt(input, 'focus', function (e){
      var inp = ML.El.clicked(e);
      ML.addClass(inp, 'input-focus');
      moveCursor(inp);
      cursorTimer = setTimeout(function() {moveCursor(inp);}, 1);
    });

    ML.El.evt(input, 'blur', function (e){
      ML.removeClass(ML.El.clicked(e), 'input-focus');
      clearTimeout(cursorTimer);
    });

    ML.El.evt(input, 'click', function (e) {
      if (ML.hasClass(ML.El.clicked(e), 'input-focus')) {
        moveCursor(ML.El.clicked(e));
      }
    });

    if (placeholder !== null) {
      ML.El.evt(input, 'keyup', function (e) {
        clearUnclear(ML.El.clicked(e));
      });
    }
  }

  /**
   * Moves the cursor to the beginning of the text in the input.
   * This replicates the same effect of the "placeholder" attribute in supported browsers.
   * Credits: http://stackoverflow.com/questions/8189384/i-want-to-put-cursor-in-beginning-of-text-box-onfocus
   * @param {HTMLElement} input The input field.
   * @private
   */
  function moveCursor(input) {
    if (!ML.hasClass(input, 'input-placeholder')) {
      return;
    } else {
      if (typeof input.selectionStart === 'number') {
        input.selectionStart = input.selectionEnd = 0;
      } else if (typeof input.createTextRange !== 'undefined') {
        input.focus();
        var range = input.createTextRange();
        range.collapse(true);
        range.select();
      }
    }
  }

  /**
   * Removes the current value in the input field.
   * Replicates the "placeholder" functionality in supported browsers.
   * @param {HTMLElement} input The input field.
   * @private
   */
  function clearUnclear(input) {
    var old = ML.El.getAttr(input, 'placeholder');
    var neww = input.value.replace(old, '');

    if (ML.hasClass(input, 'input-placeholder')) {
      input.value = neww;
    }

    ML.removeClass(input, 'input-placeholder');

    // No characters in input field
    if (input.value.length < 1) {
      input.value = old;
      ML.addClass(input, 'input-placeholder');
      moveCursor(input);
    }
  }

  if (placeholder !== null) {
    input.setAttribute('value', placeholder);
    ML.addClass(input, 'input-placeholder');
    bindEvents();
  }
};

(function () {
  /**
   * Returns true/false if placeholder attribute is supported.
   * @return {boolean}
   */
  var placeholderSupport = function () {
    var createInput = ML.El.create('input');
    return ('placeholder' in createInput) ? true : false;
  };

  if (!placeholderSupport()) {
    var inputs = ML._$('input');

    for (var i = 0, len = inputs.length; i < len; i++) {
      if (inputs[i].type === 'text') {
        new ML.InputControl(inputs[i]);
      }
    }
  }
}());
