(function () {
  /**
   * Custom select.
   * @private
   */
  var Dropdown = {
    /**
     * <select> stored here.
     * @type {Array}
     * @private
     */
    selects: [],

    /**
     * Custom select are stored here.
     * @type {Array}
     */
    customSelects: [],

    /**
     * Click/Focus/Blur/Change Events attached to <select>.
     * @type {Object}
     */
    attachedEvents: {
      click: [],
      focus: [],
      blur: [],
      change: []
    },

    /**
     * Links found inside the dropdown.
     * @type {Array}
     */
    optionLinks: [],

    /**
     * Loops through all `<select>` on the page and creates a dropdown.
     */
    init: function() {
      var selects = ML.El._$('select');
      var self = this;

      ML.loop(selects, function(select) {
        if (ML.El.hasClass(select, 'system') || ML.El.hasClass(select, 'styled')) {
          return;
        }

        self.selects.push(select);
        self.createCustom(select);
        self.pushEvents(select);
      });

      this.bindEvents();
    },

    /**
     * Creates the custom select.
     * @param {HTMLELement} select The `<select>` element.
     */
    createCustom: function(select) {
      var div = ML.El.create('div', {'class': 'dropdown'});
      var ul = ML.El.create('ul', {'class': 'dropdown-menu'});
      var dropdownLink = ML.El.create('a', {href: '#', 'class': 'dropdown-link', tabIndex: -1});

      div.appendChild(dropdownLink);
      div.appendChild(ul);

      this.customSelects.push(div);
      ML.El.addClass(select, 'styled');

      ML.El.clean(select.parentNode);

      // adds the custom select after the <select>
      select.parentNode.insertBefore(div, select.nextSibling);

      if (select.disabled) {
        ML.El.addClass(div, 'disabled');
      }

      this.createLis(div, ML.El._$('option', select));

      // sets the width of the new select div to the width of the <ul>
      div.style.width = (ul.offsetWidth + 1) + 'px';
    },

    /**
     * Creates the `<li>` elements inside the dropdown.
     * @param {HTMLElement} div The dropdown.
     * @param {Array} options An array of all the `<option>` tags from the `<select>`.
     */
    createLis: function(div, options) {
      var li = null;
      var ul = ML.El._$('ul', div)[0];
      var a = null;
      var txt = '';
      var dropdownLink = ML.El._$('a', div)[0];

      for (var i = 0, len = options.length; i < len; i++) {
        li = ML.El.create('li', {'data-value': options[i].value, 'data-index': i});
        a = ML.El.create('a', {'href': '#', tabIndex: -1});
        txt = document.createTextNode(options[i].innerHTML);

        li.appendChild(a);
        a.appendChild(txt);
        ul.appendChild(li);

        this.optionLinks.push(a);

        if (options[i].disabled) {
          ML.El.addClass(li, 'disabled');
        }

        // if there is a selected option, put it in the dropdown link
        if (options[i].selected) {
          dropdownLink.innerHTML = options[i].innerHTML;
          dropdownLink.setAttribute('data-index', i);
          div.setAttribute('data-value', options[i].value);
        }
      }
    },

    /**
     * Any events attached to the `<select>` are pushed into an array to be used later.
     * @param {HTMLElement} select The `<select>` to get attached events for.
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

        // Only pushes the events if `<select>` has any events attached to it.
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
     * Events bound to the `<select>` and custom select.
     */
    bindEvents: function() {
      var self = this;

      ML.loop(this.optionLinks, function(optionLink) {
        ML.El.evt(optionLink, 'click', self.optionClick);

        ML.El.evt(optionLink, 'mouseover', self.optionMouseOver);
      });

      ML.El.evt(document, 'click', self.documentClick);

      ML.El.evt(window, 'blur', function() {
        for (var i = 0, len = Dropdown.customSelects.length; i < len; i++) {
          ML.El.removeClass(Dropdown.customSelects[i], 'active focus', true);
        }
      });

      ML.loop(this.selects, function(select) {
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

      ML.loop(ML.El._$('li', ul), function(li){
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
     * Focus event attached to `<select>`.
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
     * Blur event attached to `<select>`.
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
     * Change event attached to `<select>`.
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
     * Handles the changing of the selected item in the dropdown as well as the `<select>`.
     * @param {HTMLElement} el The dropdown.
     * @param {Object} option
     * @param {Number} option.index Index position in the DOM.
     * @param {String} option.value The value of the option/link selected.
     * @param {String} option.text The text within the option/link.
     */
    selectOption: function(el, option) {
      var select = el.previousSibling;
      var dropdownLink = ML.El._$('a', el)[0];

      dropdownLink.innerHTML = option.text;
      dropdownLink.setAttribute('data-index', option.index);
      el.setAttribute('data-value', option.value);
      select.selectedIndex = option.index;
      select.childNodes[option.index].selected = '1';
    },

    /**
     * Opens and closes the dropdown and only one to be open at a time.
     * Also events attached to the `<li>` element to remove the selected state,
     * to replicate the <`<select>`> functionality.
     * @param {HTMLElement} clicked Element being clicked, event is bound to the document too.
     * @param {HTMLElement} clickedParent Parent element to clicked element being clicked on.
     */
    toggle: function(clicked, clickedParent) {
      if (ML.El.hasClass(clickedParent, 'dropdown')) {
        if (clicked.className === 'dropdown-link') {
          var div = clickedParent;
          var menu = ML.El._$('ul', div)[0];

          if (!ML.El.hasClass(div, 'focus')) {
            ML.El.addClass(div, 'focus');
          }

          // Handles the toggling of the select menu and allowing only one to be open at a time.
          ML.loop(Dropdown.customSelects, function(c) {
            if (c !== clickedParent) {
              ML.El.removeClass(c, 'active');
              ML.El.removeClass(c, 'focus');
            }
          });

          ML.El.toggleClass(div, 'active');
          menu.style.height = window.innerHeight -
            div.offsetTop - clicked.offsetHeight - 20 + 'px';

          // Adds selected to currently selected item
          ML.El._$('li', div)[ML.El.data(clicked, 'index')].className = 'selected';
          Dropdown.attachOldEvt(div.previousSibling, 'click');
        }
      } else {
        for (var i = 0, len = Dropdown.customSelects.length; i < len; i++) {
          ML.El.removeClass(Dropdown.customSelects[i], 'active');
          ML.El.removeClass(Dropdown.customSelects[i], 'focus');
        }
      }
    }
  };

  // TODO: Search for elements in container instead of all selects on page. (browser support)
  
  /**
   * Custom select.
   * If the `<select>` has a class name of `system`, a custom select will not be created.
   * This script changes all select menus and creates an HTML menu.
   * Events bound to the `<select>` are bound to the custom select menu. Events supported: `focus`, `blur` and `change`.
   * [See it in action + some notes!](/form-select.html)
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