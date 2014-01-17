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

			var m = new ML.Modal(tags[i],  ML.ParObj({elem: ML.El.data(tags[i], 'modal')}), rel);
			m.init();
		}
	}
};


/**
* @class Modal
* @namespace ML
*
* @property {FILL} FILL - fill.
*/
ML.Modal = function(modLink, settings, type) {
	
	var defaults = {width: 800, height: 'auto', header: 'Modal Header'};
	
	return {
		width: parseInt(settings.width) || defaults.width,
		height: parseInt(settings.height) || defaults.height,
		modalHeader: settings.header || defaults.header,
		link: modLink,
		el: null,
		dynamic: (type !== 'reg') ? true : false,
		template: '<div class="header">{{modalHeader}}</div><div class="content">{{contents}}</div>',

		init : function () {
			// if no rel attribute return, modal will not work.
			if (this.link.rel == null || this.link.rel == undefined) {return false;}
			
			if (this.dynamic) this.create(this.link.rel);
							
			this.el = ML.$(this.link.rel);
			
			this.bindEvents();
		},
		
		
		bindEvents: function() {
			var self = this;
			
			ML.El.evt(self.link, 'mouseover', function(e) {self.show();}, true);
			ML.El.evt(self.link, 'mouseout', function(e) {self.hide();}, true);
		},
		
		create: function(dyn) {
			var div = ML.El.create('div', {'class': 'modal hidden', id: dyn.rel});
			div.innerHTML = this.template.replace('{{message}}', dyn.title);
			document.body.appendChild(div);
			this.el = div;
		}
	}
	
};

ML.Modal2 = {
	
	defaults : {width: 800, height: 'auto', header: 'Modal Header'},
	
	init : function() {
		var links = _$$('a');
		// look for any <a> with class name of modal
		for (var i=0; i<links.length; i++) {
			if(links[i].className.match(/modal::*/ig)) {
				// if rel has iframe or ajax create a modal
				if(links[i].rel.match(/iframe/) || links[i].rel.match(/ajax/)) {
					links[i].rel = links[i].rel+'-'+i;
					ML.Modal.create(links[i], i);
				} 
				
				links[i].onclick = function() {
					props = this.className;
					ML.Modal.settings(props, this);
					return false;
				}
			}
		}
		ML.Modal.createOverlay();
	},
	
	createOverlay : function() {
		// create the darkness in the document
		var darkness = document.createElement('div'),
			bod = _$$('body');
			
		darkness.setAttribute('id', 'darkness');
		document.body.appendChild(darkness);
		darkness.style.display = 'none';

		ML.setStyle(darkness.parentNode, {props: {margin:0, padding: 0, width: '100%', height: '100%'}})
	},
	
	create : function(link, num) {
		var iframe = ML.create({tag: 'iframe', attrs:{src: link.href, border: 0, width: '100%', height: '100%'}}),
			modal = ML.create({tag: 'div', attrs: {'class': 'modal hidden', id: link.rel}}),
			template = '';
			
		modal.innerHTML = template;

		document.body.appendChild(modal);
		(modal.id.match(/iframe*/ig)) ? modal.childNodes[1].appendChild(iframe) : ML.ajax(link.rel, link.href);
	},

	settings : function(pr, link) {
		var self = this,
			settings = ML.ParObj({sep:':', elem: pr, remove: 'modal::'});
		
		// all settings are placed into an object
		var params = {id: link.rel, set:settings};
		ML.Modal.show(params);
	},

	show : function(args) {
		var modal = _$(args.id),
			modalHeight = (!args.set.height) ? this.defaults.height : args.set.height,
			modalWidth = (!args.set.width) ? this.defaults.width : args.set.width,
			title = (!args.set.header) ? this.defaults.header : args.set.header;
				
		// if id doesnt exist, stop here
		if(modal == null) {return false;} 
				
		// removes the style attribute so starting fresh each time
		modal.removeAttribute('style');
		
		cleanWhitespace(modal);
		var header = modal.childNodes[0],
			content = modal.childNodes[1];
			
		if(modal.id.match(/iframe/)) { 
			header.innerHTML = '<h1>'+title+'</h1>';
		}
	
		modal.style.width = modalWidth + 'px';
		modal.style.height = modalHeight + 'px';
		ML.setStyle(content,{props: {'height': modalHeight-header.offsetHeight-26 + 'px', 'overflow': 'hidden'}});
		
		var darkness = _$('darkness');
		
		ML.setStyle(darkness,{props: {'height': ML._screen.height()+'px', 'width': ML._screen.width()+'px', 'display': 'block', 'visibility': 'visible'}});
		
		removeClass(modal, 'hidden');
		pos = centerElement(modal);
		ML.setStyle(modal, {props: {'top': pos.x, 'left': pos.y}});

		// create the close button
		var X = ML.create({tag: 'a', attrs: {'href': 'javascript:void(0);', 'id': 'close-'+modal.id, 'class': 'close'}});
		X.innerHTML = 'X';
		
		(_$$('a', header).length > 0) ? null : header.appendChild(X);
		
		X.onclick = function() {
			ML.Modal.hide();
			return false;
		}
		ML.Modal.resizing(modal, darkness);
	},
	
	hide : function() {
		var div = _$$('div');
		
		ML.loop(div,function (item,index){
			if(hasClass(item, 'modal')) {
				addClass(item, 'hidden');
				item.style.top = '-99999em';
				
				ML.setStyle(_$('darkness'), {props: {display: 'none', visibility: 'hidden'}});
				cleanWhitespace(item);
			}
		});
	},
	
	resizing : function(modal, darkness) {
		window.onresize = function() {
			var pos = centerElement(modal);
			ML.setStyle(darkness, {props: {'height': ML._screen.height()+'px', 'width': '100%'/*ML._screen.width()+'px'*/}});
			ML.setStyle(modal, {props: {'top': pos.x, 'left': pos.y}});
		}
	}
}