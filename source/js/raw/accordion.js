/**
 * Accordion component.
 * @constructor
 * @param {HTMLElement} el The accordion element.
 * @param {boolean} [multiple=false] Toggling multiple at a time.
 * @example
 * var acc1 = new ML.Accordion(ML.$('accordion1'), true);
 */
ML.Accordion = function(el, multiple) {
  var lis = ML._$('li', el);
  var hashUrl = '';

  /**
   * Adds "hide" class to <li> elements.
   * If an <li> has a class of "open", it stays open.
   * @param {HTMLElement} [el] When togging one at a time.
   * @private
   */
  function hideLis(li) {
    ML.loop(lis, function(item, i) {
      if (li) {
        // @TODO: Should use toggleClass conditional.
        if (li === item) {
          ML.addClass(item, 'accordion-hide-content');
          ML.toggleClass(li, 'accordion-hide-content');
        } else {
          ML.addClass(item, 'accordion-hide-content');
        }
      } else {
        ML.addClass(item, 'accordion-hide-content');

        if (ML.hasClass(item, 'accordion-open-content')) {
          ML.removeClass(item, 'accordion-hide-content');
          ML.removeClass(item, 'accordion-open-content');
        }
      }
    });
  }

  /**
   * Events bound to elements.
   * @private
   */
  function bindEvents() {
    ML.loop(ML._$('a', el), function(item, i) {
      if (ML.hasClass(item, 'accordion-toggle')) {
        ML.El.evt(item, 'click', function(e) {
          e.preventDefault();
          toggle(ML.El.clicked(e).parentNode);
        });
      }
    });
  }

  /**
   * Sets the current active tab based on hash. The URL format is as follows: 
   * "#acc-{ID}-{TAB INDEX}"
   * @private
   */
  function windowSet() {
    var activeTab = ML._$('li', ML.$(hashUrl[1]));
    toggle(activeTab[parseInt(hashUrl[2])]);
  }
  
  /**
   * Handles toggling the <li> element.
   * @param {HTMLElement} li Parent element to accordion toggle, i.e. <li>
   * @private
   */
  function toggle(li) {
    if (multiple) {
      ML.toggleClass(li, 'accordion-hide-content');
    } else {
      hideLis(li);
    }
  }

  hideLis();
  bindEvents();

  if (el.id && window.location.hash) {
    hashUrl = window.location.hash.split('-');
    windowSet();
  }
};

(function() {
  var accordion = ML._$('*');
  var toggle = false;

  for (var i = 0; i < accordion.length; i++) {
    if (ML.El.data(accordion[i], 'accordion') !== null) {
      toggle = (ML.El.data(accordion[i], 'accordion') === 'multiple') ? true : false;
      new ML.Accordion(accordion[i], toggle);
    }
  }
})();