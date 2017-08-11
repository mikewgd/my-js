/* jshint browser: true, latedef: false */
/* global ML */

'use strict';

ML.Modal = function(el, settings) {
	var DEFAULTS = {
    WIDTH: 600,
    HEIGHT: 'auto',
    TITLE: ''
  };

  var CLASSNAMES = {
  	TITLE: 'modal-header-title',
  	CLOSE: 'modal-close',
  	EL: 'modal',
  	OVERLAY: 'modal-overlay'
  };

	var modalOverlay = null;
	var modal = null;
	var width = settings.width || DEFAULTS.WIDTH;
	var height = settings.height || DEFAULTS.HEIGHT;
	var title = settings.title || DEFAULTS.TITLE;

	this.init = function() {
    modalOverlay = ML.$(el);
		ML.El.clean(modalOverlay);
		modal = modalOverlay.childNodes[0];

		bindEvents();
	};

	function bindEvents() {
    /* jshint validthis: true */
		var self = this;

    /*ML.El.evt(window, 'resize', function(e) {
    	resize();
    });*/

    ML.El.evt(document, 'click', function(e) {
    	e.preventDefault();
      var clicked = ML.El.clicked(e);
      if (ML.hasClass(clicked, CLASSNAMES.CLOSE) ||
      	ML.hasClass(clicked, CLASSNAMES.OVERLAY)) {
        self.hide();
      }
    });
	}

	this.show = function() {
		height = (height === 'auto') ? modal.offsetHeight : height;

    ML.removeClass(modalOverlay, 'hidden');
    modal.removeAttribute('style');

    ML.El.styl(modal, {
    	'width': width + 'px',
    	'height': (height === 'auto') ? 'auto' : height + 'px',
    	'marginTop': '-' + (height / 2) + 'px',
    	'marginLeft': '-' + (modal.offsetWidth / 2) + 'px'
    });
	};

	this.hide = function() {};
};

(function() {

})();
