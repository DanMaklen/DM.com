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
			"EfficiencyModule1",
			"EfficiencyModule2",
			"EfficiencyModule3",
			"ProductivityModule1",
			"ProductivityModule2",
			"ProductivityModule3"
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
		this._init_itemBuild();
		this._init_recipeBuild();
	}
	_hookEvents(){
		this._hookEvents_itemBuild();
		this._hookEvents_recipeBuild();
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


	syncWithSettings(){
		if(!this.build) return;
		this._syncWithSettings_itemBuild();
		this._syncWithSettings_recipeBuild()
	}
	render(){
		if(!this.build) return;
		switch(this.build.buildTypeID){
			case 'itemBuild': this._render_itemBuild(); break;
			case 'recipeBuild': this._render_recipeBuild(); break;
		}
	}
	setBuild(build){
		if(!build || !build.buildTypeID) return this.disable();
		else this.enable();
		switch(build.buildTypeID){
			case 'itemBuild': this._setBuild_itemBuild(build.data); break;
			case 'recipeBuild': this._setBuild_recipeBuild(build.data); break;
		}

		this.render();
	}
	getValue(){
		if(!this.build) return false;
		switch(this.build.buildTypeID){
			case 'itemBuild': return this._getValue_itemBuild();
			case 'recipeBuild': return this._getValue_recipeBuild();
		}
		return false;
	}


	//itemBuild:
	_init_itemBuild(){
		this.$itemBuild = {$: this.$.find('#itemBuild')};
			this.$itemBuild.$item = this.$itemBuild.$.find('#Item');
				this.$itemBuild.$rate = new Spinner(this.$itemBuild.$item.find('#Rate'), {
					min: 0,
					default: 0
				});
				this.$itemBuild.$rateUnit = this.$itemBuild.$item.find('#RateUnit')
				this.$itemBuild.$itemIcon = new Icon(this.$itemBuild.$item.find('#ItemIcon'));
			this.$itemBuild.$recipe = new SelectMenu(this.$itemBuild.$.find('#Recipe'));
			this.$itemBuild.$machineConfig = this.$itemBuild.$.find('#MachineConfig')
				this.$itemBuild.$machineCount = this.$itemBuild.$machineConfig.find('#MachineCount');
				this.$itemBuild.$machine = new SelectMenu(this.$itemBuild.$machineConfig.find('#Machine'));
				this.$itemBuild.$machineModule = [
					this._newModuleSelect(this.$itemBuild.$machineConfig.find('#MachineModule #Module1')),
					this._newModuleSelect(this.$itemBuild.$machineConfig.find('#MachineModule #Module2')),
					this._newModuleSelect(this.$itemBuild.$machineConfig.find('#MachineModule #Module3')),
					this._newModuleSelect(this.$itemBuild.$machineConfig.find('#MachineModule #Module4'))
				];
			this.$itemBuild.$beaconConfig = this.$itemBuild.$.find('#BeaconConfig');
				this.$itemBuild.$beaconCount = new Spinner(this.$itemBuild.$beaconConfig.find('#BeaconCount'), {
					min: 0,
					default: 0
				});
				this.$itemBuild.$beacon = new SelectMenu(this.$itemBuild.$beaconConfig.find('#Beacon'), {
					items: {
						'Beacon': {
							label: factorio.getLabel('beacon', 'Beacon'),
							icon: factorio.getIcon('beacon', 'Beacon')
						}
					},
					default: 'Beacon'
				});
				this.$itemBuild.$beaconModule = [
					this._newModuleSelect(this.$itemBuild.$beaconConfig.find('#BeaconModule #Module1'), false),
					this._newModuleSelect(this.$itemBuild.$beaconConfig.find('#BeaconModule #Module2'), false)
				];
	}
	_hookEvents_itemBuild(){
		var self = this;
		this.$itemBuild.$rate.onchange(function(rate){
			self.build.rate = settings.getNormalizedRateValue(rate);
			self._render_itemBuild_machineConfig_machineCount();
		});

		this.$itemBuild.$recipe.onchange(function(recipeID){
			self.build.recipeID = recipeID;
			self.build.machineConfig = factorio.newMachineConfig(factorio.getData(
				'recipe',
				self.build.recipeID
			).machine[0]);
			self._render_itemBuild_machineConfig();
		});

		this.$itemBuild.$machine.onchange(function(machineID){
			self.build.machineConfig = factorio.newMachineConfig(machineID);
			self._render_itemBuild_machineConfig_machineCount();
			self._render_itemBuild_machineConfig_machineModule();
		});
		for(var i = 0; i < this.$itemBuild.$machineModule.length; i++)
			(function(ind){
				self.$itemBuild.$machineModule[ind].onchange(function(moduleID){
					self.build.machineConfig.module[ind] = moduleID;
					self._render_itemBuild_machineConfig_machineCount();
				});
			})(i);

		this.$itemBuild.$beaconCount.onchange(function(count){
			self.build.beaconConfig.count = 1 * count;
			self._render_itemBuild_machineConfig_machineCount();
		});
		this.$itemBuild.$beacon.onchange(function(beaconID){
			self.build.beaconConfig = factorio.newBeaconConfig(beaconID);
			self._render_itemBuild_beaconConfig();
			self._render_itemBuild_machineConfig_machineCount();
		});
		for(var i = 0; i < this.$itemBuild.$beaconModule.length; i++)
			(function(ind){
				self.$itemBuild.$beaconModule[ind].onchange(function(moduleID){
					self.build.beaconConfig.module[ind] = moduleID;
					self._render_itemBuild_machineConfig_machineCount();
				});
			})(i)
	}
	_syncWithSettings_itemBuild(){
		this._render_itemBuild_item_rate();
		this._render_itemBuild_machineConfig_machineCount();
	}
	_render_itemBuild_item_rate(){
		this.$itemBuild.$rate.setValue(settings.getRateValue(this.build.rate, false));
		this.$itemBuild.$rateUnit.text(settings.getRateLabel());
	}
	_render_itemBuild_machineConfig(){
		var recipe = factorio.getData('recipe', this.build.recipeID);
		this._render_itemBuild_machineConfig_machineCount();
		this.$itemBuild.$machine.setItems(this._genSelectMenuItems(recipe.machine, 'machine'), false);
		this.$itemBuild.$machine.setSelected(this.build.machineConfig.machineID, false);
		this.$itemBuild.$machine.refresh();
		this._render_itemBuild_machineConfig_machineModule();
	}
	_render_itemBuild_machineConfig_machineCount(){
		this.$itemBuild.$machineCount.text(settings.round(factorio.calcMachineCount_Product(
			this.build.rate,
			this.build.itemID,
			this.build.recipeID,
			this.build.machineConfig,
			this.build.beaconConfig
		)));
	}
	_render_itemBuild_machineConfig_machineModule(){
		var machine = factorio.getData('machine', this.build.machineConfig.machineID);
		for(var i = 0; i < this.$itemBuild.$machineModule.length; i++){
			if(i < machine.moduleSlots) this.$itemBuild.$machineModule[i].enable();
			else this.$itemBuild.$machineModule[i].disable();
			this.$itemBuild.$machineModule[i].setSelected(this.build.machineConfig.module[i] || 'noModule');
		}
	}
	_render_itemBuild_beaconConfig(){
		var beacon = factorio.getData('beacon', this.build.beaconConfig.beaconID);
		this.$itemBuild.$beaconCount.setValue(this.build.beaconConfig.count);
		this.$itemBuild.$beacon.setSelected(this.build.beaconConfig.beaconID);
		for(var i = 0; i < this.$itemBuild.$beaconModule.length; i++){
			if(i < beacon.moduleSlots) this.$itemBuild.$beaconModule[i].enable();
			else this.$itemBuild.$beaconModule[i].disable();
			this.$itemBuild.$beaconModule[i].setSelected(this.build.beaconConfig.module[i] || 'noModule');
		}
	}
	_render_itemBuild(){
		this.$.find('.BuildEditTab-Active').removeClass('BuildEditTab-Active');
		this.$itemBuild.$.addClass('BuildEditTab-Active');

		//Item
		var item = factorio.getData('item', this.build.itemID);
		this._render_itemBuild_item_rate();
		this.$itemBuild.$itemIcon.setIconAt('main', factorio.getIcon('item', this.build.itemID));

		if(!item.recipe || item.recipe.length <= 0){
			this.$itemBuild.$recipe.disable();
			this._disable(this.$itemBuild.$machineConfig);
			this._disable(this.$itemBuild.$beaconConfig);
			return;
		}
		else{
			this.$itemBuild.$recipe.enable();
			this._enable(this.$itemBuild.$machineConfig);
			this._enable(this.$itemBuild.$beaconConfig);
		}

		//Recipe
		this.$itemBuild.$recipe.setItems(this._genSelectMenuItems(item.recipe, 'recipe'), false);
		this.$itemBuild.$recipe.setSelected(this.build.recipeID, false);
		this.$itemBuild.$recipe.refresh();

		//Machine Configuration
		this._render_itemBuild_machineConfig();

		//Beacon Configuration
		this._render_itemBuild_beaconConfig();
	}
	_setBuild_itemBuild(buildData){
		this.build = $.extend(true, {buildTypeID: 'itemBuild'}, buildData);

		//item
		var item = factorio.getData('item', this.build.itemID);
		if(!item.recipe || item.recipe.length <= 0) return;

		//recipe
		if(!this.build.recipeID) this.build.recipeID = item.recipe[0];

		//machineConfig
		if(!this.build.machineConfig)
			this.build.machineConfig = factorio.newMachineConfig(factorio.getData(
				'recipe',
				this.build.recipeID
			).machine[0]);

		//beaconConfig
		if(!this.build.beaconConfig)
			this.build.beaconConfig = factorio.newBeaconConfig('Beacon');
	}
	_getValue_itemBuild(){
		var build = {
			itemID: this.build.itemID,
			recipeID: this.build.recipeID,
			rate: this.build.rate,
			machineConfig: this.build.machineConfig && factorio.newMachineConfig(this.build.machineConfig.machineID),
			beaconConfig: this.build.beaconConfig && factorio.newBeaconConfig(this.build.beaconConfig.beaconID)
		};
		var recipe = factorio.getData('recipe', this.build.recipeID);
		if(build.machineConfig){
			for(var i = 0; i < build.machineConfig.module.length; i++)
			if(recipe.acceptProductivityModule || !factorio.isProductivityModule(this.build.machineConfig.module[i]))
			build.machineConfig.module[i] = this.build.machineConfig.module[i];
		}
		if(build.beaconConfig){
			build.beaconConfig.count = this.build.beaconConfig.count;
			for(var i = 0; i < build.beaconConfig.module.length; i++)
			if(recipe.acceptProductivityModule || !factorio.isProductivityModule(this.build.beaconConfig.module[i]))
			build.beaconConfig.module[i] = this.build.beaconConfig.module[i];
		}
		return build;
	}

	//recipeBuild:
	_init_recipeBuild(){
		this.$recipeBuild = {$: this.$.find('#recipeBuild')};
			this.$recipeBuild.$recipe = this.$recipeBuild.$.find('#Recipe');
				this.$recipeBuild.$count = new Spinner(this.$recipeBuild.$recipe.find('#Count'), {
					min: 0,
					default: 0
				});
				this.$recipeBuild.$recipeIcon = new Icon(this.$recipeBuild.$recipe.find('#RecipeIcon'));
			this.$recipeBuild.$machineConfig = this.$recipeBuild.$.find('#MachineConfig')
				this.$recipeBuild.$machine = new SelectMenu(this.$recipeBuild.$machineConfig.find('#Machine'));
				this.$recipeBuild.$machineModule = [
					this._newModuleSelect(this.$recipeBuild.$machineConfig.find('#MachineModule #Module1')),
					this._newModuleSelect(this.$recipeBuild.$machineConfig.find('#MachineModule #Module2')),
					this._newModuleSelect(this.$recipeBuild.$machineConfig.find('#MachineModule #Module3')),
					this._newModuleSelect(this.$recipeBuild.$machineConfig.find('#MachineModule #Module4'))
				];
			this.$recipeBuild.$beaconConfig = this.$recipeBuild.$.find('#BeaconConfig');
				this.$recipeBuild.$beaconCount = new Spinner(this.$recipeBuild.$beaconConfig.find('#BeaconCount'), {
					min: 0,
					step: 1,
					default: 0
				});
				this.$recipeBuild.$beacon = new SelectMenu(this.$recipeBuild.$beaconConfig.find('#Beacon'), {
					items: {
						'Beacon': {
							label: factorio.getLabel('beacon', 'Beacon'),
							icon: factorio.getIcon('beacon', 'Beacon')
						}
					},
					default: 'Beacon'
				});
				this.$recipeBuild.$beaconModule = [
						this._newModuleSelect(this.$recipeBuild.$beaconConfig.find('#BeaconModule #Module1'), false),
						this._newModuleSelect(this.$recipeBuild.$beaconConfig.find('#BeaconModule #Module2'), false)
					];
	}
	_hookEvents_recipeBuild(){
		var self = this;
		this.$recipeBuild.$count.onchange(function(count){
			self.build.count = count;
		});

		this.$recipeBuild.$machine.onchange(function(machineID){
			self.build.machineConfig = factorio.newMachineConfig(machineID);
			self._render_recipeBuild_machineConfig_machineModule();
		});
		for(var i = 0; i < this.$recipeBuild.$machineModule.length; i++)
			(function(ind){
				self.$recipeBuild.$machineModule[ind].onchange(function(moduleID){
					self.build.machineConfig.module[ind] = moduleID;
				});
			})(i);

		this.$recipeBuild.$beaconCount.onchange(function(count){
			self.build.beaconConfig.count = count;
		});
		this.$recipeBuild.$beacon.onchange(function(beaconID){
			self.build.beaconConfig = factorio.newBeaconConfig(beaconID);
			self._render_recipeBuild_beaconConfig();
		});
		for(var i = 0; i < this.$recipeBuild.$beaconModule.length; i++)
			(function(ind){
				self.$recipeBuild.$beaconModule[ind].onchange(function(moduleID){
					self.build.beaconConfig.module[ind] = moduleID;
				});
			})(i)
	}
	_syncWithSettings_recipeBuild(){
		return;
	}
	_render_recipeBuild_machineConfig_machineModule(){
		var machine = factorio.getData('machine', this.build.machineConfig.machineID);
		for(var i = 0; i < this.$recipeBuild.$machineModule.length; i++){
			if(i < machine.moduleSlots) this.$recipeBuild.$machineModule[i].enable();
			else this.$recipeBuild.$machineModule[i].disable();
			this.$recipeBuild.$machineModule[i].setSelected(this.build.machineConfig.module[i] || 'noModule');
		}
	}
	_render_recipeBuild_beaconConfig(){
		var beacon = factorio.getData('beacon', this.build.beaconConfig.beaconID);
		this.$recipeBuild.$beaconCount.setValue(this.build.beaconConfig.count);
		this.$recipeBuild.$beacon.setSelected(this.build.beaconConfig.beaconID);
		for(var i = 0; i < this.$recipeBuild.$beaconModule.length; i++){
			if(i < beacon.moduleSlots) this.$recipeBuild.$beaconModule[i].enable();
			else this.$recipeBuild.$beaconModule[i].disable();
			this.$recipeBuild.$beaconModule[i].setSelected(this.build.beaconConfig.module[i] || 'noModule');
		}
	}
	_render_recipeBuild(){
		this.$.find('.BuildEditTab-Active').removeClass('BuildEditTab-Active');
		this.$recipeBuild.$.addClass('BuildEditTab-Active');

		//recipe
		this.$recipeBuild.$count.setValue(this.build.count);
		this.$recipeBuild.$recipeIcon.setIconAt('main', factorio.getIcon('recipe', this.build.recipeID));

		//machineConfig
		var recipe = factorio.getData('recipe', this.build.recipeID);
		this.$recipeBuild.$machine.setItems(this._genSelectMenuItems(recipe.machine, 'machine'), false);
		this.$recipeBuild.$machine.setSelected(this.build.machineConfig.machineID, false);
		this.$recipeBuild.$machine.refresh();
		this._render_recipeBuild_machineConfig_machineModule();

		//beaconConfig
		this._render_recipeBuild_beaconConfig();
	}
	_setBuild_recipeBuild(buildData){
		this.build = $.extend(true, {buildTypeID: 'recipeBuild'}, buildData);

		//machineConfig
		if(!this.build.machineConfig)
			this.build.machineConfig = factorio.newMachineConfig(factorio.getData(
				'recipe',
				this.build.recipeID
			).machine[0]);

		//beaconConfig
		if(!this.build.beaconConfig)
			this.build.beaconConfig = factorio.newBeaconConfig('Beacon');
	}
	_getValue_recipeBuild(){
		var build = {
			count: this.build.count,
			recipeID: this.build.recipeID,
			machineConfig: factorio.newMachineConfig(this.build.machineConfig.machineID),
			beaconConfig: factorio.newBeaconConfig(this.build.beaconConfig.beaconID)
		};
		var recipe = factorio.getData('recipe', this.build.recipeID);
		for(var i = 0; i < build.machineConfig.module.length; i++)
			if(recipe.acceptProductivityModule || !factorio.isProductivityModule(this.build.machineConfig.module[i]))
				build.machineConfig.module[i] = this.build.machineConfig.module[i];
		for(var i = 0; i < build.beaconConfig.module.length; i++)
			if(recipe.acceptProductivityModule || !factorio.isProductivityModule(this.build.beaconConfig.module[i]))
				build.beaconConfig.module[i] = this.build.beaconConfig.module[i];
		return build;
	}
}
