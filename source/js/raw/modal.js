/* jshint browser: true, latedef: false */
/* global ML */

ML.Modal = function(settings) {
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

  /**
   * [init description]
   * @return {[type]} [description]
   */
  this.init = function() {
    var tags = ML._$('*');

    self.destroy();

    options = ML.extend(DEFAULTS, settings);
    overlay = ML.El.create('div', {'class': 'modal-overlay hidden'});
    modals = ML.$C(options.selectorModal);

    ML.loop(tags, function(element) {
      if (element.getAttribute(options.selectorToggle) !== null) {
        toggles.push(element);
      }
    });

    document.body.appendChild(overlay);
    bindEvents();
  };

  /**
   * [bindEvents description]
   * @return {[type]} [description]
   */
  function bindEvents() {
    ML.loop(toggles, function(element) {
      ML.El.evt(element, 'click', toggleClick);
    });

    ML.El.evt(document, 'click', closeClick);
  }

  /**
   * [closeClick description]
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  function closeClick(e) {
    e.preventDefault();
    var clicked = ML.El.clicked(e);
    if (ML.hasClass(clicked, options.selectorClose) ||
      ML.hasClass(clicked, 'modal-overlay')) {
      self.hide();
    }
  }

  *
   * [toggleClick description]
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   
  function toggleClick(e) {
    e.preventDefault();
    self.show(ML.El.clicked(e).rel, ML.parObj(ML.El.data(ML.El.clicked(e), 'modal')));
  }

  /**
   * [destroy description]
   * @return {[type]} [description]
   */
  this.destroy = function() {
    ML.loop(toggles, function(element) {
      ML.El.evt(element, 'click', toggleClick);
      element.removeEventListener('click', toggleClick, false);
    });

    document.removeEventListener('click', closeClick, false);

    if (ML.$C('overlay').length > 0) {
      document.body.removeChild(overlay);
    }

    options = null;
    overlay = null;
    modals = [];
    toggles = [];
  };

  /**
   * [show description]
   * @param  {[type]} id           [description]
   * @param  {[type]} modalOptions [description]
   * @return {[type]}              [description]
   */
	this.show = function(id, modalOptions) {
    var modal = ML.$(id);
    options = ML.extend(options, modalOptions);

    ML.addClass(modal, options.activeClass);
    ML.removeClass(overlay, 'hidden');

    ML.El.setStyles(modal, {
    	'maxWidth': options.width + 'px',
    	'marginTop': '-' + (modal.offsetHeight / 2) + 'px',
    	'marginLeft': '-' + (options.width / 2) + 'px'
    });
	};

  /**
   * [hide description]
   * @return {[type]} [description]
   */
	this.hide = function() {
    ML.loop(modals, function(element) {
      ML.removeClass(element, options.activeClass);
    });

    ML.addClass(overlay, 'hidden');
  };
};