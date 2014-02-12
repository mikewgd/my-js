/**
* @class TabHandler
* @namespace ML
* Handles calling the Tabs class.
*/
ML.TabHandler = function () {
	var tags = ML._$('*', document.body);
	
	for (var i=0; i<tags.length; i++) {
		var attr = ML.El.data;
		
		if (attr(tags[i], 'tab-holder') !== null) {
			var tab = new ML.Tabs(tags[i],  ML.ParObj({elem: ML.El.data(tags[i], 'tooltip')}));
			t.init();
		}
	}
};

ML.Tabs = function () {
	};


ML.Tabs2 = {
	
	tabs: [],
	tabContents: [],
	tabHolder: null,
	
	init : function() {
		var self = this;
		var ul = _$$('ul');
		
		// Loop through all <ul> and parse the class name with those that have tabs::
		ML.loop(ul, function(item,index) {
			if(item.className.match(/tabs::*/ig)) {
				var holder = ML.ParObj({sep:':', elem: item.className, remove: 'tabs::'}).holder,
					li = item.childNodes;
				
				// The id that holds all the tab contents
				self.tabHolder = _$(holder);
				ML.loop(li,function(item,index){
					// removes the class active from all tabs 
					// all tabs get pushed into an array
					removeClass(item, 'active');
					self.tabs.push(item.childNodes[0]);
				});	
			}
		});
		
		cleanWhitespace(self.tabHolder);
		
		// All tab contents get pushed into an array
		ML.loop(self.tabHolder.childNodes, function(item,index) {
			item.style.display = 'none';
			self.tabContents.push(item)
		});

		// show the first tab and first tab content by default
		ML.setStyle(self.tabContents[0], {props: {'display':'block'}});
		addClass(self.tabs[0].parentNode, 'active');
		
		this.events();
		
		// window location , so it will remain on the tab if you refresh
		var windowLoc = window.location.toString().split('#')[1];
		self.windowSet(windowLoc);
		
	},
	
	events : function () {
		var self = this;
		
		ML.loop(this.tabs, function(link,index){
			link.onclick=function(e){self.tabManage(this.parentNode, index);}
		});
		
		ML.loop(_$$('a'), function(link){
			if(link.getAttribute('target') == 'internal') {
				link.onclick=function(){
					var clicked = this.getAttribute('href');
					
					ML.loop(self.tabs,function(tab){
						// the tab clicked href is equal to one of the tabs href
						if(tab.getAttribute('href') == clicked) {
							var index = self.tabs.indexOf(tab);
							self.tabManage(tab.parentNode, index);	
						}
					});
					return false;
				}
			}
		});
	},
	
	tabManage : function (tab, index) {
		// removes the class active from all tabs
		// hides all the tab contents
		ML.loop(this.tabs, function(tabs){removeClass(tabs.parentNode,'active');});
		ML.loop(this.tabContents, function(content){ML.setStyle(content,{props:{'display':'none'}});});
		
		// adds active to clicked tab and displays appropriate tab content according to clicked's position
		addClass(tab,'active');
		this.tabContents[index].style.display='block';
	},
	
	windowSet : function (win) { 
		var self = this;
		
		ML.loop(this.tabs, function(tab){
			var href = tab.getAttribute('href').split('#')[1];
			if (href == win)  {
				var index = self.tabs.indexOf(tab);
				self.tabManage(tab.parentNode, index);
			}
		});
		
	}
	
}