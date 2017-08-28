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
    var self = this;
    var storedHash = window.location.hash;
    var interval = null;

    /**
     * Initialization of accordion component.
     */
    this.init = function() {
      try {
        self.destroy();

        lis = ML.El._$('li', el);
        hideLis();
        bindEvents();
      } catch(e) {
        throw new Error(e);
      }
    };

    this.destroy = function() {
      if (lis.length > 0) {
        ML.loop(lis, function(item, index) {
          ML.El.removeClass(item, 'accordion-hide-content');
          ML.El.removeClass(item, 'accordion-open-content');
        });

        ML.loop(ML.El._$('a', el), function(item) {
          if (ML.El.hasClass(item, 'accordion-toggle')) {
            item.removeEventListener('click', toggle, false);
          }
        });

        lis = [];
      }
    };

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
      /*if ('onhashchange' in window) { // event supported?
        window.onhashchange = function () {
          console.log(window.location.hash);
        }
      } else { // event not supported:
        interval = setInterval(function () {
          console.log('set interval')
          if (window.location.hash !== storedHash) {
            storedHash = window.location.hash;
          }
        }, 100);
      }*/

      ML.loop(ML.El._$('a', el), function(item) {
        if (ML.El.hasClass(item, 'accordion-toggle')) {
          ML.El.evt(item, 'click', toggle);
        }
      });
    }

    function openTab(hash) {
      
    }

    /**
     * Handles toggling the <li> element.
     * @param {Event} e The clicked element.
     * @private
     */
    function toggle(e) {
      var li = ML.El.clicked(e).parentNode;
      e.preventDefault();

      console.log(li, 'toggle')

      if (multiple) {
        ML.El.toggleClass(li, 'accordion-hide-content');
      } else {
        hideLis(li);
      }
    }
  };
})();

(function() {
  var accordion = ML.El._$('*');
  var toggle = false;
  var acc = null;

  for (var i = 0; i < accordion.length; i++) {
    if (ML.El.data(accordion[i], 'accordion') !== null) {
      toggle = (ML.El.data(accordion[i], 'accordion') === 'multiple') ? true : false;
      acc = new ML.Accordion(accordion[i], toggle)

      acc.init();
    }
  }
})();
