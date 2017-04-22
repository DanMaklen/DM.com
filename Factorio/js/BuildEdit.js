class BuildEdit {
	_genSelectMenuItems(lst, src, label=true){
		var items = {};
		for(var i = 0; i < lst.length; i++){
			var item = {
				icon: factorio.getIcon(src, lst[i])
			};
			if(label) item['label'] = factorio.getLabel(src, lst[i]);
			items[lst[i]] = item;
		}
		return items;
	}

	_newModuleSelect(select, includeProductivity=true){
		var items = {};
		if(includeProductivity) items = $.extend(items, this._genSelectMenuItems([
			"noModule",
			"SpeedModule1",
			"SpeedModule2",
			"SpeedModule3",
			"ProductivityModule1",
			"ProductivityModule2",
			"ProductivityModule3",
			"EfficiencyModule1",
			"EfficiencyModule2",
			"EfficiencyModule3"
		], 'module', false));
		else items = $.extend(items, this._genSelectMenuItems([
			"noModule",
			"SpeedModule1",
			"SpeedModule2",
			"SpeedModule3",
			"EfficiencyModule1",
			"EfficiencyModule2",
			"EfficiencyModule3"
		], 'module', false));

		return new SelectMenu(select, {
			items: items,
			default: 'noModule'
		});
	}
	_init(){
		var self = this;

		//ItmeRecipe
		this.$itemRecipe = this.$.find('#ItemRecipe');
		this.$item = this.$itemRecipe.find('#Item');
		this.$rate = new Spinner(this.$item.find('#Rate'), {
			min: 0,
			default: 0
		});
		this.$rateUnit = new SelectMenu(this.$item.find('#RateUnit'), {
			items: {
				1: {label: '/sec'},
				60: {label: '/min'},
				3600: {label: '/hour'}
			},
			default: settings.config.rateUnit
		});
		this.$itemIcon = new Icon(this.$item.find('#ItemIcon'));

		this.$recipe = new SelectMenu(this.$itemRecipe.find('#Recipe'));

		this.$machineConfig = this.$itemRecipe.find('#MachineConfig')
		this.$machineCount = new Spinner(this.$machineConfig.find('#MachineCount'), {
			min: 0,
			default: 1
		});
		this.$machine = new SelectMenu(this.$machineConfig.find('#Machine'));
		this.$machineModule = [
			this._newModuleSelect(this.$machineConfig.find('#MachineModule #Module1')),
			this._newModuleSelect(this.$machineConfig.find('#MachineModule #Module2')),
			this._newModuleSelect(this.$machineConfig.find('#MachineModule #Module3')),
			this._newModuleSelect(this.$machineConfig.find('#MachineModule #Module4'))
		];

		this.$beaconConfig = this.$itemRecipe.find('#BeaconConfig');
		this.$beaconCount = new Spinner(this.$beaconConfig.find('#BeaconCount'), {
			min: 0,
			step: 1,
			default: 0
		});
		this.$beacon = new SelectMenu(this.$beaconConfig.find('#Beacon'), {
			items: {
				'Beacon': {
					label: factorio.getLabel('beacon', 'Beacon'),
					icon: factorio.getIcon('beacon', 'Beacon')
				}
			},
			default: 'Beacon'
		});
		this.$beaconModule = [
			this._newModuleSelect(this.$beaconConfig.find('#BeaconModule #Module1'), false),
			this._newModuleSelect(this.$beaconConfig.find('#BeaconModule #Module2'), false)
		];

		//Electricity
		this.$electricity = this.$.find('#Electricity');
		this.$power = new Spinner(this.$electricity.find('#Power'), {
			min: 0,
			default: 1
		});
		this.$powerUnit = new SelectMenu(this.$electricity.find('#PowerUnit'), {
			items: {
				1: {label: 'W'},
				1000: {label: 'KW'},
				1000000: {label: 'MW'},
				1000000000: {label: 'GW'}
			},
			default: settings.config.powerUnit
		});
		this.$electricityType = new Icon(this.$electricity.find('#ElectricityType'));

		this.$fuel = new SelectMenu(this.$electricity.find('#Fuel'), {
			items: this._genSelectMenuItems([
				"Wood",
				"RawWood",
				"SmallElectricPole",
				"WoodenChest",
				"Coal",
				"SolidFuel",
				"RocketFuel"
			], 'fuel'),
			default: 'Coal'
		});

		this.$generatorConfig = this.$electricity.find('#GeneratorConfig');
		this.$generatorCount = new Spinner(this.$electricity.find('#GeneratorCount'), {
			min: 0,
			default: 1
		});
		this.$generator = new SelectMenu(this.$electricity.find('#Generator'), {
			items: this._genSelectMenuItems([
				"SolarPanel",
				"SteamEngine"
			], 'generator'),
			default: 'SolarPanel'
		});

		this.$accumlatorConfig = this.$electricity.find('#AccumlatorConfig');
		this.$accumlatorCount = new Spinner(this.$electricity.find('#AccumlatorCount'), {
			min: 0,
			default: 0
		});
		this.$accumlator = new SelectMenu(this.$electricity.find('#Accumlator'), {
			items: this._genSelectMenuItems([
				'Accumlator'
			], 'accumlator'),
			default: 'Accumlator'
		});
	}
	_hookEvents(){
		var self = this;
		this.$rate.onchange(function(rate){
			self._updateMachineCount();
		})
		this.$rateUnit.onchange(function(unit){
			self._updateMachineCount();
		})

		this.$recipe.onchange(function(recipeID){
			self.$machine.setItems(self._genSelectMenuItems(
				factorio.getRecipe(recipeID).machine,
				'machine'
			));
			self._updateModuleStatus();

			if(self.build.itemID){
				self._updateRate_perMachine();
				self._updateMachineCount()
			}
		});

		this.$machineCount.onchange(function(machineCount){
			if(self.build.itemID) self.$rate.setValue(machineCount * self.rate_perMachine);
		});
		this.$machine.onchange(function(machineID){
			self._updateModuleStatus();
			if(self.build.itemID){
				self._updateRate_perMachine();
				self._updateMachineCount();
			}
		});
		for(var i = 0; i < 4; i++) this.$machineModule[i].onchange(function(moduleID){
			if(self.build.itemID){
				self._updateRate_perMachine();
				self._updateMachineCount();
			}
		});

		this.$beaconCount.onchange(function(recipeID){
			if(self.build.itemID){
				self._updateRate_perMachine();
				self._updateMachineCount();
			}
		});
		this.$beacon.onchange(function(beaconID){
			if(self.build.itemID){
				self._updateRate_perMachine();
				self._updateMachineCount();
			}
		});
		for(var i = 0; i < 2; i++) this.$beaconModule[i].onchange(function(moduleID){
			if(self.build.itemID){
				self._updateRate_perMachine();
				self._updateMachineCount();
			}
		})
	}
	constructor(){
		this.build = null;

		this.$ = $('#BuildEdit');
		this._init();
		this._hookEvents();
		this.disable();
	}

	_enable(obj){
		obj.removeClass('disabled');
	}
	enable(){
		this._enable(this.$);
		toolbar.$apply.button('enable');
	}
	_disable(obj){
		obj.addClass('disabled');
	}
	disable(){
		this._disable(this.$);
		toolbar.$apply.button('disable');
	}
	_isDisabled(obj){
		return obj.hasClass('disabled');
	}

	_getRateValue(){
		return this.$rate.getValue() * this.$rateUnit.getSelected();
	}
	_updateRate_perMachine(){
		var config = this.getValue();
		config.machineConfig.count = 1;
		return this.rate_perMachine = factorio.calcItemRate_Product(
			this.build.itemID,
			config.recipeID,
			config.machineConfig,
			config.beaconConfig
		);
	}
	_updateMachineCount(){
		this.$machineCount.setValue(this._getRateValue()/this.rate_perMachine);
	}
	_updateModuleStatus(){
		var recipe = factorio.getRecipe(this.$recipe.getSelected());
		var machine = factorio.getMachine(this.$machine.getSelected());
		for(var i = 0; i < 4; i++){
			if(i >= machine.moduleSlots) this.$machineModule[i].disable();
			else this.$machineModule[i].enable();
		}

		if(machine.moduleSlots > 0) this._enable(this.$beaconConfig);
		else this._disable(this.$beaconConfig);
	}
	_getPowerValue(){
		return this.$power.getValue() * this.$powerUnit.getSelected();
	}

	_setSelectedBuild_ItemRecipe(build){
		this.$.find('#ItemRecipe').addClass('BuildEditTab-Active');
		//Item
		this.$rate.setValue(build.rate/settings.config.rateUnit);
		this.$rateUnit.setSelected(settings.config.rateUnit);
		this.$itemIcon.setIconAt('main',
			build.itemID
				?	factorio.getIcon('item', build.itemID)
				:	'/icon/blank.png'
		);

		//Recipe
		if(build.itemID){
			var item = factorio.getItem(build.itemID);
			if(!item.recipe || !item.recipe.length){
				this.$recipe.disable();
				this._disable(this.$machineConfig);
				this._disable(this.$beaconConfig);
				return;
			}
		}
		this.$recipe.enable();
		this._enable(this.$machineConfig);
		this._enable(this.$beaconConfig);
		this.$recipe.setItems(this._genSelectMenuItems(
			build.itemID
				? item.recipe
				: [build.recipeID]
			, 'recipe'
		), false);
		if(build.recipeID) this.$recipe.setSelected(build.recipeID, false);
		this.$recipe.refresh();
		var recipe = factorio.getRecipe(this.$recipe.getSelected());

		//Machine Configuration
		this.$machineCount.setValue(build.machineConfig.count);
		this.$machine.setItems(this._genSelectMenuItems(recipe.machine, 'machine'), false);
		if(build.machineConfig.machineID) this.$machine.setSelected(build.machineConfig.machineID, false);
		this.$machine.refresh();
		for(var i = 0; i < 4; i++)
			this.$machineModule[i].setSelected(build.machineConfig.module[i] || 'noModule');

		//Beacon Configuration
		this.$beaconCount.setValue(build.beaconConfig.count);
		for(var i = 0; i < 2; i++)
			this.$beaconModule[i].setSelected(build.beaconConfig.module[i] || 'noModule');

		//Sync Rate and Machine Count Value
		if(build.itemID){
			this._updateRate_perMachine();
			if(!build.recipeID) this._updateMachineCount();
		}

		if(build.itemID) this._enable(this.$item);
		else this._disable(this.$item);

		this._updateModuleStatus();
	}
	_setSelectedBuild_Electricity(build){
		this.$.find('#Electricity').addClass('BuildEditTab-Active');
		var electricity = factorio.getElectricity(build.electricityTypeID);

		this.$power.setValue(build.power/settings.config.powerUnit);
		this.$powerUnit.setSelected(settings.config.rateUnit);
		this.$electricityType.setIconAt('main', factorio.getIcon('electricity', build.electricityTypeID));

		if(!electricity.fuel || !electricity.fuel.length) this.$fuel.disable();
		else{
			this.$fuel.enable();
			if(build.fuelID) this.$fuel.setSelected(build.fuelID);
		}

		if(!electricity.generator || !electricity.generator.length) this._disable(this.$generatorConfig);
		else{
			this._enable(this.$generatorConfig);
			this.$generatorCount.setValue(build.generatorConfig.count);
			if(build.generatorConfig.generatorID)
				this.$generator.setSelected(build.generatorConfig.generatorID);
		}

		if(!electricity.accumlator || !electricity.accumlator.length) this._disable(this.$accumlatorConfig);
		else {
			this._enable(this.$accumlatorConfig);
			this.$accumlatorCount.setValue(build.accumlatorConfig.count);
			if(build.accumlatorConfig.accumlatorID)
				this.$accumlator.setSelected(build.accumlatorConfig.accumlatorID);
		}
	}
	setSelectedBuild(build){
		this.build = build;
		if(!build || !build.buildTypeID) return this.disable();
		else this.enable();
		this.$.find('.BuildEditTab-Active').removeClass('BuildEditTab-Active');
		switch(build.buildTypeID){
			case 'itemBuild':
			case 'oilBuild':
				this._setSelectedBuild_ItemRecipe(build);
				break;
			case 'electricityBuild':
				this._setSelectedBuild_Electricity(build);
				break;
			case 'scienceBuild':
				break;
		}
	}

	_validate_ItemRecipe(config){
		if(!config) return false;
		if(this.build.itemID){
			var item = factorio.getItem(this.build.itemID);
			if(!item.recipe || !item.recipe.length) return {
				rate: config.rate
			}
		}

		var recipe = factorio.getRecipe(config.recipeID);
		var machine = factorio.getMachine(config.machineConfig.machineID);
		for(var i = 0; i < 4; i++){
			if(i >= machine.moduleSlots) config.machineConfig.module[i] = 'noModule';
			if(!recipe.acceptProductivityModule && factorio.isProductivityModule(config.machineConfig.module[i]))
				config.machineConfig.module[i] = 'noModule';
		}

		return config;
	}
	_getValue_ItemRecipe(){
		return this._validate_ItemRecipe({
			recipeID: this.$recipe.getSelected(),
			rate: this._getRateValue(),
			machineConfig: {
				count: eval(this.$machineCount.getValue()),
				machineID: this.$machine.getSelected(),
				module: [
					this.$machineModule[0].getSelected(),
					this.$machineModule[1].getSelected(),
					this.$machineModule[2].getSelected(),
					this.$machineModule[3].getSelected()
				]
			},
			beaconConfig: {
				count: eval(this.$beaconCount.getValue()),
				beaconID: this.$beacon.getSelected(),
				module: [
					this.$beaconModule[0].getSelected(),
					this.$beaconModule[1].getSelected()
				]
			}
		});
	}
	_validate_Electricity(config){
		if(!config) return false;
		if(this.$fuel.isDisabled()) config.fuelID = null;
		if(this._isDisabled(this.$generatorConfig)){
			config.generatorConfig.count = 0;
			config.generatorConfig.generatorID = null;
		}
		if(this._isDisabled(this.$accumlatorConfig)){
			config.accumlatorConfig.count = 0;
			config.accumlatorConfig.accumlatorID = null;
		}
		return config;
	}
	_getValue_Electricity(){
		return this._validate_Electricity({
			power: this._getPowerValue(),
			fuelID: this.$fuel.getSelected(),
			generatorConfig: {
				count: this.$generatorCount.getValue(),
				generatorID: this.$generator.getSelected()
			},
			accumlatorConfig: {
				count: this.$accumlatorCount.getValue(),
				accumlatorID: this.$accumlator.getSelected()
			}
		});
	}
	getValue(){
		if(!this.build) return false;
		switch(this.build.buildTypeID){
			case 'itemBuild':
			case 'oilBuild':
				return this._getValue_ItemRecipe();
			case 'electricityBuild':
				return this._getValue_Electricity();
			case 'scienceBuild':
				return this._getValue_Science();
		}
	}
}
