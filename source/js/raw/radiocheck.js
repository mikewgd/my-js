(function () {
  /**
   * Custom radio buttons and checkboxes.
   * @private
   */
  var CustomRadios = {
    /**
     * All radios and checkboxes on the page are stored here.
     * @type {Array}
     */
    inputs: [],

    /**
     * Custom radios and checkboxes are stored here.
     * @type {Array}
     */
    customInputs: [],

    /**
     * Click/Focus/Blur Events attached to INPUT elements.
     * @type {Object}
     */
    attachedEvents: {
      click: [],
      focus: [],
      blur: []
    },

    /**
     * Loops through all inputs on the page and creates a SPAN that
     * will be used as the custom input.
     * Events placed on the input are stored in an object for later use.
     */
    init: function() {
      var inputs = ML.El._$('input');
      var self = this;

      ML.loop(inputs, function(input) {
        if (ML.El.hasClass(input, 'system') || ML.El.hasClass(input, 'styled')) {
          return;
        }

        if (input.type === 'checkbox' || input.type === 'radio') {
          self.inputs.push(input);

          self.createCustom(input);
          self.pushEvents(input);
        }
      });

      this.bindEvents();
    },

    /**
     * Creates the custom input.
     * @param {HTMLELement} input The input element to customize.
     */
    createCustom: function(input) {
      var span = ML.El.create('span', {'class': input.type});

      this.customInputs.push(span);
      ML.El.addClass(input, 'styled');

      ML.El.clean(input.parentNode);

      // adds the custom input after the input
      input.parentNode.insertBefore(span, input.nextSibling);

      if (input.checked) {
        ML.El.addClass(span, 'checked');
      }

      if (input.disabled) {
        ML.El.addClass(span, 'disabled');
      }
    },

    /**
     * Any events attached to the input are pushed into an array to be used later.
     * @param {HTMLElement} input The input to get attached events for.
     */
    pushEvents: function(input) {
      var events = ML.El.Events;
      var elem = null;
      var type = null;
      var func = null;

      for (var i = 0, len = events.length; i < len; i++) {
        elem = events[i][0];
        type = events[i][1];
        func = events[i][2];

        // Only pushes the events if INPUT has any events attached to it.
        if (elem === input) {
          this.attachedEvents[type].push([elem, func]);
        }
      }
    },

    /**
     * Attaches the old events stored in the event object to be applied.
     * @param {HTMLElement} el The element to find event attached to it.
     * @param {String} eventType The type of event to look for.
     * @return {Function}
     */
    attachOldEvt: function(el, eventType) {
      var evt = this.attachedEvents[eventType];
      var inputEvent = null;
      var attachedEl = null;

      for (var i = 0, len = evt.length; i < len; i++) {
        attachedEl = evt[i][0];
        if (attachedEl === el) {
          inputEvent = evt[i][1];
        }
      }

      return inputEvent ? inputEvent.call() : function(){return;};
    },

    /**
     * Events bound to the input and custom inputs SPAN.
     */
    bindEvents: function() {
      var self = this;

      ML.loop(this.inputs, function(input, i) {
        ML.El.evt(input, 'focus', self.inputFocus);

        ML.El.evt(input, 'blur', self.inputBlur);

        ML.El.evt(input, 'click', self.inputClick);

        if (!ML.El.hasClass(self.customInputs[i], 'disabled')) {
          ML.El.evt(self.customInputs[i], 'mouseup', self.customMouseUp);
        }
      });
    },

    /**
     * Mouseup event on custom input. Attaches event on input.
     * @param {Event} e The Event object.
     */
    customMouseUp: function(e) {
      var clicked = ML.El.clicked(e);
      CustomRadios.check.call(clicked);
      CustomRadios.attachOldEvt(clicked, 'click');
    },

    /**
     * Focus event attached to input.
     * @param {Event} e The Event object.
     */
    inputFocus: function(e) {
      var evt = e || window.event;
      var input = ML.El.clicked(evt);
      var span =  input.nextSibling;

      if (evt.type === 'focus') {
        ML.El.addClass(span, 'focus');
      }

      CustomRadios.attachOldEvt(input, evt.type);

      if (typeof e.preventDefault !== 'undefined') {
        e.preventDefault();
      }

      return false;
    },

    /**
     * Blur event handler attached to the input.
     * @param {Event} e The Event Object.
     */
    inputBlur: function(e) {
      var evt = e || window.event;
      var input = ML.El.clicked(evt);
      var span =  input.nextSibling;

      ML.El.removeClass(span, 'focus');
      CustomRadios.attachOldEvt(input, evt.type);

      if (typeof e.preventDefault !== 'undefined') {
        e.preventDefault();
      }

      return false;
    },

    /**
     * Checks/unchecks the custom radio buttons/checkboxes.
     */
    check: function() {
      /* jshint validthis: true */
      var input = this.previousSibling;
      var inputType = input.type;
      this.className = inputType;

      if (inputType === 'radio') {
        var group = input.name;
        var inputs = ML.El._$('input');

        for (var i = 0, len = inputs.length; i < len; i++) {
          if (inputs[i].name === group) {
            inputs[i].checked = false;
            ML.El.removeClass(inputs[i].nextSibling, 'checked');
          }
        }

        ML.El.addClass(this, 'checked');
        input.checked = true;
      } else {
        ML.El.toggleClass(this, 'checked', input.checked);
        input.checked = !input.checked;
      }
    },

    /**
     * Checks if input is checked or not.
     */
    inputClick: function() {
      var custom = null;
      var checked = null;

      for (var i = 0, len = CustomRadios.inputs.length; i < len; i++) {
        custom = CustomRadios.customInputs[i];
        checked = CustomRadios.inputs[i].checked;

        if (custom) {
          ML.El.toggleClass(custom, 'checked', !checked);
        }
      }
    }
  };

  // TODO: Search for elements in container instead of all inputs on page. (browser support)

  /**
   * Custom radio buttons and checkboxes.
   * Creates `<span>` elements after the radio and checkbox inputs.
   * When an input is checked it adds a `checked` class to the `<span>` element.
   * Events bound to the `<input>` are bound to the custom radios and checkboxes. Events supported: `focus`, `blur`, `click` and `mouseup`.
   * @namespace
   *
   * @example {@lang xml}
   * <input type="radio" id="green" name="green" value="green">
   * <label for="green">green</label>
   * <input type="checkbox" name="age" id="ages10-20" value="ages10-20">
   * <label for="ages10-20">Age(s) 10 - 20</label>
   * 
   * @example <caption>The script is initialized on page load, but if new
   * <code>&lt;input type="radio" /&gt;</code> or <code>&lt;input type="checkbox" /&gt;</code>
   * are added to the page dynamically. Use the line below:</caption>
   * ML.CustomRadios();
   * 
   * @example <caption>The markup the plugin creates:</caption> {@lang xml}
   * <input type="radio" id="green" name="green" value="green" class="styled">
   * <span class="radio"></span>
   * <label for="green">green</label>
   * <input type="checkbox" name="age" id="ages10-20" value="ages10-20" class="styled">
   * <span class="checkbox"></span>
   * <label for="ages10-20">Age(s) 10 - 20</label>
   */
  ML.CustomRadios = function() {
    CustomRadios.init();
  };

  ML.CustomRadios();
}());
