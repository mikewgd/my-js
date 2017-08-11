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
  	BODY: 'modal-body'
  };

	var modal = null;
	var modalBody = null;
	var width = settings.width || DEFAULTS.WIDTH;
	var height = settings.height || DEFAULTS.HEIGHT;
	var title = settings.title || DEFAULTS.TITLE;

	this.init = function() {
    modal = ML.$(el);
		ML.El.clean(modalOverlay);
		modalBody = modal.childNodes[0];

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
		height = (height === 'auto') ? modalBody.offsetHeight : height;

    ML.removeClass(modal, 'hidden');
    modalBody.removeAttribute('style');

    ML.El.setStyles(modalBody, {
    	'width': width + 'px',
    	'height': (height === 'auto') ? 'auto' : height + 'px',
    	'marginTop': '-' + (height / 2) + 'px',
    	'marginLeft': '-' + (+.offsetWidth / 2) + 'px'
    });
	};

	this.hide = function() {};
};

(function() {
  var modalLink = ML._$('*');
  var modal = null;
  var settings = {};

  for (var i = 0; i < modalLink.length; i++) {
    if (ML.El.data(modalLink[i], 'modal') !== null) {
      settings = ML.parObj(ML.El.data(modalLink[i], 'modal'));
      modal = new ML.Modal(modalLink[i], settings);
      modal.init();
    }
  }
})();
