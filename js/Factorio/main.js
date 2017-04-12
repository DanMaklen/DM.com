function DONE(){if(parent.frame_loaded_event) parent.frame_loaded_event();}
function isArrayEqual(arr1, arr2){
	if(arr1.length != arr2.length) return false;
	for(var ind = 0; ind < arr1.length; ind++)
		if(arr1[ind] != arr2[ind])
			return false;
	return true;
}

class Dialog_machineSelect{
	_validate(config){
		if(this.machine_select.isDisabled()) config.machineID = null;
		for(var i = 0; i < this.module_select.length; i++)
			if(this.module_select[i].isDisabled())
				config.module[i] = null;
		if(this.beacon.count.spinner('option', 'disabled')) config.beacon.count = 0;
		for(var i = 0; i < this.beacon.module.length; i++)
			if(this.beacon.module[i].isDisabled())
				config.beacon.module[i] = null;
		return config;
	}
	_getConfig(){
		return this._validate({
			machineID: this.machine_select.getSelectedItem(),
			module: [
				this.module_select[0].getSelectedItem(),
				this.module_select[1].getSelectedItem(),
				this.module_select[2].getSelectedItem(),
				this.module_select[3].getSelectedItem()
			],
			beacon: {
				count: this.beacon.count.spinner('value'),
				module: [
					this.beacon.module[0].getSelectedItem(),
					this.beacon.module[1].getSelectedItem()
				]
			}
		});
	}

	_machine_select_items(machine){
		var item = {};
		for(var i = 0; i < machine.length; i++){
			var itemID = machine[i];
			item[itemID] = {
				label: db.getItemLabel(itemID),
				icon: db.getItemIcon(itemID)
			}
		}
		return item;
	}
	_module_select_items(){
		return {
			"noModule": {icon: 'icon/blank.png'},
			"SpeedModule1": {icon: db.getItemIcon('SpeedModule1')},
			"SpeedModule2": {icon: db.getItemIcon('SpeedModule2')},
			"SpeedModule3": {icon: db.getItemIcon('SpeedModule3')},

			"ProductivityModule1": {icon: db.getItemIcon('ProductivityModule1')},
			"ProductivityModule2": {icon: db.getItemIcon('ProductivityModule2')},
			"ProductivityModule3": {icon: db.getItemIcon('ProductivityModule3')},

			"EfficiencyModule1": {icon: db.getItemIcon('EfficiencyModule1')},
			"EfficiencyModule2": {icon: db.getItemIcon('EfficiencyModule2')},
			"EfficiencyModule3": {icon: db.getItemIcon('EfficiencyModule3')}
		}
	}
	_beacon_select_items(){
		return {
			"noModule": {icon: 'icon/blank.png'},
			"SpeedModule1": {icon: db.getItemIcon('SpeedModule1')},
			"SpeedModule2": {icon: db.getItemIcon('SpeedModule2')},
			"SpeedModule3": {icon: db.getItemIcon('SpeedModule3')},
			"EfficiencyModule1": {icon: db.getItemIcon('EfficiencyModule1')},
			"EfficiencyModule2": {icon: db.getItemIcon('EfficiencyModule2')},
			"EfficiencyModule3": {icon: db.getItemIcon('EfficiencyModule3')}
		}
	}

	_newSelectMenu(id, items){
		return new SelectMenu(id, {
			parentSelector: '.dialog#machineSelect',
			style:{
				alignment: 'center',
				compressed: true
			},
			items: items
		});
	}

	_initModule(){
		this.module_select = [
			this._newSelectMenu('Module1', this._module_select_items()),
			this._newSelectMenu('Module2', this._module_select_items()),
			this._newSelectMenu('Module3', this._module_select_items()),
			this._newSelectMenu('Module4', this._module_select_items())
		];
	}
	_initBeacon(){
		this.beacon = {
			$: $('.dialog#machineSelect #BeaconConfig'),
			count: $('.dialog#machineSelect #BeaconCount').spinner({min: 1}).spinner('value', 1),
			module: [
				this._newSelectMenu('BeaconModule1', this._beacon_select_items()),
				this._newSelectMenu('BeaconModule2', this._beacon_select_items())
			]
		}
	}

	_checkModuleSettings(itemID){
		for(var i = 0; i < this.module_select.length; i++)
			this.module_select[i].disable();
		var item = itemID && db.getItem(itemID);
		if(!item) return;
		for(var i = 0; i < this.module_select.length && i < item.production.moduleSlots; i++)
			this.module_select[i].enable();
	}
	_checkBeaconSettings(itemID){
		var item = itemID && db.getItem(itemID);
		if(item && item.production.moduleSlots > 0){
			this.beacon.count.spinner('enable')
			for(var i = 0; i < this.beacon.module.length; i++)
				this.beacon.module[i].enable();
		}
		else{
			this.beacon.count.spinner('disable')
			for(var i = 0; i < this.beacon.module.length; i++)
				this.beacon.module[i].disable();
		}
	}

