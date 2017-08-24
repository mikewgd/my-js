/* jshint browser: true, latedef: false */
/* global ML */

(function() {
  'use strict';
  
  /**
   * Accordion component.
   * @constructor
   * @param {HTMLElement} el The accordion element.
   * @param {boolean} [multiple=false] Toggling multiple at a time.
   * @example
   * var acc1 = new ML.Accordion(ML.El.$('accordion1'), true);
   */
  ML.Accordion = function(el, multiple) {
    var lis = [];
    /**
     * Initialization of accordion component.
     * @private
     */
    function init() {
      try {
        lis = ML.El._$('li', el);
        hideLis();
        bindEvents();
      } catch(e) {
        throw new Error(e)
      }
    }

    /**
     * Adds "hide" class to <li> elements.
     * If an <li> has a class of "open", it stays open.
     * @param {HTMLElement} [el] When togging one at a time.
     * @private
     */
    function hideLis(li) {
      ML.loop(lis, function(item) {
        if (li) {
          // @TODO: Should use toggleClass conditional.
          if (li === item) {
            ML.El.addClass(item, 'accordion-hide-content');
            ML.El.toggleClass(li, 'accordion-hide-content');
          } else {
            ML.El.addClass(item, 'accordion-hide-content');
          }
        } else {
          ML.El.addClass(item, 'accordion-hide-content');

          if (ML.El.hasClass(item, 'accordion-open-content')) {
            ML.El.removeClass(item, 'accordion-hide-content');
            ML.El.removeClass(item, 'accordion-open-content');
          }
        }
      });
    }

    /**
     * Events bound to elements.
     * @private
     */
    function bindEvents() {
      ML.loop(ML.El._$('a', el), function(item) {
        if (ML.El.hasClass(item, 'accordion-toggle')) {
          ML.El.evt(item, 'click', function(e) {
            e.preventDefault();
            toggle(ML.El.clicked(e).parentNode);
          });
        }
      });
    }

    /**
     * Handles toggling the <li> element.
     * @param {HTMLElement} li Parent element to accordion toggle, i.e. <li>
     * @private
     */
    function toggle(li) {
      if (multiple) {
        ML.El.toggleClass(li, 'accordion-hide-content');
      } else {
        hideLis(li);
      }
    }

    init();
  };
})();

(function() {
  var accordion = ML.El._$('*');
  var toggle = false;

  for (var i = 0; i < accordion.length; i++) {
    if (ML.El.data(accordion[i], 'accordion') !== null) {
      toggle = (ML.El.data(accordion[i], 'accordion') === 'multiple') ? true : false;
      new ML.Accordion('accordion[i]', toggle);
    }
  }
})();
