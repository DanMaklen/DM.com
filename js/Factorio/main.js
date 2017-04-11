function DONE(){if(parent.frame_loaded_event) parent.frame_loaded_event();}
function isArrayEqual(arr1, arr2){
	if(arr1.length != arr2.length) return false;
	for(var ind = 0; ind < arr1.length; ind++)
		if(arr1[ind] != arr2[ind])
			return false;
	return true;
}

class Tree{
	constructor(id){
		var self = this;
		this.$tree = $('.tree#'+id).jstree({
			core:{
				themes:{
					variant: 'large',
					icons: false,
					stripes: true
				},
				check_callback: true
			}
		});
		this.tree = this.$tree.jstree(true);
		this.root = this.tree.get_node('#');

		var self = this;
	}

	genIcon(icon){
		return $('<div>')
			.addClass('icon')
			.css({
				'width': '28px',
				'height': '28px',
				'margin-top': '0.15em',
				'vertical-align': 'top',
				'background-image': 'url('+icon+')'
			})
			;
	}
	addNode(parent, node){
		return this.tree.create_node(parent, node);
	}

}
class Factory{
	_isValidBuild(build){
		if(build.type == 'ItemBuild' && build.info.itemID == null) return false;
		return true;
	}

	constructor(db){
		this.db = db;
		this.tree = new Tree('Build');
		this.rootNode = {
			ItemBuild: this.tree.addNode(this.tree.root, {
				id: 'ItemsBuild',
				text: 'Item Builds:',
				state: {
					opened: true
				}
			}),
			OilBuild: this.tree.addNode(this.tree.root, {
				id: 'OilBuild',
				text: 'Oil Buidls:',
				state: {
					opened: true
				}
			}),
			ElectricityBuild: this.tree.addNode(this.tree.root, {
				id: 'ElectricityBuild',
				text: 'Electricity Builds:',
				state:{
					opened: true,
					disabled: true
				}
			}),
			ScienceBuild: this.tree.addNode(this.tree.root, {
				id: 'ScienceBuild',
				text: 'Science Buidls:',
				state:{
					opened: true,
					disabled: true
				}
			})
		}
		this._newBuild = {
			ItemBuild: this._newBuild_Item,
			OilBuild: this._newBuild_Oil,
			Electricity: function(info){},
			Science: function(info){}
		}
	}

	_addItem(parent, info){
		var icon = this.tree.genIcon(this.db.getItemIcon(info.itemID))[0].outerHTML;
		var text = info.rate + '/sec ' + icon;
		return this.tree.addNode(parent, {
			text: text,
			data: info
		});
	}
	_addRecipe(parent, info){
		var recipe = db.data.recipe[info.recipeID];
		var recipeIcon = this.tree.genIcon(this.db.getRecipeIcon(info.recipeID))[0].outerHTML;
		var count = info.rate;
		var text = '';

		text += '['
		var first = true;
		for(var itemID in recipe.output) if(recipe.output.hasOwnProperty(itemID)){
			var itemIcon = this.tree.genIcon(this.db.getItemIcon(itemID))[0].outerHTML;
			var itemRate = recipe.output[itemID];
			if(!first) text += '+ '; else first = false;
			text += itemRate + '/sec' + itemIcon;
		}
		text += ']' + ' (' + info.rate + ' * ' + recipeIcon + ')';

		return this.tree.addNode(parent, {
			text: text,
			data: info
		})
	}

	_newBuild_Item(info){
		var nodeID = this._addItem(this.rootNode['ItemBuild'], info);
		console.log(nodeID);
		console.log(db.data.recipe[info.recipeID]);
		this.useRecipe(nodeID, info.recipeID);
	}
	_newBuild_Oil(info){
		var nodeID = this._addRecipe(this.rootNode['OilBuild'], info);
	}

	newBuild(build){
		if(!this._isValidBuild(build)) return;
		this._newBuild[build.type].call(this, build.info);
	}
	useRecipe(nodeID, recipeID){
		var node = this.tree.tree.get_node(nodeID)
		node.data.recipeID = recipeID;
		node.state.opened = true;
		var ingredients = db.data.recipe[recipeID].ingredients;
		for(var itemID in ingredients) if(ingredients.hasOwnProperty(itemID))
			this._addItem(nodeID, {
				itemID: itemID,
				rate: ingredients[itemID],
				recipeID: null
			});
	}
}

