ML.Modal = function(el, settings) {
	var DEFAULTS = {
    WIDTH: 0,
    HEIGHT: 0,
    TITLE: ''
  };

  var CLASSNAMES = {
  	TITLE: 'modal-header-title',
  	CLOSE: 'modal-close',
  	EL: 'modal',
  	OVERLAY: 'modal-overlay'
  };

	var modal = null;
	var width = 0;
	var height = 0;
	var title = '';
	var position = {
		top: 0,
		left: 0;
	}

	this.init = function() {
    if (ML.$(el) === undefined) {
    	throw new Error('There must be a unique identifier to reference the modal.');
    }

		modal = ML.$(el);

		ML.El.clean(modal);
		bindEvents();
	};

	function bindEvents() {
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
		height = (self.height == 'auto') ? modal.offsetHeight : self.height;
		var modalParentTag = modal.parentNode.tagName.toLowerCase();
		var leftPos;
		var topPos;

    ML.removeClass(modal, 'hidden');
    modal.removeAttribute('style');

    modal.style.height = (self.height == 'auto') ? 'auto' : self.height.toString()+'px';
    modal.style.width = self.width.toString()+'px';

    ML.El.styl(overlay, {display:'block', visibility:'visible', 'height': ML.docDimen().h+'px'});
    //ML.El.styl(modal, {'width':self.width+'px', 'height':height});
    ML.El.styl(modal, {'marginTop': '-'+height/2+'px', 'marginLeft': '-'+modal.offsetWidth/2+'px'});
    
    // Parent tag is not body get dimensions off window
    if (modalParentTag == 'body') {
      
    } else {
      var center = ML.El.center(modal);
      topPos = center.y;
      leftPos = center.x;
    }
   
	};

	this.hide = function() {};
};

/**
* @class ModalHandler
* @namespace ML
* Handles calling the Modal class.
*/
ML.ModalHandler = function () {
  var tags = ML._$('*', document.body);
  
  for (var i=0; i<tags.length; i++) {
    var attr = ML.El.data, rel = 'reg';
    
    if (attr(tags[i], 'modal') !== null) {
      if (tags[i].rel == 'iframe' || tags[i].rel == 'ajax') {
        var rel = tags[i].rel; // Store rel attribute
        tags[i].rel = 'mlModal-'+rel+'-'+i;
      } 
      
      var options = ML.ParObj({elem: ML.El.data(tags[i], 'modal')});
      options.type = rel; // add to object
      
      var m = new ML.Modal(tags[i],  options);
      m.init();
    }
  }
};

