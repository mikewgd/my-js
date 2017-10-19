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
      selectorTooltip: 'tooltip',      // class name, can change to attr
      activeClass: 'active',
      width: 100,
      arrow: true,
      align: 'right'
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

    var selectorTip = 'data-tooltip';

    var options = {};
    var tooltips = [];
    var tips = [];
    var self = this;

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

      if (ML.isUndef(options.activeClass, true)) {
        options.activeClass = DEFAULTS.activeClass;
      }

      if (!ML.isBool(options.arrow)) {
        options.arrow = DEFAULTS.arrow;
      }

      if (!/^left$|^right$|^top$|^bottom$/.test(options.align.toString())) {
        options.align = DEFAULTS.align;
      }

      ML.loop(tags, function(element) {
        if (element.getAttribute(selectorTip) !== null) {
          tips.push(element);
        }
      });

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
      self.show(ML.El.clicked(e).rel, ML.parObj(ML.El.data(clicked, 'tooltip')));
    }

    /**
     * Handler bound to hiding the tooltip.
     * @param {Event} e The Event object.
     * @private
     */
    function mouseOut(e) {
      self.hide();
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
     * // Shows modal element with id of unique-id1 with a width of 300 pixels.
     * tooltips.show('unique-id1', {width: 400});
     */
    this.show = function(tip, tooltipOptions) {
      var tooltip = updateTooltips(ML.El.$(tip.rel), ML.extend(options, tooltipOptions));
      var arrow = null;

      if (tooltip.MLTooltip.arrow) {
        if (ML.El.$C('tooltip-arrow', tooltip).length > 0) {
          arrow = ML.El.$C('tooltip-arrow', tooltip);
        } else {
          arrow = ML.El.create('span', {'class': 'tooltip-arrow'});
          tooltip.appendChild(arrow);
        }
      }

      ML.El.addClass(tooltip, tooltip.MLTooltip.activeClass);
      ML.El.removeClass(tooltip, ALIGNMENT_CLASSES.join(' '), true);
      ML.El.addClass(tooltip, 'tooltip-' + tooltip.MLTooltip.align + '-align');

      tooltip.style.width = tooltip.MLTooltip.width + 'px';
      setPosition(tip, tooltip, tooltip.MLTooltip.align);
    };

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
        if (el.id === tooltips[i].id) {
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