(function () {
  /**
   * * A message that appears when a cursor is positioned over an element
   * * Each tooltip should have a unique `id` attribute to match the element's `rel` attribute.
   * * Nested tooltips are not supported.
   * * You can show tooltips via `data-tooltop` or JavaScript.
   * * Valid align options are: `right`, `left`, `top` and `bottom` to the element 
   * activating the tooltip overlay.
   * * When setting `smart: true`, the tooltip will only detect collision with `window`.
   * * Custom tooltip based on `title` attribute.
   * * Every tooltip element gets `MLToolip` added to the element.
   * * You can listen to if a tooltip is opened or closed via custom events: `tooltip.opened` and
   * `tooltip.closed`. See example below.
   *
   * @example <caption>Sample markup of tooltip HTML.</caption> {@lang xml}
   * <div class="tooltip" id="unique-id1">
   *   <div class="tooltip-content">
   *     <h1 class="tight">Hello! I am a tooltip</h1>
   *     <p class="tight">Im some text about the tooltip.</p>
   *   </div>
   * </div>
   *
   * @example <caption>You can show tooltips via data attribute, <code>data-tooltip="width:200:align:bottom"</code>.
   * The only lines of JavaScript would be two lines. The <code>rel</code> attribute needs to equal
   * the ID of the tooltip HTML element.</caption> {@lang xml}
   * <a href="#" rel="unique-id1" data-tooltip="width:200:align:bottom">open modal</a>
   *
   * // Only JavaScript needed:
   * <script>
   *   var tooltips = new ML.Tooltip({
   *     arrow: false, // Global configuration.
   *     delay: true
   *   });
   *   
   *   tooltips.init();
   * </script>
   *
   * // Other javascript files go here.
   *
   * @example <caption>The tooltip can be triggered via JavaScript instead of or in addition
   * to <code>data-tooltip</code></caption>
   * // Will show the tooltip HTML with id of unique-id1 with a width of `50 pixels and will
   * // add the class name 'show me' to the tooltip element.
   * tooltips.show('unique-id1', {width: `50, activeClass: 'show-me'});
   *
   * @example <caption>Dynamic tooltip that shows a tooltip with the content "I am a tooltip" inside.</caption> {@lang xml}
   * <a href="#" data-tooltip="smart:true:delay:true" title="I am a tooltip">tooltip link</a>
   *
   * @example <caption>Using custom events to identify tooltip opened and/or closed.</caption>
   * document.addEventListener('tooltip.opened', function(event) {
   *    console.log(event.detail);
   * });
   * 
   * document.addEventListener('tooltip.closed', function(event) {
   *    console.log(event.detail);
   * });
   * 
   * @param {Object} [settings] Configuration settings.
   * @param {Number} [settings.width=100] The width of the tooltip.
   * @param {String} [settings.align=right] Where to align the tooltip.
   * @param {Boolean} [settings.smart=false] If the tooltip should change position or width
   * to not overlap the window.
   * @param {Boolean} [settings.delay=false] Delay the tooltip going away on `mouseout`.
   * @param {Number} [settings.delayTime=3000] Duration to keep the tooltip visible 
   * when setting `delay: true`
   * @constructor
   */
  ML.Tooltip = function(settings) {
    /**
     * Tooltip defaults.
     * @type {Object}
     * @private
     */
    var DEFAULTS = {
      width: 150,
      align: 'right',
      smart: false,
      delay: false,
      delayTime: 3000
    };

    /**
     * Tooltip alignment class names.
     * @type {Array}
     * @private
     */
    var ALIGNMENT_CLASSES = [
      'tooltip-left-align',
      'tooltip-right-align',
      'tooltip-top-align',
      'tooltip-bottom-align'
    ];

    /**
     * Alignment names
     * @type {Array}
     * @private
     */
    var ALIGNS = [
      'left',
      'right',
      'top',
      'bottom'
    ];

    var options = {};
    var tooltips = [];
    var tips = [];
    var self = this;
    var delayTimer = null;

    /**
     * Initializes the tooltip class.
     *
     * @example
     * tooltips.init();
     */
    this.init = function() {
      self.destroy();

      tips = ML.nodeArr(ML.El.$q('[data-tooltip]'));
      options = validateOptions();
      
      tips.map(function(tip) {
        if (ML.isUndef(tip.rel, true)) {
          if (tip.title) {
            tip.rel = 'MLTooltip-' + new Date().getTime();
            createTooltip(tip);
          } else {
            throw new Error('Element to show the tooltip must have a valid rel attribute.');
          }
        }
      });

      tooltips = ML.nodeArr(ML.El.$q('.tooltip'));

      if (tooltips.length < 1) {
        throw new Error('There are no tooltips on the page.');
      }

      bindEvents();
    };

    // @TODO: comment
    function validateOptions() {
      options = ML.extend(DEFAULTS, (ML.isUndef(settings, true)) ? {} : settings);
      options.width = parseInt(options.width);
      options.arrow = ML.bool(options.arrow);
      options.smart = ML.bool(options.smart);
      options.delay = ML.bool(options.delay);

      if (!ML.isNum(options.width)) {
        options.width = DEFAULTS.width;
      }

      if (!ML.isNum(options.delayTime)) {
        options.delayTime = DEFAULTS.delayTime;
      }

      if (!ML.isBool(options.arrow)) {
        options.arrow = DEFAULTS.arrow;
      }

      if (!ML.isBool(options.smart)) {
        options.smart = DEFAULTS.smart;
      }

      if (!ML.isBool(options.delay)) {
        options.delay = DEFAULTS.delay;
      }

      if (options.align.includes(ALIGNS)) {
        options.align = DEFAULTS.align;
      }

      return options;
    }

    /**
     * Events bound to elements.
     * @private
     */
    function bindEvents() {
      if (tips.length > 0) {
        tips.forEach(function(element) {
          ML.El.evt(element, 'mouseover', mouseOver);
          ML.El.evt(element, 'mouseout', mouseOut);
        });
      }
    }

    /**
     * Handler bound to showing the tooltip.
     * @param {Event} e The Event object.
     * @private
     */
    function mouseOver(e) {
      var clicked = ML.El.clicked(e);

      clearTimeout(delayTimer);
      self.show(clicked, ML.parObj(ML.El.data(clicked, 'tooltip')));
    }

    /**
     * Handler bound to hiding the tooltip.
     * @param {Event} e The Event object.
     * @private
     */
    function mouseOut(e) {
      var tooltip = ML.El.$q('#' + ML.El.clicked(e).rel);

      if (tooltip.MLTooltip.delay) {
        delayTimer = setTimeout(function() {
          self.hide();
          clearTimeout(delayTimer);
        }, tooltip.MLTooltip.delayTime);
      } else {
        self.hide();
      }
    }

    /**
     * Creates a tooltip element for a dynamic tooltip.
     * @param {HTMLElement} link Element to trigger tooltip.
     * @private
     */
    function createTooltip(link) {
      var tooltip = ML.El.create('div', {id: link.rel, 'class': 'tooltip'});

      tooltip.innerHTML = '<div class="tooltip-content">' +
                            '<p>' + link.title + '</p>' +
                          '</div>';

      link.setAttribute('data-title', link.title);
      link.removeAttribute('title');

      document.body.appendChild(tooltip);
    }

    /**
     * Destroys the tooltip init.
     *
     * @example
     * tooltips.destroy();
     */
    this.destroy = function() {
      tips.forEach(function(element) {
        element.removeEventListener('mouseover', mouseOver, false);
        element.removeEventListener('mouseout', mouseOut, false);

        if (ML.El.getAttr(element, 'data-title')) {
          element.title = ML.El.data(element, 'title');
          element.removeAttribute('data-title');

          ML.El.$q('#' + element.rel).parentNode.removeChild(ML.El.$q('#' + element.rel));
          element.removeAttribute('rel');
        }
      });

      Array.prototype.slice.call(tooltips).map(function(element) {
        element.removeAttribute('style');
        ML.El.removeClass(element, ALIGNMENT_CLASSES.join(' '), true);
        ML.El.removeClass(element, 'active');
      });

      options = null;
      tooltips = [];
      tips = [];
    };

    /**
     * Shows a tooltip.
     * Used when showing a tooltip without `data-tooltip`.
     * @param {String} id The id of the tooltip you want to display.
     * @param {Object} tooltipOptions Configuration settings to overwrite defaults. Only
     * `activeClass`, `width`, `arrow` and `align` will be overriden. Other settings are ignored.
     *
     * @example
     * // Shows the tooltip with id of unique-id1 with a width of 300 pixels.
     * tooltips.show('unique-id1', {width: 400});
     */
    this.show = function(tip, tooltipOptions) {
      var tooltip = ML.El.$q('#' + tip.rel);
      var collides = {};
      var count = 0;
      var collidesAll = function(tooltip) {
        return collide('right', tooltip) || collide('left', tooltip) ||
          collide('top', tooltip) || collide('bottom', tooltip);
      };

      tooltip.MLTooltip = ML.extend(DEFAULTS, tooltipOptions);
      ML.El.addClass(tooltip, 'active');
      
      setDimens(tip, tooltip, {align: 'ml', width: 'ml'});

      if (tooltip.MLTooltip.smart) {
        collides = collidesAll(tooltip);
        count = 0;

        while (collides) {
          setDimens(tip, tooltip, {align: ALIGNS[count], width: false});
          collides = collidesAll(tooltip);
          count++;

          if (count > 4) {
            setDimens(tip, tooltip, {align: 'ml', width: DEFAULTS.width});
            collides = collidesAll(tooltip);
            count = 0;
          }
        }
      }
    };

    // @TODO: comment
    function setDimens(tip, tooltip, obj) {
      var align = (obj.align === 'ml') ? tooltip.MLTooltip.align : obj.align;
      var width = (obj.width === 'ml') ? tooltip.MLTooltip.width : obj.width;

      if (obj.width) {
        tooltip.style.width = width + 'px';
      }

      ML.El.removeClass(tooltip, ALIGNMENT_CLASSES.join(' '), true);
      ML.El.addClass(tooltip, 'tooltip-' + align + '-align');
      setPosition(tip, tooltip, align);
      ML.El.customEventTrigger('tooltip.opened', {
        tooltip: tooltip, 
        options: tooltip.MLTooltip
      });
    }

    /**
     * Returns `true` or `false` if tooltip element collides with the window.
     * @param {String} side The side the tooltip collides with the window.
     * @param {HTMLElement} el The tooltip element.
     * @return {Boolean}
     * @private
     */
    function collide(side, el) {
      var windowDimen = {width: ML.windowDimen().w, height: ML.windowDimen().h, x: 0, y: 0};
      var sides = {
        right: ML.extend(windowDimen, {x: -ML.windowDimen().w}),
        left: ML.extend(windowDimen, {x: ML.windowDimen().w}),
        bottom: ML.extend(windowDimen, {y: ML.windowDimen().h}),
        top: ML.extend(windowDimen, {y: -ML.windowDimen().h})
      };

      return ML.El.collides(sides[side], el);
    }

    /**
     * Sets the position of the tooltip
     * @param {HTMLElement} tip The link when moused over to show the tooltip.
     * @param {HTMLElement} tooltip The tooltip element.
     * @param {String} align Where to position the tooltip element.
     * @private
     */
    function setPosition(tip, tooltip, align) {
      var tipDimens = ML.El.dimens(tip);
      var tooltipDimens = ML.El.dimens(tooltip);
      var arrowSize = parseInt(
        window.getComputedStyle(tooltip, '::after')
          .getPropertyValue('width')
          .replace('px', '')
      );

      switch (align) {
        case 'left':
          ML.El.setStyles(tooltip, {
            top: Math.abs((tooltipDimens.height / 2) - tipDimens.y - tipDimens.height) - 7 + 'px',
            left: tipDimens.x - tooltip.offsetWidth - arrowSize + 'px'
          });
          break;

        case 'top':
          ML.El.setStyles(tooltip, {
            top: tipDimens.y - tooltipDimens.height - arrowSize + 'px',
            left: tipDimens.x - (tooltip.offsetWidth / 2) + (tipDimens.width / 2) + 'px'
          });
          break;

        case 'bottom':
          ML.El.setStyles(tooltip, {
            top: tipDimens.y + tipDimens.height + arrowSize + 'px',
            left: tipDimens.x - (tooltip.offsetWidth / 2) + (tipDimens.width / 2) + 'px'
          });
          break;
        
        default:
          ML.El.setStyles(tooltip, {
            top: Math.abs((tooltipDimens.height / 2) - tipDimens.y - tipDimens.height) - arrowSize + 'px',
            left: tipDimens.x  + tipDimens.width + arrowSize + 'px'
          });
          break;
      }
    }

    /**
     * Hides all the tooltips.
     *
     * @example
     * tooltips.hide();
     */
    this.hide = function() {
      tooltips.map(function(tooltip) {
        if (ML.El.hasClass(tooltip, 'active')) {
          ML.El.customEventTrigger('tooltip.closed', {
            tooltip: tooltip, 
            options: tooltip.MLTooltip
          });
          ML.El.removeClass(tooltip, 'active');
        }
      });
    };
  };
})();