/* jshint browser: true, latedef: false */
/* global ML */

(function () {
  'use strict';

  ML.Tooltip = function(settings) {
    /**
     * Tooltip defaults.
     * @type {object}
     * @private
     */
    var DEFAULTS = {
      selectorTooltip: 'tooltip',      // TODO: class name, can change to attr
      activeClass: 'active',
      width: 100,
      arrow: true,
      align: 'right',
      smart: false,
      delay: false,
      delayTime: 3000
    };

    /**
     * Tooltip alignment class names.
     * @type {array}
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
     * @type {array}
     * @private
     */
    var ALIGNS = [
      'left',
      'right',
      'top',
      'bottom'
    ];

    var selectorTip = 'data-tooltip';   // TODO: class name, can change to attr

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
      var tags = ML.El._$('*');

      self.destroy();

      options = ML.extend(DEFAULTS, (ML.isUndef(settings, true)) ? {} : settings);
      options.selectorTooltip = options.selectorTooltip.toString();
      options.width = parseInt(options.width);

      if (!ML.isUndef(options.activeClass, true) && ML.isString(options.activeClass)) {
        options.activeClass = options.activeClass.toString();
      }

      if (ML.El.$C(options.selectorTooltip).length < 1) {
        throw new Error('There are no <div class="' + options.selectorTooltip + '" /> on the page.');
      } else {
        tooltips = ML.El.$C(options.selectorTooltip);
      }

      if (!ML.isNum(options.width)) {
        options.width = DEFAULTS.width;
      }

      if (!ML.isNum(options.delayTime)) {
        options.delayTime = DEFAULTS.delayTime;
      }

      if (ML.isUndef(options.activeClass, true)) {
        options.activeClass = DEFAULTS.activeClass;
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

      if (!/^left$|^right$|^top$|^bottom$/.test(options.align.toString())) {
        options.align = DEFAULTS.align;
      }

      ML.loop(tags, function(element) {
        if (element.getAttribute(selectorTip) !== null) {
          if (ML.isUndef(element.rel, true)) {
            if (element.title) {
              element.rel = 'MLTooltip-' + new Date().getTime();
              createTooltip(element);
            } else {
              throw new Error('Element to show the tooltip must have a valid rel attribute.');
            }
          }

          tips.push(element);
        }
      });

      updateTooltips(null, options);
      bindEvents();
    };

    /**
     * Events bound to elements.
     * @private
     */
    function bindEvents() {
      if (tips.length > 0) {
        ML.loop(tips, function(element) {
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
      var tooltip = ML.El.$(ML.El.clicked(e).rel);

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
      var tooltip = ML.El.create('div', {id: link.rel, class: options.selectorTooltip});

      tooltip.innerHTML = '<div class="tooltip-content">' +
                            '<p>' + link.title + '</p>' +
                          '</div>';

      link.setAttribute('data-title', link.title);
      link.removeAttribute('title');

      document.body.appendChild(tooltip);
      tooltips = ML.El.$C(options.selectorTooltip);
    }

    /**
     * Destroys the tooltip init.
     *
     * @example
     * tooltips.destroy();
     */
    this.destroy = function() {
      ML.loop(tips, function(element) {
        element.removeEventListener('mouseover', mouseOver, false);
        element.removeEventListener('mouseout', mouseOut, false);

        if (ML.El.getAttr(element, 'data-title')) {
          element.title = ML.El.data(element, 'title');
          element.removeAttribute('data-title')

          ML.El.$(element.rel).parentNode.removeChild(ML.El.$(element.rel));
          element.removeAttribute('rel');
        }
      });

      ML.loop(tooltips, function(element) {
        element.removeAttribute('style');
        ML.El.removeClass(element, ALIGNMENT_CLASSES.join(' '), true);
        ML.El.removeClass(element, element.MLTooltip.activeClass);
      });

      options = null;
      tooltips = [];
      tips = [];
    };

    /**
     * Shows a tooltip.
     * Used when showing a tooltip without `data-tooltip`.
     * @param {string} id The id of the tooltip you want to display.
     * @param {object} tooltipOptions Configuration settings to overwrite defaults. Only
     * `activeClass`, `width`, `arrow` and `align` will be overriden. Other settings are ignored.
     *
     * @example
     * // Shows the tooltip with id of unique-id1 with a width of 300 pixels.
     * tooltips.show('unique-id1', {width: 400});
     */
    this.show = function(tip, tooltipOptions) {
      var tooltip = updateTooltips(ML.El.$(tip.rel), ML.extend(options, tooltipOptions));
      var arrow = null;
      var collides = {};
      var count = 0;

      if (tooltip.MLTooltip.arrow) {
        if (ML.El.$C('tooltip-arrow', tooltip).length > 0) {
          arrow = ML.El.$C('tooltip-arrow', tooltip);
        } else {
          arrow = ML.El.create('span', {'class': 'tooltip-arrow'});
          tooltip.appendChild(arrow);
        }
      }

      ML.El.addClass(tooltip, tooltip.MLTooltip.activeClass);
      tooltip.style.width = tooltip.MLTooltip.width + 'px';

      // TODO: Combining alignment and width setting into one function
      ML.El.removeClass(tooltip, ALIGNMENT_CLASSES.join(' '), true);
      ML.El.addClass(tooltip, 'tooltip-' + tooltip.MLTooltip.align + '-align');

      setPosition(tip, tooltip, tooltip.MLTooltip.align);

      collides = collide('right', tooltip) || collide('left', tooltip) ||
        collide('top', tooltip) || collide('bottom', tooltip);
      count = 0;

      if (tooltip.MLTooltip.smart) {
        while (collides) {
          ML.El.removeClass(tooltip, ALIGNMENT_CLASSES.join(' '), true);
          ML.El.addClass(tooltip, 'tooltip-' + ALIGNS[count] + '-align');

          setPosition(tip, tooltip, ALIGNS[count]);

          collides = collide('right', tooltip) || collide('left', tooltip) ||
            collide('top', tooltip) || collide('bottom', tooltip);
          count++;

          if (count > 4) {
            tooltip.style.width = DEFAULTS.width + 'px';
            
            ML.El.removeClass(tooltip, ALIGNMENT_CLASSES.join(' '), true);
            ML.El.addClass(tooltip, 'tooltip-' + tooltip.MLTooltip.align + '-align');
            
            setPosition(tip, tooltip, tooltip.MLTooltip.align);
            
            collides = collide('right', tooltip) || collide('left', tooltip) ||
              collide('top', tooltip) || collide('bottom', tooltip);
            count = 0;
          }
        }
      }   
    };

    /**
     * When the tooltip element collides with the window.
     * @param {string} side The side the tooltip coliddes with the window.
     * @param {HTMLElement} el The tooltip element.
     * @return {boolean}
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
     * Updates the tooltips array.
     * @param {HTMLElement} el The tooltip to search for in array.
     * @param {object} options The options for the tooltip.
     * @return {HTMLElement} The tooltip found in the array of tooltips.
     * @private
     */
    function updateTooltips(el, options) {
      var tooltip = {};

      for (var i = 0, len = tooltips.length; i < len; i++) {
        if (el === null || el.id === tooltips[i].id) {
          tooltip = tooltips[i];

          if (!ML.isNum(options.width)) {
            options.width = DEFAULTS.width;
          }

          if (!ML.isBool(options.arrow)) {
            options.arrow = DEFAULTS.arrow;
          }

          if (!/^left$|^right$|^top$|^bottom$/.test(options.align)) {
            options.align = DEFAULTS.align;
          }

          if (ML.isUndef(options.activeClass, true)) {
            options.activeClass = DEFAULTS.activeClass;
          }

          tooltips[i].MLTooltip = options;
        }
      }

      return tooltip;
    }

    /**
     * Sets the position of the tooltip
     * @param {HTMLElement} tip The link when moused over to show the tooltip.
     * @param {HTMLElement} tooltip The tooltip element.
     * @param {string} align Where to position the tooltip element.
     * @private
     */
    function setPosition(tip, tooltip, align) {
      var tipDimens = ML.El.dimens(tip);
      var tooltipDimens = ML.El.dimens(tooltip);

      switch (align) {
        case 'right':
          ML.El.setStyles(tooltip, {
            top: Math.abs((tooltipDimens.height / 2) - tipDimens.y - tipDimens.height) + 'px',
            left: tipDimens.x  + tipDimens.width + 'px'
          });
          break;

        case 'left':
          ML.El.setStyles(tooltip, {
            top: Math.abs((tooltipDimens.height / 2) - tipDimens.y - tipDimens.height) + 'px',
            left: tipDimens.x - tooltip.offsetWidth + 'px'
          });
          break;

        case 'top':
          ML.El.setStyles(tooltip, {
            top: tipDimens.y - tooltipDimens.height + 'px',
            left: tipDimens.x - (tooltip.offsetWidth / 2) + (tipDimens.width / 2) + 'px'
          });
          break;

        case 'bottom':
          ML.El.setStyles(tooltip, {
            top: tipDimens.y + tipDimens.height + 'px',
            left: tipDimens.x - (tooltip.offsetWidth / 2) + (tipDimens.width / 2) + 'px'
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
      ML.loop(tooltips, function(tooltip) {
        ML.El.removeClass(tooltip, tooltip.MLTooltip.activeClass);
      });
    };
  };
})();