(function () {
  /**
   * * Allows you to add dialogs to your site for lightboxes, user notifications,
   * custom content and etc...
   * * Nested modals aren’t supported. Avoid nesting modals in fixed elements. The modals
   * use `position: fixed`, which can sometimes be a bit particular about its rendering. 
   * * When possible, place your modal HTML in a top-level position to avoid interference
   * from other elements.
   * * Each modal should have a unique `id` attribute.
   * * When a modal is opened the class name `js-modal-opened` is appended to the `<html>`.
   * * You can show modals via `data-modal` or JavaScript.
   * * [See it in action + some notes!](/modal.html)
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
   *   var modals = new ML.Modal();
   *   
   *   modals.init();
   * </script>
   *
   * // Other javascript files go here.
   *
   * @example <caption>The modal can be triggered via JavaScript instead of or in addition
   * to <code>data-modal</code></caption>
   * // Will show the modal HTML with id of unique-id3 with a width of 750 pixels
   * modals.show('unique-id3', {width: 750});
   * 
   * @constructor
   */
  ML.Modal = function() {
    var toggles = [];
    var modals = [];
    var overlay = null;
    var self = this;
    var openedModal = null;

    /**
     * Initializes the modal class.
     *
     * @example
     * modals.init();
     */
    this.init = function() {
      var tags = ML.El._$('*');

      self.destroy();

      if (ML.El.$C('modal').length < 1) {
        throw new Error('There are no <div class="modal" /> on the page.');
      }

      overlay = ML.El.create('div', {'class': 'modal-overlay hidden'});
      
      // IE
      overlay.style.filter = 'alpha(opacity=50)';

      ML.loop(tags, function(element) {
        if (element.getAttribute('data-modal') !== null) {
          if (ML.isUndef(element.rel, true)) {
            throw new Error('Element to show the modal must have a valid rel attribute.');
          } else {
            toggles.push(element);
          }
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
      if (toggles.length > 0) {
        ML.loop(toggles, function(element) {
          ML.El.evt(element, 'click', toggleClick);
        });
      }

      ML.El.evt(document, 'click', closeClick);
    }

    /**
     * Handler bound to closing a modal.
     * @param {Event} e The Event object.
     * @private
     */
    function closeClick(e) {
      var clicked = ML.El.clicked(e);
      if (ML.El.hasClass(clicked, 'modal-close') || ML.El.hasClass(clicked, 'modal-overlay')) {
        e.preventDefault();
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
        ML.El.removeEvt(element, 'click', toggleClick);
      });

      ML.El.removeEvt(document, 'click', closeClick);

      if (overlay) {
        document.body.removeChild(overlay);
      }

      ML.loop(modals, function(element) {
        element.removeAttribute('style');
        ML.El.removeClass(element, element.MLModal.activeClass);
      });

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
     * `width` will be overriden. Other settings are ignored.
     */
  	this.show = function(id, modalOptions) {
      var modal = ML.El.$(id);

      self.hide();
      
      ML.El.addClass(modal, 'active');
      ML.El.removeClass(overlay, 'hidden');
      ML.El.addClass(document.documentElement, 'js-modal-opened');

      openedModal = modal;

      if (modalOptions) {
        modal.style.maxWidth = modalOptions.width + 'px';
      }

      ML.El.setStyles(modal, {
        marginLeft: '-' + (modal.offsetWidth / 2) + 'px'
      })
  	};

    /**
     * Hides all the modals.
     *
     * @example
     * modals.hide();
     */
  	this.hide = function() {
      if (openedModal) {
        ML.El.removeClass(openedModal, 'active');
      }

      ML.El.addClass(overlay, 'hidden');
      ML.El.removeClass(document.documentElement, 'js-modal-opened');
      openedModal = null;
    };
  };
})();