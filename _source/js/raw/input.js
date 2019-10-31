(function () {
  /**
   * Input polyfill.
   * @private
   */
  var InputControl = {
    /**
     * Stores all the inputs that the polyfill gets applied to.
     * @type {Array}
     */
    inputs: [],

    /**
     * The timer object for moving the cursor.
     * @type {Object}
     */
    cursorTimer: null,

    /**
     * Returns `true` or `false` if the placeholder attribute is supported.
     * @return {Boolean}
     */
    isSupported: function() {
      return ('placeholder' in ML.El.create('input')) ? true : false;
    },

    /**
     * Initialization of the polyfill.
     */
    init: function() {
      if (!this.isSupported()) {
        var inputs = ML.El._$('input');

        for (var i = 0, len = inputs.length; i < len; i++) {
          if (inputs[i].type === 'text' && !ML.El.hasClass(inputs[i], 'js-input-polyfill')) {
            ML.El.addClass(inputs[i], 'js-input-polyfill');

            if (ML.El.getAttr(inputs[i], 'placeholder') !== null) {
              inputs[i].setAttribute('value', ML.El.getAttr(inputs[i], 'placeholder'));
              ML.El.addClass(inputs[i], 'js-input-placeholder');
            }

            this.inputs.push(inputs[i]);
          }
        }

        this.bindEvents();
      }      
    },

    /**
     * Events bound to the input.
     */
    bindEvents: function() {
      var self = this;

      ML.loop(this.inputs, function(input) {
        ML.El.evt(input, 'focus', self.inputFocus);
        ML.El.evt(input, 'blur', self.inputBlur);
        ML.El.evt(input, 'click', self.inputClick);

        if (ML.El.getAttr(input, 'placeholder') !== null) {
          ML.El.evt(input, 'keyup', self.inputKeyup);
        }
      });
    },

    /**
     * Focus event handler attached to the input.
     * @param {Event} e The Event Object.
     */
    inputFocus: function(e) {
      var self = this;
      var inp = ML.El.clicked(e);

      ML.El.addClass(inp, 'focus');
      InputControl.moveCursor(inp);
      self.cursorTimer = setTimeout(function() {
        InputControl.moveCursor(inp);
      }, 1);
    },

    /**
     * Blur event handler attached to the input.
     * @param {Event} e The Event Object.
     */
    inputBlur: function(e) {
      ML.El.removeClass(ML.El.clicked(e), 'focus');
      clearTimeout(this.cursorTimer);
    },

    /**
     * Click event handler attached to the input.
     * @param {Event} e The Event Object.
     */
    inputClick: function(e) {
      if (ML.El.hasClass(ML.El.clicked(e), 'focus')) {
        InputControl.moveCursor(ML.El.clicked(e));
      }
    },

    /**
     * Moves the cursor to the beginning of the text in the input.
     * This replicates the same effect of the "placeholder" attribute in supported browsers.
     * [credit](http://stackoverflow.com/questions/8189384/i-want-to-put-cursor-in-beginning-of-text-box-onfocus)
     * @param {HTMLElement} input The input field.
     */
    moveCursor: function(input) {
      if (!ML.El.hasClass(input, 'js-input-placeholder')) {
        return;
      } else {
        if (typeof input.selectionStart === 'number') {
          input.selectionStart = input.selectionEnd = 0;
        } else if (typeof !ML.isUndef(input.createTextRange)) {
          input.focus();
          var range = input.createTextRange();
          range.collapse(true);
          range.select();
        }
      }
    },

    /**
     * When there is a placeholder attribute, on keyup it clears/unclears the text.
     * Removes the current value in the input field.
     * Replicates the "placeholder" functionality in supported browsers.
     * @param {Event} e The Event Object.
     */
    inputKeyup: function(e) {
      var input = ML.El.clicked(e);
      var old = ML.El.getAttr(input, 'placeholder');
      var neww = input.value.replace(old, '');

      if (ML.El.hasClass(input, 'js-input-placeholder')) {
        input.value = neww;
      }

      ML.El.removeClass(input, 'js-input-placeholder');

      // No characters in input field.
      if (input.value.length < 1) {
        input.value = old;
        ML.El.addClass(input, 'js-input-placeholder');
        InputControl.moveCursor(input);
      }
    }
  };

  /**
   * Input polyfill.
   * The polyfill will add unique classes to an input field when it is focused 
   * `focus`. Also allows the placeholder attribute to work on browsers that 
   * do not support the attribute. Adds `js-input-placeholder` so styling can be done to
   * the placeholder attribute.
   * @namespace
   * 
   * @example <caption>The script is initialized on page load, but if new <code>&lt;input type="text" /&gt;</code>
   * added to the page dynamically. Use the line below:</caption>
   * ML.InputControl();
   */
  ML.InputControl = function() {
    InputControl.init();
  };

  ML.InputControl();
}());