	constructor(machine = []){
		var self = this;
		this.sucess_callback = null;
		this.$ = $('.dialog#machineSelect').dialog({
			width: 'auto',
			autoOpen: false,
			modal: true,
			resizable: false,
			buttons: {
				'Add': function(){
					if(self.sucess_callback)
						self.sucess_callback(self._getConfig());
					self.$.dialog('close');
				},
				'Cancle': function(){
					self.$.dialog('close');
				}
			}
		});
		this.machine_select = new SelectMenu('Machine', {
			parentSelector: '.dialog#machineSelect',
			style:{
				alignment: 'center'
			},
			change: function(itemID){
				self._checkModuleSettings(itemID)
				self._checkBeaconSettings(itemID)
			}
		});

		this._initModule();
		this._initBeacon();

		this.setMachines(machine);
	}

	setMachines(machine = []){
		this.machine_select.setItems(this._machine_select_items(machine));
		this._checkModuleSettings(this.machine_select.getSelectedItem());
		this._checkBeaconSettings(this.machine_select.getSelectedItem());
	}
	open(sucess_callback = null){
		this.sucess_callback = sucess_callback;
		this.$.dialog('open');
	}
};
class Dialog_newBuild{
	_getBuild(){
		var build = {
			type: this.build_type.getSelectedItem(),
			info: null
		};
		switch(build.type){
			case 'ItemBuild':
				build.info = {
					itemID: this.item_select.getSelectedItem(),
					rate: this.item_rate_value.val()/this.item_rate_unit.getSelectedItem()
				}
				break;
			case 'OilBuild':
				build.info = {
					itemID: null,
					rate: this.oil_count.spinner('value'),
					recipeID: this.oil_select.getSelectedItem(),
					machineConfig: this.machine_config
				}
				break;
			case 'ElectricityBuild': break;
			case 'ScienceBuild': break;
		}
		return build;
	}
	_build_type_items(){
		return {
			'ItemBuild':{label: 'Item'},
			'OilBuild':{label: 'Oil'},
			'ElectricityBuild':{
				label: 'Electricity',
				disabled: true
			},
			'ScienceBuild':{
				label: 'Science',
				disabled: true
			}
		}
	}
	_item_rate_unit_items(){
		return {
			"1": {label: "sec"},
			"60": {label: "min"},
			"3600": {label: "hour"}
		}
	}
	_oil_select_items(){
		return {
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
			}
		}
	}

	constructor(){
		var self = this;
		this.sucess_callback = null;
		this.$ = $('.dialog#newBuild').dialog({
			width: 'auto',
			autoOpen: false,
			modal: true,
			resizable: false,
			buttons: {
				'Add': function(){
					if(self.sucess_callback)
						self.sucess_callback(self._getBuild());
					self.$.dialog('close');
				},
				'Cancle': function(){
					self.$.dialog('close');
				}
			}
		});

		this.build_type = new SelectMenu('BuildType', {
			parentSelector: '.dialog#newBuild',
			style:{
				alignment: 'center'
			},
			items: this._build_type_items(),
			change: function(itemID){
				$('.dialog > fieldset > div').removeClass('ActiveBuildType');
				$('.dialog > fieldset > #' + itemID).addClass('ActiveBuildType');
			}
		});

		//Items Build
		this.item_select = new TabbedIconSelect('ItemSelect', {
			parentSelector: '.dialog#newBuild #ItemBuild',
			itemCatigories: db.getItemCatigories(),
			getIcon_func: function(itemID){
				return db.getItemIcon(itemID);
			}
		});
		this.item_rate_value = $('.dialog#newBuild #ItemBuild #ItemRate #value').spinner({
			min: 0
		}).spinner('value', 1);
		this.item_rate_unit = new SelectMenu('Unit', {
			parentSelector: '.dialog#newBuild #ItemBuild #ItemRate',
			style:{
				alignment: 'center'
			},
			items: this._item_rate_unit_items()
		});

		//OilBuild
		this.oil_select = new SelectMenu('RecipeSelect', {
			parentSelector: '.dialog#newBuild',
			style:{
				alignment: 'center'
			},
			items: this._oil_select_items()
		})
		this.oil_count = $('.dialog#newBuild #OilBuild #OilCount').spinner({
			min: 1
		}).spinner('value', 1);
		this.machine_select_btn = $('.dialog#newBuild #OilBuild #OilMachine').button({
			label: 'Machine Config',
			icon: 'ui-icon-gear'
		}).click(function(e){
			// console.log(self);
			var recipeID = self.oil_select.getSelectedItem();
			var recipe = db.getRecipe(recipeID);
			dialog_machineSelect.setMachines(recipe.machine);
			dialog_machineSelect.open(function(config){
				self.machine_config = config;
			})
		});
	}

	open(sucess_callback = null){
		this.sucess_callback = sucess_callback;
		this.$.dialog('open');
	}
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
var dialog_machineSelect;
var dialog_newBuild;

$(document).ready(function(){
	$.getJSON('data/Factorio/data.json', function(data){
		db = new DataBase(data);
		var factory = new Factory(db);

		dialog_machineSelect = new Dialog_machineSelect
		dialog_newBuild = new Dialog_newBuild();

		$('.btn#newBuild').button({
			label: "New Build",
			icon: 'ui-icon-circle-plus',
			showLabel: false
		});
		$('.btn#newBuild').click(function(e){
			dialog_newBuild.open(function(build){
				console.log('New Build', build);
			})
		});

		$('.btn#Test').button({
			label: "Test",
			icon: 'ui-icon-circle-plus'
			// showLabel: false
		});
		$('.btn#Test').click(function(e){
			dialog_machineSelect.open(function(machine){
				console.log('Machine Config', machine);
			})
		});

		DONE();
	});
});
