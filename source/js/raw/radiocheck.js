/* jshint browser: true, latedef: false */
/* global ML */

(function () {
  'use strict';

  /**
   * Custom radio buttons and checkboxes.
   * @constructor
   * @example
   * new ML.FormElements.RadioCheckboxes().setup();
   */
  ML.FormElements.RadioCheckboxes = function() {
    /**
     * All radios and checkboxes on the page are stored here.
     * @type {array}
     * @private
     */
    var inputs = [];

    /**
     * Custom radios and checkboxes are stored here.
     * @type {array}
     * @private
     */
    var customInputs = [];

    /**
     * Click/Focus/Blur Events attached to INPUT elements.
     * @type {object}
     * @private
     */
    var attachedEvents = {
      click: [],
      focus: [],
      blur: []
    };

    /**
     * Loops through all inputs on the page and creates a SPAN that
     * will be used as the custom input.
     * Events placed on the INPUT are stored in an object for later use.
     * @param {HTMLElement} [el=document] Element to get radio buttons and checkboxes.
     * Good to use when adding new elements in the DOM.
     */
    this.setup = function(el) {
      var allInputs = el ? ML.El._$('input', el) : ML.El._$('input');

      ML.loop(allInputs, function(input) {
        if (ML.El.hasClass(input, 'system') || ML.El.hasClass(input, 'styled')) {
          return;
        }

        if (input.type === 'checkbox' || input.type === 'radio') {
          inputs.push(input);

          createCustom(input);
          pushEvents(input);
        }
      });

      bindEvents();
    };

    /**
     * Creates the custom input.
     * @param {HTMLELement} input The INPUT element to customize.
     * @private
     */
    function createCustom(input) {
      var span = ML.El.create('span', {'class': input.type});

      customInputs.push(span);
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
    }

    /**
     * Any events attached to the INPUT are pushed into an array to be used later.
     * @param {HTMLElement} input The INPUT to get attached events for.
     * @private
     */
    function pushEvents(input) {
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
          attachedEvents[type].push([elem, func]);
        }
      }
    }

    /**
     * Attaches the old events stored in the event object to be applied.
     * @param {HTMLElement} el The element to find event attached to it.
     * @param {string} eventType The type of event to look for.
     * @return {function}
     * @private
     */
    function attachOldEvt(el, eventType) {
      var evt = attachedEvents[eventType];
      var inputEvent = null;
      var attachedEl = null;

      for (var i = 0, len = evt.length; i < len; i++) {
        attachedEl = evt[i][0];
        if (attachedEl === el) {
          inputEvent = evt[i][1];
        }
      }

      return inputEvent ? inputEvent.call() : function(){return;};
    }

    /**
     * Events bound to the INPUT and custom inputs SPAN.
     * @private
     */
    function bindEvents() {
      ML.loop(inputs, function(input, i) {
        ML.El.evt(input, 'focus', function(e) {
          focusBlur(e);
        });

        ML.El.evt(input, 'blur', function(e) {
          focusBlur(e);
        });

        ML.El.evt(input, 'click', function() {
          ref();
        });

        if (!ML.El.hasClass(customInputs[i], 'disabled')) {
          ML.El.evt(customInputs[i], 'mouseup', function(e) {
            var clicked = ML.El.clicked(e);
            check.call(clicked);
            attachOldEvt(input, 'click');
          });
        }
      });
    }

    /**
     * Focus and blur event attached to INPUT corresponding to the custom input.
     * @param {Event} evt The Event object.
     * @private
     */
    function focusBlur(evt) {
      var e = evt || window.event;
      var input = ML.El.clicked(e);
      var span =  input.nextSibling;

      if (evt.type === 'focus') {
        ML.El.addClass(span, 'focus');
      } else {
        ML.El.removeClass(span, 'focus');
      }

      attachOldEvt(input, evt.type);

      if (typeof e.preventDefault !== 'undefined') {
        e.preventDefault();
      }

      return false;
    }

    /**
     * Checks/unchecks the custom radio buttons/checkboxes.
     * @private
     */
    function check() {
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
    }

    /**
     * Checks if INPUT is checked or not.
     * @private
     */
    function ref() {
      var custom = null;
      var checked = null;

      for (var i = 0, len = inputs.length; i < len; i++) {
        custom = customInputs[i];
        checked = inputs[i].checked;

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

  new ML.FormElements.RadioCheckboxes().setup();
}());
