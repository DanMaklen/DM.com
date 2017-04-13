function DONE(){if(parent.frame_loaded_event) parent.frame_loaded_event();}
function round(n, percision){var factor = Math.pow(10, percision); return Math.round(n * factor)/factor;}

class FactoryTree{
	_getModuleOverlay(module){
		if(!module) return {};
		var map = ['top_left', 'top_right', 'bottom_left', 'bottom_right'];
		var overlay = {};
		for(var i = 0; i < module.length; i++)
			if(module[i] && module[i] != 'noModule')
				overlay[map[i]] = db.getItemIcon(module[i]);
		return overlay;
	}
	_getIconHTML(img, overlay={}){
		var icon = Icon.newIcon(img, overlay);
		icon.get$().css({
			'margin-right': '0.1em',
			'margin-left': '0.1em'
		});
		return icon.getHTML();
	}
	_getByProductHTML(byProducts){
		if(!byProducts || Object.keys(byProducts).length == 0) return '';
		var lst = [];
		for(var itemID in byProducts) if(byProducts.hasOwnProperty(itemID))
		lst.push(round(byProducts[itemID], this.percision) + '/sec' + this._getIconHTML(db.getItemIcon(itemID)));
		return ' [' + lst.join(', ') + ']';
	}
	_getBeaconHTML(count, module){
		if(!count || !module || !module.length) return '';
		return  ' ' + round(count, this.percision) + ':'
			+	this._getIconHTML(db.getItemIcon('Beacon'), this._getModuleOverlay(module))
	}
	_getMachineHTML(count, config){
		if(!count || !config || !config.machineID) return '';
		return  ' (' + round(count, this.percision) + '*'
			+	this._getIconHTML(db.getItemIcon(config.machineID), this._getModuleOverlay(config.module))
			+	this._getBeaconHTML(config.beacon.count, config.beacon.module)
			+	')'
			;
	}
	_getItemHTML(build){
		return  round(build.rate, this.percision) + '/sec' + this._getIconHTML(db.getItemIcon(build.itemID))
			+	this._getByProductHTML(build.byProducts)
			+	this._getMachineHTML(build.machineCount, build.machineConfig)
			;
	}
	_getRecipeHTML(build){
		return  this._getByProductHTML(build.byProducts)
			+	' ' + this._getIconHTML(db.getRecipeIcon(build.recipeID)) + ' '
			+	this._getMachineHTML(build.machineCount, build.machineConfig)
			;
	}

	constructor(){
		var self = this;
		this.$ = $('#Factory .tree#Build').jstree({
			core:{
				themes:{
					variant: 'large',
					icons: false,
					stripes: true
				},
				check_callback: true,
				data: [
					{
						id: 'ItemBuild',
						text: 'Item Builds',
						state: {opened: true}
					},
					{
						id: 'OilBuild',
						text: 'Oil Builds',
						state: {opened: true}
					},
					{
						id: 'ElectricityBuild',
						text: 'Electricity Builds',
						state: {opened: true, disabled: true}
					},
					{
						id: 'ScienceBuild',
						text: 'Science Builds',
						state: {opened: true, disabled: true}
					}
				]
			},
			plugins: [
				'wholerow'
			]
		});
		this.$.on('loaded.jstree', function(e, data){
			self.rootNode = {
				ItemBuild: self.tree.get_node('ItemBuild'),
				OilBuild: self.tree.get_node('OilBuild'),
				ElectricityBuild: self.tree.get_node('ElectricityBuild'),
				ScienceBuild: self.tree.get_node('ScienceBuild'),
			}
		})
		this.tree = this.$.jstree(true);
		this.percision = 2;
	}

	addNode(parent, node){
		return this.tree.create_node(parent, node);
	}
	newItemNodeJSON(build){
		return {
			id: build.treeNodeID,
			text: this._getItemHTML(build),
			state: {
				opened: true
			}
		}
	}
	newRecipeNodeJSON(build){
		return {
			id: build.treeNodeID,
			text: this._getRecipeHTML(build),
			state: {
				opened: true
			}
		}
	}
}
class Factory{
/*	Build Node Example
	{
		treeNodeID: 'nodeID',
		itemID: info.itemID,
		recipeID: 'AdvancedOilProcessing',	//Currently for testing. Should be null.
		byProducts: {						//Currently for testing. Should be null.
			'SpeedModule1': 4,
			'CrudeOil': 2.4
		},
		rate: info.rate,
		machineCount: 1,
		machineConfig: {					//Currently for testing. Should be null.
			machineID: 'AssemblingMachine2',
			module: [
				'EfficiencyModule3',
				'noModule',
				null,
				null
			],
			beacon: {
				count: 8,
				module: [
					'SpeedModule3',
					'ProductivityModule3'
				]
			}
		},
		child: []
	}
*/
	_newBuildNode(){
		return {
			treeNodeID: null,
			itemID: null,
			recipeID: null,
			byProducts: null,
			rate: null,
			machineCount: null,
			machineConfig: null,
			child: []
		}
	}
	_newBuild_Item(parent, info){
		var build = this._newBuildNode();

		build.itemID = info.itemID;
		build.rate = info.rate;

		parent.child.push(build);
		build.treeNodeID = tree_factory.addNode(
			parent.treeNodeID,
			tree_factory.newItemNodeJSON(build)
		);
	}
	_newBuild_Recipe(parent, info){
		var build = this._newBuildNode();

		build.recipeID = info.recipeID;
		build.machineCount = info.machineCount
		build.machineConfig = info.machineConfig;

		var rate = db.calcRate(info.recipeID, info.machineCount, info.machineConfig);
		build.byProducts = rate.product;

		parent.child.push(build);
		build.treeNodeID = tree_factory.addNode(
			parent.treeNodeID,
			tree_factory.newRecipeNodeJSON(build)
		);

		for(var itemID in rate.ingredient) if(rate.ingredient.hasOwnProperty(itemID))
			this._newBuild_Item(build, {
				itemID: itemID,
				rate: rate.ingredient[itemID]
			});
	}

	constructor(){
		this.build = {
			ItemBuild: {
				treeNodeID: 'ItemBuild',
				child: []
			},
			OilBuild: {
				treeNodeID: 'OilBuild',
				child: []
			},
			ElectricityBuild: {
				treeNodeID: 'ElectricityBuild',
				child: []
			},
			ScienceBuild: {
				treeNodeID: 'ScienceBuild',
				child: []
			},
		};
		this._newBuild = {
			'ItemBuild': this._newBuild_Item,
			'OilBuild': this._newBuild_Recipe,
			'ElectricityBuild': function(parent, info){},
			'ScienceBuild': function(parent, info){}
		}
	}

	newBuild(build){
		this._newBuild[build.type].call(this, this.build[build.type], build.info);
	}
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
			})
		});

		DONE();
	});
});
