(function () {
  /**
   * * Allows you to add dialogs to your site for lightboxes, user notifications,
   * custom content and etc...
   * * Clicking on the overlay or dark background behind the modal, will close the modal.
   * * Nested modals aren’t supported. Avoid nesting modals in fixed elements. The modals
   * use `position: fixed`, which can sometimes be a bit particular about its rendering. 
   * * When possible, place your modal HTML in a top-level position to avoid interference
   * from other elements.
   * * Each modal should have a unique `id` attribute.
   * * When a modal is opened the class name `modal-opened` is appended to the `<body>`.
   * * You can show modals via `data-modal` or JavaScript.
   * * Every modal element gets `MLModal` added to the element.
   *
   * @example <caption>Sample markup of modal HTML.</caption> {@lang xml}
   * <div class="modal" id="unique-id3">
   *   <div class="modal-header">
   *     <h2 class="modal-header-title">Modal header</h2>
   *     <a href="#" class="modal-close">Close me</a>
   *   </div>
   *   
   *   <div class="modal-content">
   *     <p>Modal content.</p>
   *   </div>
   * </div>
   *
   * @example <caption>You can show modals via data attribute, <code>data-modal="width:700"</code>.
   * The only lines of JavaScript would be two lines. The <code>rel</code> attribute needs to equal
   * the ID of the modal HTML element.</caption> {@lang xml}
   * <a href="#" rel="unique-id3" data-modal="width:700">open modal</a>
   *
   * // Only JavaScript needed:
   * <script>
   *   var modals = new ML.Modal({
   *     width: 800 // Global configuration.
   *   });
   *   
   *   modals.init();
   * </script>
   *
   * // Other javascript files go here.
   *
   * @example <caption>The modal can be triggered via JavaScript instead of or in addition
   * to <code>data-modal</code></caption>
   * // Will show the modal HTML with id of unique-id3 with a width of 750 pixels and will
   * // add the class name 'show me' to the modal element.
   * modals.show('unique-id3', {width: 750, activeClass: 'show-me'});
   * 
   * @param {Object} [settings] Configuration settings.
   * @param {String} [settings.selectorModal=modal] The selector for modal window.
   * @param {String} [settings.selectorClose=modal-close] The selector that closes modals.
   * @param {String} [settings.activeclass=active] The class to show the modal.
   * @param {Number} [settings.width=600] The width of the modal.
   * @param {Boolean} [settings.smart=false] If the modal should adjust the width when the
   * window is resized.
   * @constructor
   */
  ML.Modal = function(settings) {
    /**
     * Modal defaults.
     * @type {Object}
     * @private
     */
  	var DEFAULTS = {
      selectorModal: 'modal',           // TODO: class name, can change to attr
      selectorClose: 'modal-close',     // TODO: class name, can change to attr
      activeClass: 'active',
      width: 600,
      smart: false
    };

    var selectorToggle = 'data-modal';  // TODO: class name, can change to attr
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
     *
     * @example
     * modals.init();
     */
    this.init = function() {
      var tags = ML.El._$('*');

      self.destroy();

      options = ML.extend(DEFAULTS, (ML.isUndef(settings, true)) ? {} : settings);
      options.selectorModal = options.selectorModal.toString();
      options.selectorClose = options.selectorClose.toString();
      options.width = parseInt(options.width);

      if (!ML.isUndef(options.activeClass, true) && ML.isString(options.activeClass)) {
        options.activeClass = options.activeClass.toString();
      }
     
      if (ML.El.$C(options.selectorModal).length < 1) {
        throw new Error('There are no <div class="' + options.selectorModal + '" /> on the page.');
      } else {
        modals = ML.El.$C(options.selectorModal);
        overlay = ML.El.create('div', {'class': 'modal-overlay hidden'});
      }

      if (!ML.isNum(options.width)) {
        options.width = DEFAULTS.width;
      }

      if (ML.isUndef(options.activeClass, true)) {
        options.activeClass = DEFAULTS.activeClass;
      }

      ML.loop(tags, function(element) {
        if (element.getAttribute(selectorToggle) !== null) {
          if (ML.isUndef(element.rel, true)) {
            throw new Error('Element to show the modal must have a valid rel attribute.');
          } else {
            toggles.push(element);
          }
        }
      });

      document.body.appendChild(overlay);
      updateModals(null, options);
      bindEvents();
    };

    /**
     * Events bound to elements.
     * @private
     */
    function bindEvents() {
      if (toggles.length > 0) {
        ML.loop(toggles, function(element) {
          ML.El.evt(element, 'click', toggleClick);
        });
      }

      ML.El.evt(document, 'click', closeClick);

      // ML.El.evt(window, 'resize.throttle', windowResize);
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
      } else if (resizeDirection === 'up' && openedModal.offsetWidth <= openedModal.MLModal.width) {
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
      var clicked = ML.El.clicked(e);
      e.preventDefault();

      self.show(clicked.rel, ML.parObj(ML.El.data(clicked, 'modal')));
    }

    /**
     * Destroys the modal init.
     *
     * @example
     * modals.destroy();
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
        ML.El.removeClass(element, element.MLModal.activeClass);
      });

      options = null;
      overlay = null;
      openedModal = null;
      modals = [];
      toggles = [];
    };

    /**
     * Shows a modal.
     * Used when showing modal without `data-modal`.
     * @param {String} id The id of the modal you want to display.
     * @param {Object} modalOptions Configuration settings to overwrite defaults. Only
     * `activeClass` and `width` will be overriden. Other settings are ignored.
     *
     * @example
     * // Shows modal element with id of unique-id3 with a width of 400 pixels.
     * modals.show('unique-id3', {width: 400});
     */
  	this.show = function(id, modalOptions) {
      var modal = updateModals(ML.El.$(id), ML.extend(options, modalOptions));

      self.hide();
      
      ML.El.addClass(modal, modal.MLModal.activeClass);
      ML.El.removeClass(overlay, 'hidden');
      ML.El.addClass(document.body, 'modal-opened');

      modal.MLModal.width = parseInt(modal.MLModal.width); 
      openedModal = modal;

      if (modal.MLModal.smart) {
        // To prevent being bound more than once.
        if (!ML.El.isBound(window, 'resize.throttle', 'windowResize')) {
          ML.El.evt(window, 'resize.throttle', windowResize);
        }
      }

      centerModal(modal, modal.MLModal.width);
  	};

    /**
     * Handles setting the width based on certain parameters.
     * Centers the modal within the window.
     * @param {HTMLElement} modal The modal DOM element.
     * @param {Number} [width] The width to set the modal.
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
      if (ML.windowDimen().w > modal.MLModal.width) {
        width = modal.MLModal.width;
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
     * @param {Object} options The options for the modal.
     * @return {HTMLElement} The modal found in the array of modals.
     * @private
     */
    function updateModals(el, options) {
      var modal = {};

      for (var i = 0, len = modals.length; i < len; i++) {
        if (el === null || el.id === modals[i].id) {
          modal = modals[i];

          if (!ML.isNum(options.width)) {
            options.width = DEFAULTS.width;
          }

          if (ML.isUndef(options.activeClass, true)) {
            options.activeClass = DEFAULTS.activeClass;
          }
          
          modals[i].MLModal = options;
        }
      }

      return modal;
    }

    /**
     * Hides all the modals.
     *
     * @example
     * modals.hide();
     */
  	this.hide = function() {
      if (openedModal) {
        ML.El.removeClass(openedModal, openedModal.MLModal.activeClass);
      }

      ML.El.addClass(overlay, 'hidden');
      ML.El.removeClass(document.body, 'modal-opened');
      openedModal = null;
    };
  };
})();