var db;
var factory;

$(document).ready(function(){
	$.getJSON('data/Factorio/data.json', function(data){
		db = new DataBase(data);
		factory = new Factory(db);

		initNewBuildDialog(function(build){
			factory.newBuild(build)
		});

		$('.btn#newBuild').button({
			label: "New Build",
			icon: 'ui-icon-circle-plus',
			showLabel: false
		});
		$('.btn#newBuild').click(function(){
			$('.dialog#newBuild').dialog('open');
		});

		DONE();
	});
});

function initNewBuildDialog(newBuild_func){
	function _getBuild(){
		var build = {
			type: build_type.getSelectedItem(),
			info: null
		};
		switch(build.type){
			case 'ItemBuild':
				build.info = {
					itemID: item_select.getSelectedItem(),
					rate: item_rate_value.val()/item_rate_unit.getSelectedItem()
				}
				break;
			case 'OilBuild':
				build.info = {
					itemID: null,
					rate: oil_count.spinner('value'),
					recipeID: oil_select.getSelectedItem()
				}
				break;
			case 'ElectricityBuild': break;
			case 'ScienceBuild': break;
		}
		return build;
	}

	var dialog = $('.dialog#newBuild').dialog({
		width: 'auto',
		autoOpen: false,
		modal: true,
		resizable: false,
		buttons: {
			'Add': function(){
				newBuild_func(_getBuild());
				$(this).dialog('close');
			},
			'Cancle': function(){
				$(this).dialog('close');
			}
		}
	});

	var build_type = new SelectMenu('BuildType', {
		parentSelector: '.dialog',
		style:{
			alignment: 'center'
		},
		items: {
			'ItemBuild':{
				label: 'Item'
			},
			'OilBuild':{
				label: 'Oil'
			},
			'ElectricityBuild':{
				label: 'Electricity',
				disabled: true
			},
			'ScienceBuild':{
				label: 'Science',
				disabled: true
			}
		},
		change: function(itemID){
			$('.dialog > fieldset > div').removeClass('ActiveBuildType');
			$('.dialog > fieldset > #' + itemID).addClass('ActiveBuildType');
		}
	});

	//Items Build
	var item_select = new TabbedIconSelect('ItemSelect', {
		parentSelector: '.dialog #ItemBuild',
		itemCatigories: db.getItemCatigories(),
		getIcon_func: function(itemID){
			return db.getItemIcon(itemID);
		}
	});
	var item_rate_value = $('.dialog #ItemBuild #ItemRate #value').spinner({
		min: 0
	}).spinner('value', 1);
	var item_rate_unit = new SelectMenu('Unit', {
		parentSelector: '.dialog #ItemBuild #ItemRate',
		style:{
			alignment: 'center'
		},
		items: {
			"1": {
				label: "sec"
			},
			"60": {
				label: "min"
			},
			"3600": {
				label: "hour"
			}
		}
	});

	//OilBuild
	var oil_select = new SelectMenu('RecipeSelect', {
		style:{
			alignment: 'center'
		},
		items: {
			'BasicOilProcessing': {
				label: db.getRecipeLabel('BasicOilProcessing'),
				icon: db.getRecipeIcon('BasicOilProcessing')
			},
			'AdvancedOilProcessing': {
				label: db.getRecipeLabel('AdvancedOilProcessing'),
				icon: db.getRecipeIcon('AdvancedOilProcessing')
			},
			'HeavyOilCracking': {
				label: db.getRecipeLabel('HeavyOilCracking'),
				icon: db.getRecipeIcon('HeavyOilCracking')
			},
			'LightOilCracking': {
				label: db.getRecipeLabel('LightOilCracking'),
				icon: db.getRecipeIcon('LightOilCracking')
			},
		}
	})
	var oil_count = $('.dialog #OilBuild #OilCount').spinner({
		min: 1
	}).spinner('value', 1);
}
