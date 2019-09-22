(function () {
  /**
   * Breakpoints custom events.
   * @private
   */
  var Breakpoints = {
    /**
     * Current breakpoint state.
     * @type {Object}
     */
    state: {},

    /**
     * Plugin was initialized.
     * @type {Boolean}
     */
    initialized: false,

    /**
     * Last breakpoint.
     * @type {Object}
     */
    lastState: {},

    /**
     * All breakpoints to watch.
     * @type {Array}
     */
    breakpoints: [{
      name: 'bp-0',
      size: 0
    }],
    
    /**
     * Initialization of Breakpoints event.
     */
    init: function() {
      var self = this;
      // Prevent multiple initializations. Since init is public.
      if (!this.initialized) {
        this.getBreakpoints();
        this.getState();
        this.bindEvents();

        // Trigger current bp on load.
        var timer = setTimeout(function() {
          ML.El.customEventTrigger('switch', self.state, window);
          clearTimeout(timer);
        }, 1);
      }
      
      this.initialized = true;
    },

    /**
     * Events bound to the window.
     */
    bindEvents: function() {
      var win = window;
      var windowResizeTimer = null;
      var self = this;

      ML.El.evt(win, 'resize', function() {
        windowResizeTimer = requestAnimationFrame(function() {
          ML.El.customEventTrigger('debounce.resize', {}, win);
          cancelAnimationFrame(windowResizeTimer);
        });
      });

      ML.El.evt(win, 'debounce.resize', function() {
        if (self.getState() === 'switch') {
          ML.El.customEventTrigger('switch', self.state, win);
        }
      });
    },
    
    /**
     * Gets the current breakpoint.
     * Sets the current and last state.
     * @return {String} Returns if the current width is same or it is a different breakpoint.
     */
    getState: function() {
      var _return = '';
      var bp = {};
      var winWidth = window.innerWidth;

      for (var i = 0, len = this.breakpoints.length; i < len; i++) {
        bp = this.breakpoints[i];

        if (bp.size === 0) {
          if (winWidth < this.breakpoints[i + 1].size) {
            this.state = {
              'name': 'bp-0',
              'size': 0
            };
          }
        } else {
          if (i + 1 === len) {
            if (winWidth >= bp.size) {
              this.state = {
                'name': this.breakpoints[i].name,
                'size': this.breakpoints[i].size
              };
            }
          } else {
            if (winWidth >= bp.size && winWidth < this.breakpoints[i + 1].size) {
              this.state = {
                'name': this.breakpoints[i].name,
                'size': this.breakpoints[i].size
              };
            }
          }
        }
      }

      if (this.state.name !== this.lastState.name) {
        _return = 'switch';
      } else {
        _return = 'same';
      }

      this.lastState = this.state;

      return _return;
    },

    /**
     * Sets the breakpoints array.
     * @param {Array} bps An array of breakpoint widths.
     */
    setBreakpoints: function(bps) {
      var allBps = this.breakpoints.map(function(item) {
        return item.size;
      }).concat(bps);
      var cleaned = allBps.filter(function(elem, pos) {
        return allBps.indexOf(elem) === pos;
      }).sort();

      this.breakpoints = cleaned.map(function(item) {
        return {
          name: 'bp-' + item,
          size: item
        };
      });
    },

    /**
     * Gets all the breakpoints in the user's stylesheets.
     */
    getBreakpoints: function() {
      var stylesheets = document.styleSheets;
      var query = null;
      var reg = /min-width: (\d*)/gm;
      var breakpoints = [];
      var replaceQuery = function() {
        breakpoints.push(Number(arguments[1]));
      };

      for (var ii = 0; ii < stylesheets.length; ii++) {
        for (var i = 0; i < stylesheets[ii].rules.length; i++) {
          if (stylesheets[ii].rules[i].media) {
            query = stylesheets[ii].rules[i].conditionText;
            query.replace(reg, replaceQuery);
          }
        }
      }
      
      this.setBreakpoints(breakpoints);
    }
  };

  /**
   * Loops through all the min-width breakpoints and stores them in an array.
   * Creates a custom event called `switch`, which gets fired when the breakpoint has changed.
   * The custom event provides the name of the breakpoint and width in pixels.
   * Each breakpoint name is in the following format: `bp-{number}`.
   * [See it in action + some notes! 😀](/breakpoints.html)
   * @namespace
   * 
   * @example <caption>Using the custom event.</caption>
   * ML.El.evt(window, 'switch', function(e) {
   *   console.log(e.detail.name); // name of the breakpoint
   *   console.log(e.detail.size); // width in px of breakpoint.
   * });
   */
  ML.Breakpoints = function() {
    Breakpoints.init();
  };

  ML.Breakpoints();
})();