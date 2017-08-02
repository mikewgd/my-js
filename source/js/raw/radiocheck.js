(function () {
  ML.FormElements.RadioCheckboxes = function() {

    /** @type {array} All radios and checkboxes on the page are stored here. */
    var inputs = [];

    /** @type {array} Custom radios and checkboxes are stored here. */
    var customInputs = [];

    /** @type {object} Events attached to <input> elements. */
    var attachedEvents = {
      click: [],
      focus: [],
      blur: []
    };

    /**
     * Loops through all inputs on the page and creates a <span> that
     * will be used as the custom input.
     * Events placed on the <input> are stored in an object for later use.
     * @param {HTMLElement} [el=document] Element to get radio buttons and checkboxes.
     * Good to use when adding new elements in the DOM.
     */
    this.setup = function(el) {
      inputs = el ? ML._$('input', el) : ML._$('input');

      ML.loop(inputs, function(input, i) {
        if (ML.hasClass(input, 'system') || ML.hasClass(input, 'styled')) return;
        if (input.type == 'checkbox' || input.type == 'radio') {
          inputs.push(input);

          createCustom(input);
          pushEvents(input);
        }
      });

      bindEvents();
    };

    /**
     * Creates the custom input.
     * @param {HTMLELement} input The <input> element to customize.
     * @private
     */
    function createCustom(input) {
      var span = ML.El.create('span', {'class': input.type});

      customInputs.push(input);
      ML.addClass(input, 'styled');

      ML.El.clean(input.parentNode);

      // adds the custom input after the input
      input.parentNode.insertBefore(span, input.nextSibling);

      if (input.checked == true) ML.addClass(span, 'checked');
      if (input.disabled == true) ML.addClass(span, 'disabled');
    }

    /**
     * Any events attached to the <input> are pushed into an array to be used later.
     * @param {HTMLElement} input The <input> to get attached events for.
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

        // Only pushes the events if <input> has any events attached to it.
        if (elem === input) attachedEvents[type].push([elem, func]);
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
        if (attachedEl === el) inputEvent = evt[i][1];
      }

      return inputEvent ? inputEvent.call() : (function(){return;});
    }

    /**
     * Events bound to the <input> and custom inputs <span>.
     * @return {[type]} [description]
     */
    function bindEvents() {
      ML.loop(inputs, function(input, i) {
        ML.El.evt(input, 'focus', function(e) {focusBlur(e);});
        ML.El.evt(input, 'blur', function(e) {focusBlur(e);});
        ML.El.evt(input, 'click', function(e) {ref();});

        if (!ML.hasClass(customs[i], 'disabled')) {
          ML.El.evt(customs[i], 'mouseup', function(e) {
            var clicked = ML.El.clicked(e);
            check.call(clicked);
            attachOldEvt(input, 'click');
          });
        }
      });
    }

/**
* @function focusBlur
* Focus and blur event attached to <input>, but made to match corresponding custom.
*
* @param {Object} evt - event being passed on "focus" or "blur".
*/
function focusBlur(evt) {
var e = evt || window.event,
inp = ML.El.clicked(e),
span =  inp.nextSibling;

if (evt.type == 'focus') {
ML.addClass(span, "focus");
} else {
ML.removeClass(span, "focus");
}

this.attachOldEvt(inp, evt.type);

if (typeof e.preventDefault !== 'undefined') {
e.preventDefault();
}
return false;
}

/**
* @function check
* Checks/Unchecks the custom radio/checkbox.
*/
function check() {
var input = this.previousSibling,
inputType = input.type;

var self = this;

this.className = inputType;

if (inputType == 'radio') {
var group = input.name, inputs = ML._$('input');
for (i=0; i<inputs.length; i++) {
if (inputs[i].name == group) {
inputs[i].checked = false;
ML.removeClass(inputs[i].nextSibling, 'checked');
}
}
ML.addClass(this, 'checked');
input.checked = true;
} else {
if (input.checked == true) {
ML.removeClass(this, 'checked');
input.checked = false;
} else {
ML.addClass(this, 'checked');
input.checked = true;
}
}
}

/**
* @function ref
* Checks if input is checked or not and takes necessary actions.
*/
function ref() {
for (var i = 0; i < this.inputs.length; i++) {
var input = this.inputs[i], custom = this.customs[i], checked;
checked = input.checked;

if (custom) {
checked ? ML.addClass(custom, 'checked') : ML.removeClass(custom, 'checked');
}
}
}
};

  new ML.FormElements.RadioCheckboxes().setup();
}());
