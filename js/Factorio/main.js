function DONE(){if(parent.frame_loaded_event) parent.frame_loaded_event();}
function round(n, percision){
	var factor = Math.pow(10, percision);
	return Math.round(n * factor)/factor;
}
function mergeInto_byAddition(obj1, obj2){
	if(!obj1 || !obj2) return obj1 || {};
	for(var key in obj2) if(obj2.hasOwnProperty(key))
		if(obj1.hasOwnProperty(key))
			obj1[key] += obj2[key];
		else
			obj1[key] = obj2[key];
	return obj1;
}

var db;

var factory;
var tree_factory;
var dialog_machineSelect;
var dialog_newBuild;

$(document).ready(function(){
	$.getJSON('data/Factorio/data.json', function(data){
		db = new DataBase(data);

		factory = new Factory();
		tree_factory = new FactoryTree();
		dialog_machineSelect = new Dialog_machineSelect();
		dialog_newBuild = new Dialog_newBuild();

		$('.btn#newBuild').button({
			label: "New Build",
			icon: 'ui-icon-circle-plus',
			showLabel: false
		});
		$('.btn#newBuild').click(function(e){
			dialog_newBuild.open(function(build){
				factory.newBuild(build);
				// factory.calcTotal();
				// console.log(factory.calcTotal());
			})
		});

		DONE();
	});
});
