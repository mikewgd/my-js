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
   * * When a modal is opened the class name `js-modal-opened` is appended to the `<html>`.
   * * You can show modals via `data-modal` or JavaScript.
   * * You can listen to if a modal is opened or closed via custom events: `modal.opened`, 
   * `modal.closed` and `modal.destroyed`. See example below.
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
   * @example <caption>Using custom events to identify modal opened and/or closed.</caption>
   * document.addEventListener('modal.opened', function(event) {
   *    console.log('Modal is opened');
   *    console.log(event.detail.modal);
   * });
   * 
   * document.addEventListener('modal.closed', function(event) {
   *    console.log('Modal is closed');
   *    console.log(event.detail.modal);
   * });
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
   * @constructor
   */
  ML.Modal = function() {
    var modalToggle = null;
    var modals = null;
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
      self.destroy();

      modalToggle = ML.nodeArr(ML.El.$q('[data-modal]'));
      modals = ML.nodeArr(ML.El.$q('.modal'));

      if (modals.length < 1) {
        throw new Error('There are no modals on the page.');
      }

      overlay = ML.El.create('div', {'class': 'modal-overlay hidden'});
      document.body.appendChild(overlay);
      bindEvents();
    };

    /**
     * Events bound to elements.
     * @private
     */
    function bindEvents() {
      modalToggle.map(function(element) {
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
      if (ML.El.hasClass(clicked, 'modal-close') || ML.El.hasClass(clicked, 'modal-overlay')) {
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

      if (modalToggle) {
        modalToggle.map(function(element) {
          ML.El.removeEvt(element, 'click', toggleClick);
        });
      }

      ML.El.removeEvt(document, 'click', closeClick);

      if (overlay) {
        document.body.removeChild(overlay);
      }

      if (modals) {
        modals.map(function(element) {
          element.removeAttribute('style');
          ML.El.removeClass(element, 'active');
        });
      }

      ML.El.customEventTrigger('modal.destroyed', {modal: openedModal});
      overlay = null;
      openedModal = null;
      modals = [];
    };

    /**
     * Shows a modal.
     * Used when showing modal without `data-modal`.
     * @param {String} id The id of the modal you want to display.
     * @param {Object} modalOptions Configuration settings to overwrite defaults. Only
     * `width` will be overriden. Other settings are ignored.
     *
     * @example
     * // Shows modal element with id of unique-id3 with a width of 400 pixels.
     * modals.show('unique-id3', {width: 400});
     */
  	this.show = function(id, modalOptions) {
      var modal = ML.El.$q('#' + id);

      self.hide();
      
      ML.El.addClass(modal, 'active');
      ML.El.removeClass(overlay, 'hidden');
      ML.El.addClass(document.documentElement, 'js-modal-opened');

      openedModal = modal;
      ML.El.customEventTrigger('modal.opened', {modal: openedModal});

      if (modalOptions) {
        modal.style.maxWidth = modalOptions.width + 'px';
      }
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
        ML.El.customEventTrigger('modal.closed', {modal: openedModal});
      }

      ML.El.addClass(overlay, 'hidden');
      ML.El.removeClass(document.documentElement, 'js-modal-opened');
      openedModal = null;
    };
  };
})();