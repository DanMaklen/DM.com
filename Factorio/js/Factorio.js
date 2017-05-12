class Factorio{
	constructor(data){
		this.data = data;
	}

	newModuleConfig(moduleSlots){
		var module = [];
		for(var i = 0; i < moduleSlots; i++)
			module.push('noModule');
		return module;
	}
	newMachineConfig(machineID){
		return {
			machineID: machineID,
			module: this.newModuleConfig(factorio.getData('machine', machineID).moduleSlots)
		};
	}
	newBeaconConfig(beaconID, count=0){
		return {
			beaconID: beaconID,
			count: count,
			module: this.newModuleConfig(factorio.getData('beacon', beaconID).moduleSlots)
		}
	}
	newBuildData(buildTypeID, data){
		switch(buildTypeID){
			case 'itemBuild': return {
				itemID: data.itemID,
				recipeID: data.recipeID || null,
				rate: data.hasOwnProperty('rate') ? data.rate : 1,
				machineConfig: data.machineConfig || null,
				beaconConfig: data.beaconConfig || null
			};
			case 'recipeBuild': return {
				recipeID: data.recipeID,
				count: data.hasOwnProperty('count') ? data.count : 1,
				machineConfig: data.machineConfig || null,
				beaconConfig: data.beaconConfig || null
			};
		}
		return null;
	}
	newBuild(buildTypeID, data){
		return {
			buildTypeID: buildTypeID,
			data: this.newBuildData(buildTypeID, data)
		}
	}

	isProductivityModule(moduleID){
		return $.inArray(moduleID, [
			'ProductivityModule1',
			'ProductivityModule2',
			'ProductivityModule3',
		]) != -1;
	}


	getData(type, id){
		if(type === 'recipe')
			return this.data[type][settings.config.recipeDifficulty][id] || this.data[type]['Normal'][id];
		return this.data[type][id];
	}
	getLabel(type, id, checkItem=true){
		var data = this.getData(type, id);
		if(!data) return '::null::';
		if(data.hasOwnProperty('label') && data['label']) return data['label'];
		if(checkItem && type != 'item') return this.getLabel('item', id, false);
		return 'MissingLabel';
	}
	getIcon(type, id, checkItem=true){
		var data = this.getData(type, id);
		if(!data) return '/img/icon/missing.png';
		if(data.hasOwnProperty('icon') && data['icon']) return 'img/'+data['icon'];
		if(checkItem && type != 'item') return this.getIcon('item', id, false);
		return '/img/icon/missing.png';
	}
	getItemCategory(){
		return this.data.itemCategory
	}
	getRecipeCategory(){
		return this.data.recipeCategory;
	}


	calcStatModifier(modifier, machineModule, beaconConfig, includeProductivity=true){
		var mod = 0;
		if(!modifier || !machineModule) return 0;
		for(var i = 0; i < machineModule.length; i++)
			if(includeProductivity || !this.isProductivityModule(machineModule[i]))
				mod += this.getData('module', machineModule[i])[modifier];
		if(beaconConfig){
			var beacon_mod = 0;
			for(var i = 0; i < beaconConfig.module.length; i++)
				if(includeProductivity || !this.isProductivityModule(machineModule[i]))
					beacon_mod += this.getData('module', beaconConfig.module[i])[modifier];
			mod += beaconConfig.count * beacon_mod * this.getData('beacon', beaconConfig.beaconID).distributionEffeciency;
		}
		return mod;

	}
	calcStat(stat, machineConfig, beaconConfig, includeProductivity=true){
		if(!machineConfig) return 0;
		var machine = this.getData('machine', machineConfig.machineID);
		var val = machine[stat];
		if(machine.moduleSlots > 0)
			val *= 1 + this.calcStatModifier(stat, machineConfig.module, beaconConfig);
		return val;
	}

	calcBaseRate_Product(itemID, recipeID){
		var recipe = this.getData('recipe', recipeID);
		if(!itemID || !recipe || !recipe.product.hasOwnProperty(itemID)) return 0;
		return recipe.product[itemID] / recipe.craftTime;
	}
	calcBaseRate_Ingredient(itemID, recipeID){
		var recipe = this.getData('recipe', recipeID);
		if(!itemID || !recipe || !recipe.ingredient.hasOwnProperty(itemID)) return 0;
		return recipe.ingredient[itemID] / recipe.craftTime;
	}
	calcBaseRate(itemID, recipeID){
		return {
			product: this.calcBaseRate_Product(itemID, recipeID),
			ingredient: this.calcBaseRate_Ingredient(itemID, recipeID)
		}
	}

	calcRate_Product(recipeID, count, machineConfig, beaconConfig){
		var recipe = this.getData('recipe', recipeID);
		if(!recipe || !machineConfig || $.inArray(machineConfig.machineID, recipe.machine) == -1) return {};
		var machine = this.getData('machine', machineConfig.machineID);

		var speed = this.calcStat('speed', machineConfig, beaconConfig, recipe.acceptProductivityModule);
		var productivity = this.calcStat('productivity', machineConfig, beaconConfig, recipe.acceptProductivityModule);
		var multiplier = speed * productivity * count;

		var rate = {};
		for(var itemID in recipe.product) if(recipe.product.hasOwnProperty(itemID))
			rate[itemID] = this.calcBaseRate_Product(itemID, recipeID) * multiplier;
		return rate;
	}
	calcRate_Ingredient(recipeID, count, machineConfig, beaconConfig){
		var recipe = this.getData('recipe', recipeID);
		if(!recipe || !machineConfig || $.inArray(machineConfig.machineID, recipe.machine) == -1) return {};
		var machine = this.getData('machine', machineConfig.machineID);

		var speed = this.calcStat('speed', machineConfig, beaconConfig, recipe.acceptProductivityModule);
		var multiplier = speed * count;

		var rate = {};
		for(var itemID in recipe.ingredient) if(recipe.ingredient.hasOwnProperty(itemID))
			rate[itemID] = this.calcBaseRate_Ingredient(itemID, recipeID) * multiplier;
		return rate;
	}
	calcRate(recipeID, count, machineConfig, beaconConfig){
		return {
			product: this.calcRate_Product(recipeID, count, machineConfig, beaconConfig),
			ingredient: this.calcRate_Ingredient(recipeID, count, machineConfig, beaconConfig)
		}
	}

	calcItemRate_Product(itemID, recipeID, count, machineConfig, beaconConfig){
		return this.calcRate_Product(recipeID, count, machineConfig, beaconConfig)[itemID]
	}
	calcItemRate_Ingredient(itemID, recipeID, count, machineConfig, beaconConfig){
		return this.calcRate_Ingredient(recipeID, count, machineConfig, beaconConfig)[itemID]
	}
	calcItemRate(itemID, recipeID, count, machineConfig, beaconConfig){
		return {
			product: this.calcItemRate_Product(itemID, recipeID, count, machineConfig, beaconConfig),
			ingredient: this.calcItemRate_Ingredient(itemID, recipeID, count, machineConfig, beaconConfig)
		};
	}

	calcMachineCount_Product(rate, itemID, recipeID, machineConfig, beaconConfig){
		return rate / this.calcItemRate_Product(itemID, recipeID, 1, machineConfig, beaconConfig);
	}
	calcMachineCount_Ingredient(rate, itemID, recipeID, machineConfig, beaconConfig){
		return rate / this.calcItemRate_Ingredient(itemID, recipeID, 1, machineConfig, beaconConfig);
	}
	calcMachineCount(rate, itemID, recipeID, machineConfig, beaconConfig){
		return {
			product: this.calcMachineCount_Product(rate, itemID, recipeID, machineConfig, beaconConfig),
			ingredient: this.calcMachineCount_Ingredient(rate, itemID, recipeID, machineConfig, beaconConfig)
		};
	}
}
