/* jshint browser: true, latedef: false */
/* global ML */

(function () {
  'use strict';

   /**
   * Tooltip
   * @constructor
   * @param {object} [settings] Configuration settings.
   * @param {string} [settings.selectorToggle=data-tooltip] The selector when mouseover shows the tooltip.
   * @param {string} [settings.selectorModal=tooltip] The selector for the tooltip.
   * @param {string} [settings.activeclass=active] The class to show the tooltip.
   * @param {number} [settings.width=600] The width of the tooltip.
   * @param {boolean} [settings.arrow=true] Shows an arrow.
   * @param {string} [settings.align=right] Where the tooltip should be positioned according to the link.
   * @example
   * var tooltips = new ML.Tooltip();
   * tooltips.init();
   */
  ML.Tooltip = function(settings) {
    /**
     * Tooltip defaults.
     * @type {object}
     * @private
     */
    var DEFAULTS = {
      selectorTip: 'data-tooltip',     // attribute
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

    var options = {};
    var tooltips = [];
    var tips = [];
    var self = this;

    /**
     * Initializes the tooltip class.
     */
    this.init = function() {
      var tags = ML.El._$('*');

      self.destroy();

      options = ML.extend(DEFAULTS, (ML.isUndef(settings, true)) ? {} : settings);

      if (ML.El.$C(options.selectorTooltip).length < 1) {
        throw new Error('There are no <div class="' + options.selectorTooltip + '" /> on the page.');
      } else {
        tooltips = ML.El.$C(options.selectorTooltip);
      }

      ML.loop(tags, function(element) {
        if (element.getAttribute(options.selectorTip) !== null) {
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
      ML.loop(tips, function(element) {
        ML.El.evt(element, 'mouseover', mouseOver);
        ML.El.evt(element, 'mouseout', mouseOut);
      });
    }

    /**
     * Handler bound to showing the tooltip.
     * @param {Event} e The Event object.
     * @private
     */
    function mouseOver(e) {
      var clicked = ML.El.clicked(e);
      self.show(clicked, ML.parObj(ML.El.data(clicked, 'tooltip')));
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
     * Destroys an instance of the tooltip class.
     */
    this.destroy = function() {
      // remove event listeners.
      ML.loop(tips, function(element) {
        element.removeEventListener('mouseover', mouseOver, false);
        element.removeEventListener('mouseout', mouseOut, false);
      });

      ML.loop(tooltips, function(element) {
        element.removeAttribute('style');
        ML.El.removeClass(element, ALIGNMENT_CLASSES.join(' '), true);
        ML.El.removeClass(element, element._options.activeClass);
      });

      options = null;
      tooltips = [];
      tips = [];
    };

    /**
     * Shows a tooltip.
     * @param {HTMLElement} tip The link when moused over to show tooltip.
     * @param {object} tooltipOptions Configuration settings to overwrite defaults.
     */
    this.show = function(tip, tooltipOptions) {
      var tooltip = updateTooltips(ML.El.$(tip.rel), ML.extend(options, tooltipOptions));
      var arrow = null;

      if (tooltip._options.arrow) {
        if (ML.El.$C('tooltip-arrow', tooltip).length > 0) {
          arrow = ML.El.$C('tooltip-arrow', tooltip);
        } else {
          arrow = ML.El.create('span', {'class': 'tooltip-arrow'});
          tooltip.appendChild(arrow);
        }
      }

      ML.El.addClass(tooltip, tooltip._options.activeClass);
      ML.El.removeClass(tooltip, ALIGNMENT_CLASSES.join(' '), true);
      ML.El.addClass(tooltip, 'tooltip-' + tooltip._options.align + '-align');

      tooltip.style.width = tooltip._options.width + 'px';
      setPosition(tip, tooltip, tooltip._options.align);
    };

    /**
     * Updates the tooltips array.
     * @param {HTMLElement} el The tooltip to search for in array.
     * @param {object} options The options for the tooltip.
     * @return {HTMLElement} The tooltip found in the array of modals.
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

          tooltips[i]._options = options;
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
     */
    this.hide = function() {
      ML.loop(tooltips, function(tooltip) {
        ML.El.removeClass(tooltip, tooltip._options.activeClass);
      });
    };

    /**
     * Returns all registered tooltips.
     * @return {array} All the registered modals with custom options, "_options".
     */
    this.getAll = function() {
      return tooltips;
    };
  };
})();