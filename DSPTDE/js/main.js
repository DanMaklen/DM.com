function DONE(){if(parent.frame_loaded_event) parent.frame_loaded_event();}
function gradientColor(color1, color2, weight) {
    var p = weight;
    var w = p * 2 - 1;
    var w1 = (w/1+1) / 2;
    var w2 = 1 - w1;
    var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)];
    return rgb;
}

$(document).ready(function(){
	$.getJSON('data/items.json', function(items){
		fillExtraInfo(items);

		initLabels(items);
		initProgressBars(items);
		initAccordion(items);
		initTree(items);

		DONE();
	});
});

function fillExtraInfo(items){
	function _getLeafCount(item){
		if(!item.hasOwnProperty('items')) return 1;

		item['leafCount'] = 0;
		for(var key in item['items'])
			if(item['items'].hasOwnProperty(key))
				item['leafCount'] += _getLeafCount(item['items'][key]);

		return item['leafCount'];
	}

	items['leafCount'] = 0;
	for(var key in items) if(items.hasOwnProperty(key)){
		items['leafCount'] += _getLeafCount(items[key]);
	}
	return items;
}

function initProgressBars(items){
	newProgressBar('Overall', items.leafCount);
	for(var pid in items) if(items.hasOwnProperty(pid) && typeof(items[pid]) == 'object'){
		newProgressBar(pid, items[pid].leafCount);
		var subItems = items[pid]['items'];
		for(var id in subItems) if(subItems.hasOwnProperty(id) && typeof(subItems[id]) == 'object')
			newProgressBar(id, subItems[id].leafCount);
	}
}
function initLabels(items){
	for(var pid in items) if(items.hasOwnProperty(pid) && typeof(items[pid]) == 'object'){
		newLabel(pid, items[pid].text);
		var subItems = items[pid]['items'];
		for(var id in subItems) if(subItems.hasOwnProperty(id) && typeof(subItems[id]) == 'object')
			newLabel(id, subItems[id].text);
	}
}
function initAccordion(items){
	for(var id in items) if(items.hasOwnProperty(id) && typeof(items[id]) == 'object')
		newAccordion(id);
}
function initTree(items){
	for(var pid in items) if(items.hasOwnProperty(pid) && typeof(items[pid]) == 'object'){
		var subItems = items[pid]['items'];
		for(var id in subItems) if(subItems.hasOwnProperty(id) && typeof(subItems[id]) == 'object')
			newTree(id, pid, subItems[id].items);
	}
}

function newLabel(id, label){
	$('.label#'+id).html(label);
}
function newProgressBar(id, maxCnt){
	$('.progressbar#'+id).progressbar({
		max: maxCnt,
		change: function(e, d){
			var value = $(this).progressbar('value');
			var color = gradientColor([0, 200, 0], [200, 0, 0], 1.0*value/maxCnt);
			var color_str = 'rgb('+color[0]+', '+color[1]+', '+color[2]+')';

			$('.progressbar#'+id+' .ui-progressbar-value').css('background', color_str);
		}
	});
}
function newAccordion(id){
	$('.accordion#'+id).accordion({
		header:'.group > div.header',
		heightStyle:'content',
		active: false,
		collapsible: true,
		icons: false
	});
}
function newTree(id, pid, src_dict){
	var src = [];
	for(var key in src_dict)
		if(src_dict.hasOwnProperty(key))
			src.push(src_dict[key]);

	$('.tree#'+id).jstree({
		core:{
			data: src,
			themes:{
				stripes: true,
				responsive: true
			}
		},
		state:{
			key: 'DSPTDE_tree#'+id,
			events: 'changed.jstree',
			filter: function(state){
				delete state.core.open;
				delete state.core.scroll;
				return state;
			}
		},
		plugins: [
			'checkbox',
			'state'
		]
	});
	$('.tree#'+id).on('changed.jstree', function(e, data){
		var overallCount = $('.progressbar#Overall').progressbar('value');
		var parentCount = $('.progressbar#'+pid).progressbar('value');
		var myCount = $('.progressbar#'+id).progressbar('value');
 		var delta = data.selected.length - myCount;

		$('.progressbar#Overall').progressbar('value', overallCount + delta);
		$('.progressbar#'+pid).progressbar('value', parentCount + delta);
		$('.progressbar#'+id).progressbar('value', myCount + delta);
	});
}
