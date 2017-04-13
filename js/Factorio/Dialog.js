class Dialog_machineSelect{
	_validate(config){
		if(!config) return false;
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

	_newCompressedSelectMenu(id, items){
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
			this._newCompressedSelectMenu('Module1', this._module_select_items()),
			this._newCompressedSelectMenu('Module2', this._module_select_items()),
			this._newCompressedSelectMenu('Module3', this._module_select_items()),
			this._newCompressedSelectMenu('Module4', this._module_select_items())
		];
	}
	_initBeacon(){
		this.beacon = {
			$: $('.dialog#machineSelect #BeaconConfig'),
			count: $('.dialog#machineSelect #BeaconCount'),
			module: [
				this._newCompressedSelectMenu('BeaconModule1', this._beacon_select_items()),
				this._newCompressedSelectMenu('BeaconModule2', this._beacon_select_items())
			]
		}
		var self = this;
		this.beacon.count
			.spinner({
				min: 0,
				spin: function(e, ui){
					self._checkBeaconModuleSettings(ui.value);
				},
				change: function(e, ui){
					self._checkBeaconModuleSettings(self.beacon.count.spinner('value'));
				}
			})
			.spinner('value', 0)
			;
	}

	_checkModuleSettings(itemID){
		for(var i = 0; i < this.module_select.length; i++)
			this.module_select[i].disable();
		var item = itemID && db.getItem(itemID);
		if(!item) return;
		for(var i = 0; i < this.module_select.length && i < item.production.moduleSlots; i++)
			this.module_select[i].enable();
	}
	_checkBeaconModuleSettings(beaconCount){
		for(var i = 0; i < this.beacon.module.length; i++)
			if(beaconCount > 0) this.beacon.module[i].enable();
			else this.beacon.module[i].disable();

	}
	_checkBeaconSettings(itemID){
		var item = itemID && db.getItem(itemID);
		if(item && item.production.moduleSlots > 0){
			this.beacon.count.spinner('enable')
			this._checkBeaconModuleSettings(this.beacon.count.spinner('value'));
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
					var build = self._validate(self._getConfig());
					if(build){
						if(self.sucess_callback) self.sucess_callback(build);
						self.$.dialog('close');
					}
					else alert('Missing Info');
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
	_validate(build){
		if(!build || !build.type) return false;
		if(build.type == 'ItemBuild' && !build.info.itemID) return false;
		if(build.type == 'OilBuild' && !build.info.machineConfig) return false;
		return build;
	}
	_getBuild(){
		var build = {
			type: this.build_type.getSelectedItem(),
			info: {}
		};
		switch(build.type){
			case 'ItemBuild':
				build.info.itemID = this.item_select.getSelectedItem();
				build.info.rate = this.item_rate_value.val()/this.item_rate_unit.getSelectedItem();
				break;
			case 'OilBuild':
				build.info.machineCount = this.oil_count.spinner('value');
				build.info.recipeID = this.oil_select.getSelectedItem();
				build.info.machineConfig = this.machine_config
				break;
			case 'ElectricityBuild': break;
			case 'ScienceBuild': break;
		}
		return build;
	}
	_checkMachineConfigValidity(recipeID){
		if(this.machine_config && $.inArray(this.machine_config.machineID, db.getRecipe(recipeID).machine) == -1)
			this.machine_config = null;
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
					var build = self._validate(self._getBuild());
					if(build){
						if(self.sucess_callback) self.sucess_callback(build);
						self.$.dialog('close');
					}
					else alert('Missing Info');
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
			items: this._oil_select_items(),
			change: function(recipeID){
				self._checkMachineConfigValidity(recipeID);
			}
		})
		this.oil_count = $('.dialog#newBuild #OilBuild #OilCount').spinner({
			min: 1
		}).spinner('value', 1);
		this.machine_select_btn = $('.dialog#newBuild #OilBuild #OilMachine').button({
			label: 'Machine Config',
			icon: 'ui-icon-gear'
		}).click(function(e){
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
