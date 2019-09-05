(function() {
  /**
   * Dispatches the custom event.
   * @param {String} name The name of the custom event.
   */
  function eventDispatcher(name) {
    document.dispatchEvent(name);
  }

  /**
   * Handles the resize debounce.
   */
  function ResizeDebouncedEvent() {
    var RESIZE_DEBOUNCE_EVENT = new CustomEvent('resize.debounce');
    var timeout = null;
    var debounced = false;

    ML.El.evt(window, 'resize', function() {
      if (!debounced) {
        eventDispatcher(RESIZE_DEBOUNCE_EVENT);
        debounced = true;
        timeout = requestAnimationFrame(function() {
          debounced = false;
          cancelAnimationFrame(timeout);
        });
      } 
    }, false);
  }

  /**
   * Handles the scroll up / down events.
   */
  function ScrollUpDownEvent() {
    var lastScrollTop = 0;
    var SCROLL_UP_EVENT = new CustomEvent('scroll.up');
    var SCROLL_DOWN_EVENT = new CustomEvent('scroll.down');

    ML.El.evt(document, 'scroll', function() {
      var currScroll = window.pageYOffset;

      if (currScroll < lastScrollTop) {
        eventDispatcher(SCROLL_UP_EVENT);
      } else {
        eventDispatcher(SCROLL_DOWN_EVENT);
      }

      lastScrollTop = currScroll;
    });
  }

  ResizeDebouncedEvent();
  ScrollUpDownEvent();
})();