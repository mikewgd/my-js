(function () {	
	var isTouch = true;

	function create(e,t){var n=document.createElement(e);if(t){var r=t;for(var i in r){[i]=="class"?n.className=r[i]:n.setAttribute([i],r[i])}}return n}
	function $(e){return document.getElementById(e)}
	function objSize(e){var t=0;for(var n in e){t++}return t}
	function styleElement(e,t){var n=t;for(var r in n){e.style[r]=n[r]}}

	if (typeof console == 'undefined' || isTouch) {
		var output;

		var div = create('div', {id: 'consoleLog'});
		var ul = create('ul');
		var h6 = create('h6');

		h6.innerHTML = 'console log';

		styleElement(div,{position:"fixed",bottom:"0",width:"100%","font-size":"12px",background:"#fff",zIndex:"999999999999999999999"});
		styleElement(ul,{margin:0,padding:0,overflow:"auto",height:Math.round(window.innerHeight/4.5)+"px"});
		styleElement(h6,{margin:0,padding:"5px","text-transform":"uppercase","font-size":"13px","border-bottom":"1px solid #ccc"})

		document.body.appendChild(div);
		div.appendChild(h6);
		div.appendChild(ul);

		console.log = function(param) {
			var li = create('li');
			styleElement(li, {'padding': '5px','background': 'white','border-bottom': '1px solid #ccc'});

			if (typeof param == 'object') {
				var count = 0;
				output = 'Object {';

				for (var prop in param) {
					count++;
					output += (count == objSize(param)) ? prop+': "'+param[prop]+'"}' : prop+': "'+param[prop]+'", ';					
				}

				if (param == null) {
					output = 'null';
				}
			} else {
				output = param;
			}

			li.innerHTML = output;
			ul.appendChild(li);
		};
	}
}());