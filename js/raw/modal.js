ML.Modal = {
	
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
			template = '<div class="header"></div><div class="content"></div>';
			
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