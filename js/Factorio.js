function DONE(){if(parent.frame_loaded_event) parent.frame_loaded_event();}

var data;

class Tree{
	constructor(id){
		var self = this;
		this.$tree = $('.tree#'+id).jstree({
			core:{
				themes:{
					stripes: true
				},
				check_callback: true
			},
			plugins:[
				// 'noclose'
			]
		});
		this.tree = this.$tree.jstree(true);
		this.root = this.tree.get_node('#');
		this.dummyNode = {text: 'dummyNode'};

		var self = this;
		this.$tree.on('click', '.jstree-default .jstree-leaf>.jstree-ocl', function(e){
			self.build(self.get_selected());
		})
		// this.$tree.on('open_node.jstree', function(e, data){ self.build(data.node)});
		// this.$tree.on('close_node.jstree', function(e, data){ self.destroy(data.node)});

	}

	// addToBuild(parent, build){
	// 	var node = this.tree.create_node(this.root, build);
	// 		//Adding dependencies:
	// 		this.tree.create_node(node, {text: '2/sec Iron Plate'});
	// 	this.tree.open_node(node);
	// }
	addToBuild(parent, node){
		this.tree.create_node(parent, node);
		this.tree.open_node(parent);
	}
	destroy(node){
		this.tree.delete_node(node.children);
		this.tree.create_node(node, this.dummyNode);
	}
}

class OilProcessing{
	constructor(){
		this.build=[];
	}

	hasBuild(build){
		build.modules.sort();
		for(var ind=0; ind < this.build.length; ind++)
			if(this.build[ind].type == build.type && isArrayEqual(this.build[ind].modules, build.modules))
				return this.build[ind];
		return null;
	}
	newBuild(count, type, modules=[]){
		//check module count
		modules.sort();
		var id = this.build.length;
		this.build.push({
			id:id,
			count: count,
			type: type,
			modules: modules
		})
		return this.build[id];
	}

}
var tree;
var oil = new OilProcessing();
function newOilProcessing(count, type){
	var build = oil.hasBuild({
		type: type,
		modules: []
	});
	if(build != null){
		build.count++;
		$('#OilProcessing #Build #'+build.id+' #count').html(build.count);
	}
	else{
		build = oil.newBuild(count, type);
		console.log(build);
		console.log(data.OilProcessing[build.type]);

		$('#OilProcessing #Build').append(
			'<tr id="'+build.id+'"><td>'+data.OilProcessing[build.type].name+'</td><td id="count">'+build.count+'</td><td>'+
			'<select id="mod1">'+
				'<option value="speed">Speed</option>'+
				'<option value="prod">Productivity</option>'+
				'<option value="eff">Effeciency</option>'+
			'</select>'+
			'<select id="mod2">'+
				'<option value="speed">Speed</option>'+
				'<option value="prod">Productivity</option>'+
				'<option value="eff">Effeciency</option>'+
			'</select>'+
			'</td></tr>'
		);
	}
}

$(document).ready(function(){
	$.getJSON('data/Factorio/data.json', function(_data){
		data = _data;
		tree = new Tree('Build');
		$('button').button();

		$('.dialog').dialog({
			autoOpen: false
		});
		$('#newBuild').click(function(){
			tree.addToBuild(tree.root, {
				text: '1/sec Iron Gear Wheel'
			});
		});
		$('#addToBuild').click(function(){
			var build = tree.tree.get_selected(true);
			for(var ind in build) if(build.hasOwnProperty(ind) && build[ind].children.length == 0)
				tree.addToBuild(build[ind], {
					text: '2/sec Iron Plate'
				});
				tree.tree.deselect_all();
		});
		$('#OilProcessing #addBuild').click(function(){
			$('.dialog#AddOilBuild').dialog('open');
			newOilProcessing(1, 'BasicOilProcessing');
		});


		DONE();
	});
});

function isArrayEqual(arr1, arr2){
	if(arr1.length != arr2.length) return false;
	for(var ind = 0; ind < arr1.length; ind++)
		if(arr1[ind] != arr2[ind])
			return false;
	return true;
}
