/* jshint browser: true, latedef: false */
/* global ML */


// use this https://scotch.io/tutorials/building-your-own-javascript-modal-plugin
// for inspiration. define a template and have content injected inside.
// to transfer events need to keep track of them using ML.evtHandler.

ML.Modal = function(settings) {
	'use strict';

	var DEFAULTS = {
    maxWidth: 600,
    minWidth: 280,
    closeButton: true,
    autoOpen: false
  };

  var CLASSNAMES = {
  	el: 'modal',
  	body: 'modal-body',
    close: 'modal-close'
  };

	var modal = null;
	var width = settings.width || DEFAULTS.WIDTH;
	var height = settings.height || DEFAULTS.HEIGHT;
	var title = settings.title || DEFAULTS.TITLE;

	this.init = function() {
    modal = ML.$(el);
		modalBody = modal.childNodes[0];

    create();
		// bindEvents();
	};

  function create() {
  	var modalBody = ML.El.create('div', {'class': 'modal-body'});
  	var modalHeader = ML.El.create('div', {'class': 'modal-header'});
  	var modalContent = ML.El.create('div', {'class': 'modal-content'});
  	var modalCloseButton = null;
  	var modalHeaderTitle = null;
  	modal = ML.El.create('div', {
  		'class': 'modal hidden', 
  		'id': 'ml-modal-' + (new Date().getTime())
  	});
  }

	function bindEvents() {
    /* jshint validthis: true */
		var self = this;

    ML.El.evt(document, 'click', function(e) {
    	e.preventDefault();
      var clicked = ML.El.clicked(e);
      if (ML.hasClass(clicked) ||
      	ML.hasClass(clicked, CLASSNAMES.EL)) {
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
    	'marginLeft': '-' + (modalBody.offsetWidth / 2) + 'px'
    });
	};

	this.hide = function() {

  };
};