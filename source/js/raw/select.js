/* jshint browser: true, latedef: false */
/* global ML */

'use strict';

/**
 * Custom select menu.
 * @constructor
 * @example
 * new ML.FormElements.Select().setup();
 */
ML.FormElements.Select = function() {
  /**
   * All select menus on the page are stored here.
   * @type {array}
   * @private
   */
  var selects = [];

  /**
   * Custom select menus are stored here.
   * @type {array}
   * @private
   */
  var customSelects = [];

  /**
   * Click/Focus/Blur/Change Events attached to SELECT elements.
   * @type {object}
   * @private
   */
  var attachedEvents = {
    click: [],
    focus: [],
    blur: [],
    change: []
  };

  /**
   * Links found inside custom select menus.
   * @type {array}
   * @private
   */
  var optionLinks = [];

  /**
   * Loops through all selects on the page and creates a dropdown that will be used
   * as the custom select menu.
   * Events placed on the SELECT are stored in an object for later use.
   * @param {HTMLElement} [el=document] Element to get select menus.
   * Good to use when adding new elements in the DOM.
   */
  this.setup = function(el) {
    var allSelects = el ? ML._$('select', el) : ML._$('select');

    ML.loop(allSelects, function(select) {
      if (ML.hasClass(select, 'system') || ML.hasClass(select, 'styled')) {
        return;
      }

      selects.push(select);
      createCustom(select);
      pushEvents(select);
    });

    bindEvents();
  };

  /**
   * Creates the custom select.
   * @param {HTMLELement} select The SELECT element to customize.
   * @private
   */
  function createCustom(select) {
    var div = ML.El.create('div', {'class': 'select'});
    var menuHolder = ML.El.create('div');
    var ul = ML.El.create('ul');
    var dropdownLink = ML.El.create('a', {href: '#', 'class': 'dropdown-link', tabIndex: -1});

    div.appendChild(dropdownLink);
    div.appendChild(menuHolder);
    menuHolder.appendChild(ul);

    customSelects.push(div);
    ML.addClass(select, 'styled');

    ML.El.clean(select.parentNode);

    // adds the custom select after the <select>
    select.parentNode.insertBefore(div, select.nextSibling);

    if (select.disabled) {
      ML.addClass(div, 'disabled');
    }

    createLIs(div, ML._$('option', select));

    // sets the width of the new select div to the width of the <ul>
    div.style.width = ul.offsetWidth + 'px';
  }

  /**
   * Creates the LI elements inside the dropdown.
   * @param {HTMLElement} div The custom select DIV.
   * @param {array} options An array of all the OPTION tags from the select menu.
   * @private
   */
  function createLIs(div, options) {
    var li = null;
    var ul = ML._$('ul', div)[0];
    var a = null;
    var txt = '';
    var dropdownLink = ML._$('a', div)[0];

    for (var i = 0, len = options.length; i < len; i++) {
      li = ML.El.create('li', {'data-value': options[i].value, 'data-index': i});
      a = ML.El.create('a', {'href': '#', tabIndex: -1});
      txt = document.createTextNode(options[i].innerHTML);

      li.appendChild(a);
      a.appendChild(txt);
      ul.appendChild(li);

      optionLinks.push(a);

      if (options[i].disabled) {
        ML.addClass(li, 'disabled');
      }

      // if there is a selected option, put it in the dropdown link
      if (options[i].selected) {
        dropdownLink.innerHTML = options[i].innerHTML;
        dropdownLink.setAttribute('data-index', i);
        div.setAttribute('sel-data-value', options[i].value);
      }
    }
  }

  /**
   * Any events attached to the SELECT are pushed into an array to be used later.
   * @param {HTMLElement} select The SELECT to get attached events for.
   * @private
   */
  function pushEvents(select) {
    var events = ML.El.Events;
    var elem = null;
    var type = null;
    var func = null;

    for (var i = 0, len = events.length; i < len; i++) {
      elem = events[i][0];
      type = events[i][1];
      func = events[i][2];

      // Only pushes the events if SELECT has any events attached to it.
      if (elem === select) {
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
    var selectEvent = null;
    var attachedEl = null;

    for (var i = 0, len = evt.length; i < len; i++) {
      attachedEl = evt[i][0];
      if (attachedEl === el) {
        selectEvent = evt[i][1];
      }
    }

    return selectEvent ? selectEvent.call() : function(){return;};
  }

  /**
   * Events bound to the SELECT and custom inputs DIV.
   * @private
   */
  function bindEvents() {
    ML.loop(optionLinks, function(optionLink) {
      // Events for links in the custom select menu.
      ML.El.evt(optionLink, 'click', function(e){
        var clicked = ML.El.clicked(e);
        var attr = ML.El.data;
        var li = clicked.parentNode;
        var custom = li.parentNode.parentNode.parentNode;
        var args = {
          'index': attr(li, 'index'),
          'value': attr(li, 'value'),
          'text': clicked.innerHTML
        };

        if (ML.hasClass(li, 'disabled')) {
          return;
        }

        if (args.value !== ML.El.getAttr(custom, 'sel-data-value')) {
          selectOption(custom, args);
          attachOldEvt(custom.previousSibling, 'change');
        }

        e.preventDefault();
      });

      // Removes selected state from <li>
      ML.El.evt(optionLink, 'mouseover', function(e){
        var clicked = ML.El.clicked(e);
        var ul = clicked.parentNode.parentNode;

        ML.loop(ML._$('li', ul), function(li){
          ML.removeClass(li, 'selected');
        });
      });
    });

    ML.El.evt(document, 'click', function(e) {
      var clicked = ML.El.clicked(e);

      if (ML.hasClass(clicked, 'disabled') || ML.hasClass(clicked.parentNode, 'disabled')) {
        return;
      }

      if (ML.hasClass(clicked.parentNode, 'select')) {
        e.preventDefault();
      }

      toggle(clicked, clicked.parentNode);
    });

    ML.loop(selects, function(select) {
      ML.El.evt(select, 'focus', function(e) {
        focusBlur(e);
      }, true);

      ML.El.evt(select, 'blur', function(e) {
        focusBlur(e);
      });

      ML.El.evt(select, 'change', function(e) {
        var el = ML.El.clicked(e);
        var selected = el.selectedIndex;
        var args = {
          'index': selected,
          'value': el.childNodes[selected].value,
          'text': el.childNodes[selected].innerHTML
        };

        selectOption(el.nextSibling, args);
      });
    });
  }

  /**
   * Focus and blur event attached to SELECT corresponding to the custom select.
   * @param {Event} evt The Event object.
   * @private
   */
  function focusBlur(evt) {
    var e = evt || window.event;
    var select = ML.El.clicked(e);
    var div =  select.nextSibling;

    // @TODO: Should use toggleClass conditional.
    if (evt.type === 'focus') {
      ML.addClass(div, 'focus');
    } else {
      if (ML.hasClass(div, 'active')) {
        ML.removeClass(div, 'active');
      }

      ML.removeClass(div, 'focus');
    }

    attachOldEvt(select, evt.type);

    if (typeof e.preventDefault !== 'undefined') {
      e.preventDefault();
    }

    return false;
  }

  /**
   * Handles the changing of the selected item in the custom select menu as well as the SELECT.
   * @param {HTMLElement} el The custom select menu.
   * @param {object} option
   * @param {number} option.index Index position in the DOM.
   * @param {string} option.value The value of the option/link selected.
   * @param {string} option.text The text within the option/link.
   * @private
   */
  function selectOption(el, option) {
    var select = el.previousSibling;
    var dropdownLink = ML._$('a', el)[0];

    dropdownLink.innerHTML = option.text;
    dropdownLink.setAttribute('data-index', option.index);
    el.setAttribute('sel-data-value', option.value);
    select.selectedIndex = option.index;
    select.childNodes[option.index].selected = '1';
  }

  /**
   * Opens and closes the custom select menu and only one to be open at a time.
   * Also events attached to the LI element to remove the selected state,
   * to replicate the <select> functionality.
   * @param {HTMLElement} clicked Element being clicked, event is bound to the document too.
   * @param {HTMLElement} clickedParent Parent element to clicked element being clicked on.
   * @private
   */
  function toggle(clicked, clickedParent) {
    if (ML.hasClass(clickedParent, 'select')) {
      if (clicked.className === 'dropdown-link') {
        var div = clickedParent;

        if (!ML.hasClass(div, 'focus')) {
          ML.addClass(div, 'focus');
        }

        // Handles the toggling of the select menu and allowing only one to be open at a time.
        ML.loop(customSelects, function(c) {
          if (c !== clickedParent) {
            ML.removeClass(c, 'active');
            ML.removeClass(c, 'focus');
          }
        });

        ML.toggleClass(div, 'active');

        // Adds selected to currently selected item
        ML._$('li', div)[ML.El.data(clicked, 'index')].className = 'selected';
        attachOldEvt(div.previousSibling, 'click');
      }
    } else {
      for (var i = 0, len = customSelects.length; i < len; i++) {
        ML.removeClass(customSelects[i], 'active');
        ML.removeClass(customSelects[i], 'focus');
      }
    }
  }
};

(function () {
  new ML.FormElements.Select().setup();
}());
