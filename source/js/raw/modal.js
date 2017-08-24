/* jshint browser: true, latedef: false */
/* global ML */

(function () {
  'use strict';
  
  /**
   * Modal dialogue windows
   * @constructor
   * @param {object} [settings] Configuration settings.
   * @param {string} [settings.selectorToggle=data-modal] The selector when clicked launches a modal.
   * @param {string} [settings.selectorModal=modal] The selector for modal window.
   * @param {string} [settings.selectorClose=modal-close] The selector that closes modals.
   * @param {string} [settings.activeclass=active] The class to show the modal.
   * @param {number} [settings.width=600] The width of the modal.
   * @example
   * var modals = new ML.Modal();
   * modals.init();
   */
  ML.Modal = function(settings) {
    /**
     * Modal defaults.
     * @type {object}
     * @private
     */
  	var DEFAULTS = {
      selectorToggle: 'data-modal',     // attribute
      selectorModal: 'modal',           // class name, can change to attr
      selectorClose: 'modal-close',     // class name, can change to attr
      activeClass: 'active',
      width: 600
    };

    var options = {};
    var modals = [];
    var toggles = [];
    var overlay = null;
    var self = this;

    /**
     * Initializes the modal class.
     */
    this.init = function() {
      var tags = ML.El._$('*');

      self.destroy();

      options = ML.extend(DEFAULTS, (ML.isUndef(settings)) ? {} : settings);
     
      if (ML.El.$C(options.selectorModal).length < 1) {
        throw new Error('There are no <div class="' + options.selectorModal + '" /> on the page.');
      } else {
        modals = ML.El.$C(options.selectorModal);
        overlay = ML.El.create('div', {'class': 'modal-overlay hidden'});
      }

      ML.loop(tags, function(element) {
        if (element.getAttribute(options.selectorToggle) !== null) {
          toggles.push(element);
        }
      });

      document.body.appendChild(overlay);
      bindEvents();
    };

    /**
     * Events bound to elements.
     * @private
     */
    function bindEvents() {
      ML.loop(toggles, function(element) {
        ML.El.evt(element, 'click', toggleClick);
      });

      ML.El.evt(document, 'click', closeClick);
    }

    /**
     * Handler bound to closing a modal.
     * @param {Event} e The Event object.
     * @private
     */
    function closeClick(e) {
      e.preventDefault();
      var clicked = ML.El.clicked(e);
      if (ML.El.hasClass(clicked, options.selectorClose) ||
        ML.El.hasClass(clicked, 'modal-overlay')) {
        self.hide();
      }
    }

    /**
     * Handler bound to opening a modal.
     * @param {Event} e The Event object.
     * @private
     */
    function toggleClick(e) {
      e.preventDefault();
      self.show(ML.El.clicked(e).rel, ML.parObj(ML.El.data(ML.El.clicked(e), 'modal')));
    }

    /**
     * Destroys an instance of the modal class.
     */
    this.destroy = function() {
      // remove event listeners.
      ML.loop(toggles, function(element) {
        element.removeEventListener('click', toggleClick, false);
      });

      document.removeEventListener('click', closeClick, false);

      if (ML.El.$C('modal-overlay').length > 0) {
        document.body.removeChild(overlay);
      }

      ML.loop(modals, function(element) {
        element.removeAttribute('style');
        ML.El.removeClass(element, element._options.activeClass);
      });

      options = null;
      overlay = null;
      modals = [];
      toggles = [];
    };

    /**
     * Shows a modal.
     * @param {string} id The id of the modal you want to display.
     * @param {object} modalOptions Configuration settings to overwrite defaults.
     */
  	this.show = function(id, modalOptions) {
      var modal = updateModals(ML.El.$(id), ML.extend(options, modalOptions));
      
      ML.El.addClass(modal, modal._options.activeClass);
      ML.El.removeClass(overlay, 'hidden');

      ML.El.setStyles(modal, {
      	'maxWidth': modal._options.width + 'px',
      	'marginTop': '-' + (modal.offsetHeight / 2) + 'px',
      	'marginLeft': '-' + (modal._options.width / 2) + 'px'
      });
  	};

    /**
     * Updates the modals array.
     * @param {HTMLElement} el The modal to search for in array.
     * @param {object} options The options for the modal.
     * @return {HTMLElement} The modal found in the array of modals.
     * @private
     */
    function updateModals(el, options) {
      var modal = {};

      for (var i = 0, len = modals.length; i < len; i++) {
        if (el.id === modals[i].id) {
          modal = modals[i];
          modals[i]._options = options;
        }
      }

      return modal;
    }

    /**
     * Hides all the modals.
     */
  	this.hide = function() {
      ML.loop(modals, function(modal) {
        ML.El.removeClass(modal, modal._options.activeClass);
      });

      ML.El.addClass(overlay, 'hidden');
    };

    /**
     * Returns all registered modals.
     * @return {array} All the registered modals with custom options, "_options".
     */
    this.getAll = function() {
      return modals;
    };
  };
})();