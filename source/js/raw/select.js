(function () {
  /**
   * Custom select menu/dropdown.
   * @private
   */
  var Dropdown = {
    /**
     * All select menus on the page are stored here.
     * @type {Array}
     * @private
     */
    selects: [],

    /**
     * Custom select menus are stored here.
     * @type {Array}
     */
    customSelects: [],

    /**
     * Click/Focus/Blur/Change Events attached to SELECT elements.
     * @type {Object}
     */
    attachedEvents: {
      click: [],
      focus: [],
      blur: [],
      change: []
    },

    /**
     * Loops through all selects on the page and creates a dropdown that will be used
     * as the dropdown.
     * Events placed on the SELECT are stored in an object for later use.
     */
    init: function() {
      var self = this;

      self.selects = ML.nodeArr(ML.El.$q('select')).filter(function(select) {
        if (!ML.El.hasClass(select, 'system') || !ML.El.hasClass(select, 'styled')) {
          self.createCustom(select);
          self.pushEvents(select);
          return select;
        }
      });

      this.bindEvents();
    },

    /**
     * Creates the custom select.
     * @param {HTMLELement} select The SELECT element to customize.
     */
    createCustom: function(select) {
      var div = ML.El.create('div', {'class': 'dropdown'});
      var ul = null;

      div.innerHTML = '<a href="#" class="dropdown-link" tabindex="-1"></a>' +
                      '<ul class="dropdown-menu"></ul>';

      this.customSelects.push(div);
      ML.El.addClass(select, 'styled');

      ML.El.clean(select.parentNode);

      // adds the custom select after the <select>
      select.parentNode.insertBefore(div, select.nextSibling);

      if (select.disabled) {
        ML.El.addClass(div, 'disabled');
      }

      this.createLis(div, select.querySelectorAll('option'));
      ul = div.querySelector('.dropdown-menu');

      // sets the width of the new select div to the width of the <ul>
      div.style.width = ul.offsetWidth + 'px';
    },

    /**
     * Creates the LI elements inside the dropdown.
     * @param {HTMLElement} div The dropdown.
     * @param {Array} options An array of all the OPTION tags from the select menu.
     */
    createLis: function(div, options) {
      var ul = div.querySelector('.dropdown-menu');
      var dropdownLink = div.querySelector('.dropdown-link');
      var lis = '';

      options.forEach(function(option, index) {
        if (option.disabled) {
          lis += '<li class="disabled" data-value="' + option.value + '" data-index="' + index + '">';
        } else {
          lis += '<li data-value="' + option.value + '" data-index="' + index + '">';
        }

        lis += '<a href="#" tabindex="-1">' +
                  option.innerHTML +
              '</a>' +
          '</li>';

        // if there is a selected option, put it in the dropdown link
        if (option.selected) {
          dropdownLink.innerHTML = option.innerHTML;
          dropdownLink.setAttribute('data-index', index);
          div.setAttribute('data-value', option.value);
        }
      });

      ul.innerHTML = lis;
    },

    /**
     * Any events attached to the SELECT are pushed into an array to be used later.
     * @param {HTMLElement} select The SELECT to get attached events for.
     */
    pushEvents: function(select) {
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
      var selectEvent = null;
      var attachedEl = null;

      for (var i = 0, len = evt.length; i < len; i++) {
        attachedEl = evt[i][0];
        if (attachedEl === el) {
          selectEvent = evt[i][1];
        }
      }

      return selectEvent ? selectEvent.call() : function(){return;};
    },

    /**
     * Events bound to the SELECT and custom inputs DIV.
     * @private
     */
    bindEvents: function() {
      var self = this;

      self.customSelects.forEach(function(item) {
        item.querySelectorAll('li a').forEach(function(link) {
          ML.El.evt(link, 'click', self.optionClick);
          ML.El.evt(link, 'mouseover', self.optionMouseOver);
        });
      });

      ML.El.evt(document, 'click', self.documentClick);

      this.selects.map(function(select) {
        ML.El.evt(select, 'focus', self.selectFocus, true);

        ML.El.evt(select, 'blur', self.selectBlur);

        ML.El.evt(select, 'change', self.selectChange);
      });
    },

    /**
     * Click event attached to the links in the dropdown.
     * @param {Event} e The Event object.
     */
    optionClick: function(e) {
      var clicked = ML.El.clicked(e);
      var attr = ML.El.data;
      var li = clicked.parentNode;
      var custom = li.parentNode.parentNode;
      var args = {
        'index': attr(li, 'index'),
        'value': attr(li, 'value'),
        'text': clicked.innerHTML
      };

      if (ML.El.hasClass(li, 'disabled')) {
        return;
      }

      if (args.value !== ML.El.getAttr(custom, 'data-value')) {
        Dropdown.selectOption(custom, args);
        Dropdown.attachOldEvt(custom.previousSibling, 'change');
      }

      e.preventDefault();
    },

    /**
     * Mouseover event attached to the links in the dropdown.
     * Removes `selected` state from the links in the dropdown.
     * @param {Event} e The Event object.
     */
    optionMouseOver: function(e) {
      var clicked = ML.El.clicked(e);
      var ul = clicked.parentNode.parentNode;

      ML.nodeArr(ul.querySelectorAll('li')).map(function(li){
        ML.El.removeClass(li, 'selected');
      });
    },

    /**
     * Click event bound to the document to remove the `active` state
     * from the custom dropdown.
     * @param {Event} e The Event object.
     */
    documentClick: function(e) {
      var clicked = ML.El.clicked(e);

      if (ML.El.hasClass(clicked, 'disabled') || ML.El.hasClass(clicked.parentNode, 'disabled')) {
        return;
      }

      if (ML.El.hasClass(clicked.parentNode, 'dropdown')) {
        e.preventDefault();
      }

      Dropdown.toggle(clicked, clicked.parentNode);
    },

    /**
     * Focus event attached to SELECT.
     * @param {Event} e The Event object.
     */
    selectFocus: function(e) {
      var evt = e || window.event;
      var select = ML.El.clicked(evt);
      var div =  select.nextSibling;

      ML.El.addClass(div, 'focus');

      Dropdown.attachOldEvt(select, 'focus');

      if (typeof e.preventDefault !== 'undefined') {
        e.preventDefault();
      }

      return false;
    },

    /**
     * Blur event attached to SELECT.
     * @param {Event} e The Event object.
     */
    selectBlur: function(e) {
      var evt = e || window.event;
      var select = ML.El.clicked(evt);
      var div =  select.nextSibling;

      if (ML.El.hasClass(div, 'active')) {
        ML.El.removeClass(div, 'active');
      }

      ML.El.removeClass(div, 'focus');

      Dropdown.attachOldEvt(select, 'blur');

      if (typeof e.preventDefault !== 'undefined') {
        e.preventDefault();
      }

      return false;
    },

    /**
     * Change event attached to SELECT.
     * @param {Event} e The Event object.
     */
    selectChange: function(e) {
      var el = ML.El.clicked(e);
      var selected = el.selectedIndex;
      var args = {
        'index': selected,
        'value': el.childNodes[selected].value,
        'text': el.childNodes[selected].innerHTML
      };

      Dropdown.selectOption(el.nextSibling, args);
    },

    /**
     * Handles the changing of the selected item in the dropdown as well as the SELECT.
     * @param {HTMLElement} el The dropdown.
     * @param {Object} option
     * @param {Number} option.index Index position in the DOM.
     * @param {String} option.value The value of the option/link selected.
     * @param {String} option.text The text within the option/link.
     */
    selectOption: function(el, option) {
      var select = el.previousSibling;
      var dropdownLink = el.querySelector('.dropdown-link');

      dropdownLink.innerHTML = option.text;
      dropdownLink.setAttribute('data-index', option.index);
      el.setAttribute('data-value', option.value);
      select.selectedIndex = option.index;
      select.childNodes[option.index].selected = '1';
    },

    /**
     * Opens and closes the dropdown and only one to be open at a time.
     * Also events attached to the LI element to remove the selected state,
     * to replicate the <select> functionality.
     * @param {HTMLElement} clicked Element being clicked, event is bound to the document too.
     * @param {HTMLElement} clickedParent Parent element to clicked element being clicked on.
     */
    toggle: function(clicked, clickedParent) {
      if (ML.El.hasClass(clickedParent, 'dropdown')) {
        if (clicked.className === 'dropdown-link') {
          var div = clickedParent;

          ML.El.toggleClass(div, 'focus', !ML.El.hasClass(div, 'focus'));

          // Handles the toggling of the select menu and allowing only one to be open at a time.
          Dropdown.customSelects.map(function(c) {
            if (c !== clickedParent) {
              ML.El.removeClass(c, 'active focus', true);
            }
          });

          ML.El.toggleClass(div, 'active');

          // Adds selected to currently selected item
          div.querySelectorAll('li')[ML.El.data(clicked, 'index')].className = 'selected';
          Dropdown.attachOldEvt(div.previousSibling, 'click');
        }
      } else {
        for (var i = 0, len = Dropdown.customSelects.length; i < len; i++) {
          ML.El.removeClass(Dropdown.customSelects[i], 'active focus', true);
        }
      }
    }
  };
  
  /**
   * Custom select menu/dropdown.
   * This script changes all select menus and creates an HTML menu.
   * If you do not want custom radio buttons or checkboxes add `system` class name to
   * the input.
   * Events bound to the `<select>` are bound to the custom select menu. Events supported: `focus`, `blur` and `change`.
   * @namespace
   *
   * @example {@lang xml}
   * <select id="fruits" name="fruits">
   *   <option value="apple">Apple</option>
   *   <option value="orange">Orange</option>
   *   <option value="strawberry">Strawberry</option>
   * </select>
   *
   * @example <caption>The script is initialized on page load, but if new <code>&lt;select&gt;</code>
   * added to the page dynamically. Use the line below:</caption>
   * ML.Dropdown();
   *
   * @example <caption>The markup the plugin creates:</caption> {@lang xml}
   * <div class="dropdown" data-value="apple" style="width: 114px;">
   *   <a href="#" class="dropdown-link" tabindex="-1" data-index="0">apple</a>
   *   <ul class="dropdown-menu">
   *     <li data-value="apple" data-index="0"><a href="#" tabindex="-1">Apple</a></li>
   *     <li data-value="orange" data-index="1"><a href="#" tabindex="-1">Orange</a></li>
   *     <li data-value="strawberry" data-index="2"><a href="#" tabindex="-1">Strawberry</a></li>
   *   </ul>
   * </div>
   */
  ML.Dropdown = function() {
    Dropdown.init();
  };

  ML.Dropdown();
})();