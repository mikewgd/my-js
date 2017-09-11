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
    var openedModal = null;

    var resizeAdjust = 1.25;
    var currResize = ML.windowDimen().w;
    var resizeDirection = (currResize < lastResize) ? 'down' : 'up';
    var lastResize = ML.windowDimen().w;

    /**
     * Initializes the modal class.
     */
    this.init = function() {
      var tags = ML.El._$('*');

      self.destroy();

      options = ML.extend(DEFAULTS, (ML.isUndef(settings, true)) ? {} : settings);
     
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

      ML.El.evt(window, 'resize.throttle', windowResize)
    }

    /**
     * Event attached to window resize.
     * @private
     */
    function windowResize() {
      currResize = ML.windowDimen().w;
      resizeDirection = (currResize < lastResize) ? 'down' : 'up';
      lastResize = ML.windowDimen().w;

      if (openedModal) {
        adjustModal();
      }
    }

    /**
     * Adjusts the width of the modal according to the window dimensions.
     * @private
     */
    function adjustModal() {
      var collideRight = ML.El.collides({
        width: ML.windowDimen().w,
        height: ML.windowDimen().h,
        x: -ML.windowDimen().w,
        y: 0
      }, openedModal);

      if (collideRight) {
        centerModal(openedModal, Math.round(openedModal.offsetWidth / resizeAdjust));
      } else if (resizeDirection === 'up' && openedModal.offsetWidth <= openedModal._options.width) {
        centerModal(openedModal, Math.round(openedModal.offsetWidth * resizeAdjust));
      }
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
      openedModal = null;
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
      ML.El.addClass(document.body, 'modal-opened');

      modal._options.width = parseInt(modal._options.width); 
      openedModal = modal;

      centerModal(modal, modal._options.width);
  	};

    /**
     * Handles setting the width based on certain parameters.
     * Centers the modal within the window.
     * @param {HTMLElement} modal The modal DOM element.
     * @param {number} [width] The width to set the modal.
     * @private
     */
    function centerModal(modal, width) {
      var height = modal.offsetHeight;

      if (ML.isUndef(width)) {
        width = modal.offsetWidth;
      } 

      if (width > ML.windowDimen().w) {
        width = ML.windowDimen().w - 10;
      } 

      // Prevents the modal's width from going over the options set.
      if (ML.windowDimen().w > modal._options.width) {
        width = modal._options.width;
      } 

      // On mobile, make size of the window.
      if (ML.windowDimen().w <= 400) {
        width = ML.windowDimen().w;
      }

      if (modal.offsetHeight >= ML.windowDimen().h) {
        height = ML.windowDimen().h;
        modal.style.maxHeight = height + 'px';
      } else {
        modal.style.maxHeight = 'none';
      }

      ML.El.setStyles(modal, {
        'width': width + 'px',
        'overflow': 'auto',
        'marginTop': '-' + (height / 2) + 'px',
        'marginLeft': '-' + (width / 2) + 'px'
      });
    }

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

          if (!ML.isNum(options.width)) {
            options.width = DEFAULTS.width;
          }

          if (ML.isUndef(options.activeClass, true)) {
            options.activeClass = DEFAULTS.activeClass;
          }
          
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
      ML.El.removeClass(document.body, 'modal-opened');
      openedModal = null;
    };
  };
})();