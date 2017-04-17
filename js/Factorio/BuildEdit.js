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
		var items = {'noModule': {icon: 'icon/blank.png'}};
		if(includeProductivity) items = $.extend(items, this._genSelectMenuItems([
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
		this.$item = this.$.find('#Item');
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

		this.$recipe = new SelectMenu(this.$.find('#Recipe'));

		this.$machineConfig = this.$.find('#MachineConfig')
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

		this.$beaconConfig = this.$.find('#BeaconConfig');
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

	}
	_hookEvents(){
		var self = this;
		this.$rate.onchange(function(rate){
			self._updateMachineCount();
		})

		this.$recipe.onchange(function(recipeID){
			self.$machine.setItems(self._genSelectMenuItems(
				factorio.getRecipe(recipeID).machine,
				'machine'
			));
			self._updateModuleStatus();
			self._updateRate_perMachine();
			self._updateMachineCount()
		});

		this.$machineCount.onchange(function(machineCount){
			self.$rate.setValue(machineCount * self.rate_perMachine);
		});
		this.$machine.onchange(function(machineID){
			self._updateModuleStatus();
			self._updateRate_perMachine();
			self._updateMachineCount();
		});
		for(var i = 0; i < 4; i++) this.$machineModule[i].onchange(function(moduleID){
			self._updateRate_perMachine();
			self._updateMachineCount();
		});

		this.$beaconCount.onchange(function(recipeID){
			self._updateRate_perMachine();
			self._updateMachineCount();
		});
		this.$beacon.onchange(function(beaconID){
			self._updateRate_perMachine();
			self._updateMachineCount();
		});
		for(var i = 0; i < 2; i++) this.$beaconModule[i].onchange(function(moduleID){
			self._updateRate_perMachine();
			self._updateMachineCount();
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
	}
	_disable(obj){
		obj.addClass('disabled');
	}
	disable(){
		this._disable(this.$);
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
		this.$machineCount.setValue(this.$rate.getValue()/this.rate_perMachine);
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

	setSelectedBuild(build){
		if(!build || (!build.itemID && !build.recipeID)) return this._disable(this.$);
		else this._enable(this.$);
		this.build = build;

		//Item
		this.$rate.setValue(1);
		this.$rateUnit.setSelected(settings.config.rateUnit);
		this.$itemIcon.setIconAt('main',
			build.itemID
				?	factorio.getIcon('item', build.itemID)
				:	'icon/blank.png'
		);

		//Recipe
		this.$recipe.setItems(this._genSelectMenuItems(
			build.itemID
				? factorio.getItem(build.itemID).recipe
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
			this.$machineModule[i].setSelected(build.machineConfig.module[i] || 'noModule', false);

		//Beacon Configuration
		this.$beaconCount.setValue(build.beaconConfig.count);
		for(var i = 0; i < 2; i++)
			this.$beaconModule[i].setSelected(build.beaconConfig.module[i] || 'noModule');

		//Sync Rate and Machine Count Value
		if(build.itemID){
			this._updateRate_perMachine();
			if(build.recipeID) this.$rate = this.rate_perMachine * build.machineConfig.count;
			else this._updateMachineCount();
		}

		if(build.itemID) this._enable(this.$item);
		else this._disable(this.$item);

		this._updateModuleStatus();
	}

	_validate(config){
		var recipe = factorio.getRecipe(config.recipeID);
		var machine = factorio.getMachine(config.machineConfig.machineID);
		for(var i = 0; i < 4; i++){
			if(i >= machine.moduleSlots) config.machineConfig.module[i] = 'noModule';
			if(!recipe.acceptProductivityModule && factorio.isProductivityModule(config.machineConfig.module[i]))
				config.machineConfig.module[i] = 'noModule';
		}

		return config;
	}
	getValue(){
		return this._validate({
			recipeID: this.$recipe.getSelected(),
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
}
