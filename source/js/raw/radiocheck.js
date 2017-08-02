(function () {	
  ML.FormElements.RadioCheckboxes = function() {
  var inputs = [];
  var customInputs = [];
  var attachedEvents = {
    click: [],
    focus: [],
    blur: []
  };

  /**
  * @function setup
  * Gets all the radio buttons and checkboxes on the page and stores them in an array.
  * Creates a custom input (<span> element) for each <input> element and then its inserted into the DOM.
  * Events placed on the <input>s themselves are added to an object to store for later.
  *
  * @param {HTMLElement} el (optional) - an element to look for radio buttons and checkboxes. Good for when adding to the DOM.
  */
  this.setup = function(el) {
    inputs = el ? ML._$('input', el) : ML._$('input');

    ML.loop(inputs, function(input, i) {
    if (ML.hasClass(input, 'system') || ML.hasClass(input, 'styled')) return;
    if (input.type == 'checkbox' || input.type == 'radio') self.inputs.push(input);
    });

    ML.loop(self.inputs, function (inp, i) {
    self.customs[i] = ML.El.create('span', {'class':inp.type});
    ML.addClass(inp, 'styled');

    ML.El.clean(inp.parentNode);

    // adds the custom input after the input
    inp.parentNode.insertBefore(self.customs[i], inp.nextSibling);

    if(inp.checked == true) {ML.addClass(self.customs[i], 'checked');}
    if(inp.disabled == true) {ML.addClass(self.customs[i], 'disabled');}

    self.pushEvents(inp);
    });

    self.bindEvents();
  };

/**
* @function pushEvents
* Any events attached to the radio buttons or checkboxes are pushed into an array to be used later.
*
* @param {HTMLElement} input - radio button or checkbox element.
*/
function pushEvents(input) {
var events = ML.El.Events;
for (var i=0; i<events.length; i++) {
var elem = events[i][0], type = events[i][1], func = events[i][2];
// Only pushes the events if <input> has any events attached to it.	
if (elem == input) this.attachedEvents[type].push([elem, func]);	
}
}

/**
* @function attachOldEvt
* Attaches the old events stored in the event object to be applied.
*
* @param {HTMLElement} el - the element to see if it has an event attached to it.
* @param {String} evtType - type of event to look for.
*/
function attachOldEvt(el, evtType) {
var evt = this.attachedEvents[evtType], inputEvt;
for (i=0; i<evt.length; i++) {
var attachedEl = evt[i][0];
if (attachedEl == el) inputEvt = evt[i][1];
}

return inputEvt ? inputEvt.call() : (function(){return;});
}

/**
* @function bindEvents
* Binds events to the custom inputs (<span>s) and <input>s.
*/
function bindEvents() {
var self = this;

ML.loop(self.inputs, function(inp, i) {
ML.El.evt(inp, 'focus', function(e) {self.focusBlur(e);});
ML.El.evt(inp, 'blur', function(e) {self.focusBlur(e);});
ML.El.evt(inp, 'click', function(e) {self.ref();});

if (!ML.hasClass(self.customs[i], 'disabled')) {
ML.El.evt(self.customs[i], 'mouseup', function(e) {
var clicked = ML.El.clicked(e);
self.check.call(clicked);
self.attachOldEvt(inp, 'click');
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

/**
* @class RC
* @namespace ML
* Custom radio and checkbox buttons.
*
* @property {Object} inputs - all radios and checkboxes on the page are stored here.
* @property {Object} custom - custom radios and checkboxes are stored here.
* @property {Object} attachedEvents - events attached to <input> elements, i.e click/focus/blur event(s).
*/
ML.RC = {
inputs: [],
customs: [],
attachedEvents: {click: [], focus: [], blur: []},
}

ML.RC.setup();	
}());