/**
* @class Modal
* @namespace ML
*
* @property {Number} width - width for modal.
* @property {Number} height - height for modal.
* @property {String} modalHeader - the modal header to be used when making an iframe.
* @property {HTMLElement} link - link element that activates the modal.
* @property {HTMLElement} el - the modal element.
* @property {Boolean} dynamic - whether to create a modal on the fly.
* @property {String} template - html structure for a modal.
*/
ML.Modal = function(modLink, settings) {
  var defaults = {width: 600, height: 'auto', header: 'Modal Header'};
  
  return {
    width: parseInt(settings.width) || defaults.width,
    height: parseInt(settings.height) || defaults.height,
    modalHeader: settings.header || defaults.header,
    link: modLink,
    el: null,
    dynamic: (settings.type !== 'reg') ? true : false,
    template: '<div class="header">{{modalHeader}}</div><div class="content">{{contents}}</div>',
    
    /**
    * @function init
    * Initialization of functions. Also creates the dynamic modal.
    */
    init: function () {     
      // if no rel attribute return, modal will not work.
      if (this.link.rel == null || this.link.rel == undefined) {return false;}
      
      // Creates a modal if it is dynamic, ie iframe or ajax
      if (this.dynamic) this.create(this.link);
              
      this.el = ML.$(this.link.rel);
      
      ML.El.clean(this.el);
      this.createOverlay();
      this.bindEvents();
    },
    
    /**
    * @function bindEvents
    * Binds events to the link (modal activation).
    */
    bindEvents: function() {
      var self = this,
        overlay = ML.$('darkness'),
        close = ML.$C('.close');
      
      ML.El.evt(self.link, 'click', function(e) {
        self.show();
        return false;
      });

      ML.El.evt(overlay, 'click', function(e) {self.hide();});

      ML.El.evt(window, 'resize', function(e) {self.resize();});

      ML.El.evt(document, 'click', function(e) {
        var clicked = ML.El.clicked(e);
        if (ML.hasClass(clicked, 'close')) {
          self.hide();
          return false;
        }

      });
    },
    
    /**
    * @function create
    * Creates a custom modal and adds it to the DOM.
    * 
    * @param {HTMLElement} dyn - element that needs a custom modal.
    */
    create: function(dyn) {
      var s = this,
        div = ML.El.create('div', {'class': 'modal hidden', id: dyn.rel}),
        iframe = '<iframe src="'+s.link.href+'" border="0" width="100%" height="100%"></iframe>',
        closeBtn = '<a href="javascript:void(0);" class="close">X</a>';
        
      s.template = s.template.replace('{{modalHeader}}', '<h1>'+s.modalHeader+'</h1>'+closeBtn);
      
      if (settings.type == 'iframe') {
        s.template = s.template.replace('{{contents}}', iframe);
      } else {
        var ajax = new ML.Ajax({
          url: s.link.href,
          success: function(data) {           
            // Need to redefine this
            div.innerHTML = data;
            s.el = div;
          }
        }); 
      }
      
      div.innerHTML = s.template;
      s.el = div;     
      
      ML.El.clean(s.el);
            
      // Add the modal to the body.
      document.body.appendChild(div);
    },
    
    /**
    * @function createOverlay
    * Creates an overlay on the page to cover the content.
    */
    createOverlay: function () {
      if (ML.$('darkness') == null) {
        var darkness = ML.El.create('div', {id:'darkness', 'class':'overlay'})
        ML.addClass(darkness, 'overlay');
        document.body.appendChild(darkness);
        
        ML.El.styl(ML._$('body')[0], {margin:0, padding: 0, width: '100%', height: '100%'});
      }
    },

    /**
    * @function show
    * Handles showing and positioning the modal. Also shows the overlay.
    *
    * @param {Boolean} selfInvoke (optional) - if invoking the modal manually.
    */
    show: function (selfInvoke) {
      var self = this;

      if (selfInvoke) {this.el = ML.$(modLink.rel);}

      var overlay = ML.$('darkness'),
        modal = this.el,
        height = (self.height == 'auto') ? modal.offsetHeight : self.height,
        modalParentTag = modal.parentNode.tagName.toLowerCase(), leftPos, topPos;

      ML.removeClass(modal, 'hidden');
      modal.removeAttribute('style');

      modal.style.height = (self.height == 'auto') ? 'auto' : self.height.toString()+'px';
      modal.style.width = self.width.toString()+'px';

      ML.El.styl(overlay, {display:'block', visibility:'visible', 'height': ML.docDimen().h+'px'});
      //ML.El.styl(modal, {'width':self.width+'px', 'height':height});
      ML.El.styl(modal, {'marginTop': '-'+height/2+'px', 'marginLeft': '-'+modal.offsetWidth/2+'px'});
      
      // Parent tag is not body get dimensions off window
      if (modalParentTag == 'body') {
        
      } else {
        var center = ML.El.center(modal);
        topPos = center.y;
        leftPos = center.x;
      }
    },

    /**
    * @function hide
    * Hides the overlay and modal.
    */
    hide: function () {
      var overlay = ML.$('darkness'),
        modal = this.el;

      ML.addClass(modal, 'hidden');
      modal.removeAttribute('style');
      overlay.removeAttribute('style');
    },

    /**
    * @function resize
    * Triggered when the window is resized. So accurate height is given to overlay "darkness".
    */
    resize: function() {
      var overlay = ML.$('darkness'),
        display = ML.El.getStyl(overlay,'display');

      // Only adjust height if overlay is shown.
      if (display == 'block') {
        ML.El.styl(overlay, {'height': ML.windowDimen().h+'px'});
      }
    }
  }
};

(function() {
  
})();