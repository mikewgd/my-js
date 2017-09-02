/* jshint browser: true, latedef: false */
/* global ML */

(function () {
  'use strict';

  /**
   * Custom radio buttons and checkboxes.
   * If you do not want custom radio buttons or checkboxes add `system` class name to
   * the input.
   * 
   * You can apply this to new radio buttons or checkboxes on the page as well:
   * @namespace
   * @example
   * ML.CustomRadios.init();
   */
  ML.CustomRadios = {
    /**
     * All radios and checkboxes on the page are stored here.
     * @type {array}
     */
    inputs: [],

    /**
     * Custom radios and checkboxes are stored here.
     * @type {array}
     */
    customInputs: [],

    /**
     * Click/Focus/Blur Events attached to INPUT elements.
     * @type {object}
     */
    attachedEvents: {
      click: [],
      focus: [],
      blur: []
    },

    /**
     * Loops through all inputs on the page and creates a SPAN that
     * will be used as the custom input.
     * Events placed on the INPUT are stored in an object for later use.
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
     * @param {HTMLELement} input The INPUT element to customize.
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
     * Any events attached to the INPUT are pushed into an array to be used later.
     * @param {HTMLElement} input The INPUT to get attached events for.
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
     * @param {string} eventType The type of event to look for.
     * @return {function}
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
     * Events bound to the INPUT and custom inputs SPAN.
     */
    bindEvents: function() {
      var self = this;

      ML.loop(this.inputs, function(input, i) {
        ML.El.evt(input, 'focus', self.focusBlur);

        ML.El.evt(input, 'blur', self.focusBlur);

        ML.El.evt(input, 'click', self.ref);

        if (!ML.El.hasClass(self.customInputs[i], 'disabled')) {
          ML.El.evt(self.customInputs[i], 'mouseup', function(e) {
            var clicked = ML.El.clicked(e);
            self.check.call(clicked);
            self.attachOldEvt(input, 'click');
          });
        }
      });
    },

    /**
     * Focus and blur event attached to INPUT corresponding to the custom input.
     * @param {Event} evt The Event object.
     */
    focusBlur: function(evt) {
      var e = evt || window.event;
      var input = ML.El.clicked(e);
      var span =  input.nextSibling;

      if (evt.type === 'focus') {
        ML.El.addClass(span, 'focus');
      } else {
        ML.El.removeClass(span, 'focus');
      }

      ML.CustomRadios.attachOldEvt(input, evt.type);

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
        // @TODO: Should use toggleClass conditional.
        if (input.checked) {
          ML.El.removeClass(this, 'checked');
          input.checked = false;
        } else {
          ML.El.addClass(this, 'checked');
          input.checked = true;
        }
      }
    },

    /**
     * Checks if INPUT is checked or not.
     */
    ref: function() {
      var custom = null;
      var checked = null;

      for (var i = 0, len = ML.CustomRadios.inputs.length; i < len; i++) {
        custom = ML.CustomRadios.customInputs[i];
        checked = ML.CustomRadios.inputs[i].checked;

        if (custom) {
          // @TODO: Should use toggleClass conditional.
          if (checked) {
            ML.El.addClass(custom, 'checked');
          } else {
            ML.El.removeClass(custom, 'checked');
          }
        }
      }
    }
  };

  ML.CustomRadios.init();
}());
