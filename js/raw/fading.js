ML.Fading = {
	
	// default values
	highest : 100,
	lowest : 0,
	speed : 10,
	repeat : true,
	cycle : false,
	
	prop : function(args) {
		var element = ML.$(args.ele),
			starting = (!args.start) ? this.highest : args.start,
			to = (!args.to) ? this.lowest : args.to,
			rep = (args.repeat==undefined) ? this.repeat : args.repeat,
			cy = (rep==false || args.cycle==undefined) ? this.cycle : args.cycle;
		
		// set opacity to the element
		element.style.opacity = element.style.opacity || starting/100;
		element.style.filter = 'alpha(opacity='+starting+')';
		
		// if repeat is off it remain it is to opacity and not run animate function
		// needed for IE
		if(element.className.match(/faded/) && rep == false) {
			element.style.opacity = element.style.opacity || to/100;
			element.style.filter = 'alpha(opacity='+to+')';
			return false;
		} else {
			element.setAttribute('ani', true);
			this.animate(element, starting, to, rep, cy);
		}
	},
	
	animate : function(ele, start, to, re, cy) {
		var increment = 0,
			curr = ele.style.opacity*100,
			acc = 0,
			state;
			
		increment++;
		
		ele.setAttribute('ani', true);
		var animation = setTimeout(function(){ML.Fading.animate(ele, start, to, re, cy)},this.speed);
				
		// repeat
		if(curr==to && re==true) {to = start;}
		/*if(curr-1 == to) {acc=-1;}
		if(curr+1 == to) {acc=+1;}*/
		
		// opacity equation
		if (curr>to) {
			opacity = (curr-increment)+acc;
			state = 'out';
		} else {
			opacity = (curr+increment)+acc;
			state = 'in';
		}
						
		ele.style.opacity = (Math.round(opacity))/100;
		ele.style.filter = 'alpha(opacity='+Math.round(opacity)+')';
		
		(cy==true) ? null : curr=opacity;
				
		if(curr == to) {
			ele.style.opacity = to/100;
			ele.style.filter = 'alpha(opacity='+to+')';
			increment=0;
			clearTimeout(animation);
			ele.setAttribute('ani', false);
			ele.className = ele.className.replace('faded-out','').replace('faded-in', '');
			addClass(ele, 'faded-'+state);
		}
	}

}