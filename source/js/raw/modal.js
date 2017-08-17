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

      options = ML.extend(DEFAULTS, settings);
      overlay = ML.El.create('div', {'class': 'modal-overlay hidden'});
      modals = ML.El.$C(options.selectorModal);

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
      ML.loop(toggles, function(element) {
        ML.El.evt(element, 'click', toggleClick);
        element.removeEventListener('click', toggleClick, false);
      });

      document.removeEventListener('click', closeClick, false);

      if (ML.El.$C('overlay').length > 0) {
        document.body.removeChild(overlay);
      }

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
      var modal = ML.El.$(id);
      options = ML.extend(options, modalOptions);

      ML.El.addClass(modal, options.activeClass);
      ML.El.removeClass(overlay, 'hidden');

      ML.El.setStyles(modal, {
      	'maxWidth': options.width + 'px',
      	'marginTop': '-' + (modal.offsetHeight / 2) + 'px',
      	'marginLeft': '-' + (options.width / 2) + 'px'
      });
  	};

    /**
     * Hides all the modals.
     */
  	this.hide = function() {
      ML.loop(modals, function(element) {
        ML.El.removeClass(element, options.activeClass);
      });

      ML.El.addClass(overlay, 'hidden');
    };
  };
})();