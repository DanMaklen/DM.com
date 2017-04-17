class Factorio{
	constructor(data){
		this.data = data;
	}

	newBeconConfig(){
		return {
			beaconID: null,
			count: 0,
			module: []
		}
	}
	newMachineConfig(){
		return {
			machineID: null,
			count: 0,
			module: []
		}
	}

	getFuel(fuelID){
		return this.data.fuel[fuelID];
	}
	getModule(moduleID){
		return this.data.module[moduleID];
	}
	getBeacon(beaconID){
		return this.data.beacon[beaconID];
	}
	getMachine(machineID){
		return this.data.machine[machineID]
	}
	getRecipe(recipeID){
		return this.data.recipe[recipeID];
	}
	getItem(itemID){
		return this.data.item[itemID];
	}
	getItemCategories(){
		return this.data.itemCategories
	}

	getLabel(type, id, checkItem=true){
		if(!this.data[type].hasOwnProperty(id)) return '<<null>>';
		var val = this.data[type][id];
		if(val.hasOwnProperty('label') && val['label']) return val['label'];
		if(checkItem && type != 'item') return this.getLabel('item', id, false);
		return 'MissingLabel';
	}
	getIcon(type, id, checkItem=true){
		if(!this.data[type].hasOwnProperty(id)) return '';
		var val = this.data[type][id];
		if(val.hasOwnProperty('icon') && val['icon']) return 'icon/Factorio/'+val['icon'];
		if(checkItem && type != 'item') return this.getIcon('item', id, false);
		return 'icon/missing.png';
	}

	calcStatModifier(modifier, machineModule, beaconConfig=null){
		var mod = 0;
		if(!modifier || !machineModule) return 0;
		for(var i = 0; i < machineModule.length; i++)
			mod += this.getModule(machineModule[i])[modifier];
		if(beaconConfig){
			var beacon_mod = 0;
			for(var i = 0; i < beaconConfig.module.length; i++)
				beacon_mod += this.getModule(beaconConfig.module[i])[modifier];
			mod += beaconConfig.count * beacon_mod * this.getBeacon(beaconConfig.beaconID).moduleEffeciency;
		}
		return mod;

	}
	calcStat(stat, machineConfig, beaconConfig=null){
		if(!machineConfig) return 0;
		var machine = this.getMachine(machineConfig.machineID);
		var val = machine[stat];
		if(machine.moduleSlots > 0)
			val *= 1 + this.calcStatModifier(stat, machineConfig.module, beaconConfig);
		return val;
	}

	calcEffectiveEnergyConsumption(machineConfig, beaconConfig=null){
		if(!machineConfig) return 0;
		var machine = this.getMachine(machineConfig.machineID);

		var activeRatio = machineConfig.count / Math.ciel(machineConfig.count);
		var energyConsumption = this.calcStat('energyConsumption', machineConfig, beaconConfig);
		var drain = machine.drain;

		return energyConsumption * activeRatio + drain * (1 - activeRatio);
	}
	calcEffectivePollution(machineConfig, beaconConfig=null){
		if(!machineConfig) return 0;
		var machine = this.getMachine(machineConfig.machineID);

		var activeRatio = machineConfig.count / Math.ciel(machineConfig.count);
		var energyConsumption = this.calcStat('energyConsumption', machineConfig, beaconConfig);
		var pollution = this.calcStat('pollution', machineConfig, beaconConfig);

		return energyConsumption * activeRatio * pollution;
	}

	calcBaseRate_Product(itemID, recipeID){
		var recipe = this.getRecipe(recipeID);
		if(!itemID || !recipe || !recipe.product.hasOwnProperty(itemID)) return 0;
		return recipe.product[itemID] / recipe.craftTime;
	}
	calcBaseRate_Ingredient(itemID, recipeID){
		var recipe = this.getRecipe(recipeID);
		if(!itemID || !recipe || !recipe.ingredient.hasOwnProperty(itemID)) return 0;
		return recipe.ingredient[itemID] / recipe.craftTime;
	}
	calcBaseRate(itemID, recipeID){
		return {
			product: this.calcBaseRate_Product(itemID, recipeID),
			ingredient: this.calcBaseRate_Ingredient(itemID, recipeID)
		}
	}

	calcRate_Product(recipeID, machineConfig, beaconConfig=null){
		var recipe = this.getRecipe(recipeID);
		if(!recipe || !machineConfig || $.inArray(machineConfig.machineID, recipe.machine) == -1) return {};
		var machine = this.getMachine(machineConfig.machineID);

		var hardness = machine.power - recipe.hardness;
		var speed = this.calcStat('speed', machineConfig, beaconConfig);
		var productivity = this.calcStat('productivity', machineConfig, beaconConfig);
		var multiplier = hardness * speed * productivity * machineConfig.count;

		var rate = {};
		for(var itemID in recipe.product) if(recipe.product.hasOwnProperty(itemID))
			rate[itemID] = this.calcBaseRate_Product(itemID, recipeID) * multiplier;
		return rate;
	}
	calcRate_Ingredient(recipeID, machineConfig, beaconConfig=null){
		var recipe = this.getRecipe(recipeID);
		if(!recipe || !machineConfig || $.inArray(machineConfig.machineID, recipe.machine) == -1) return {};
		var machine = this.getMachine(machineConfig.machineID);

		var hardness = machine.power - recipe.hardness;
		var speed = this.calcStat('speed', machineConfig, beaconConfig);
		var multiplier = hardness * peed * machineConfig.count

		var rate = {};
		for(var itemID in recipe.ingredient) if(recipe.ingredient.hasOwnProperty(itemID))
			rate[itemID] = this.calcBaseRate_Ingredient(itemID, recipeID) * multiplier;
		return rate;
	}
	calcRate(recipeID, machineConfig, beaconConfig=null){
		return {
			product: this.calcRate_Product(recipeID, machineConfig, beaconConfig),
			ingredient: this.calcRate_Ingredient(recipeID, machineConfig, beaconConfig)
		}
	}

	calcItemRate_Product(itemID, recipeID, machineConfig, beaconConfig=null){
		return this.calcRate_Product(recipeID, machineConfig, beaconConfig)[itemID]
	}
	calcItemRate_Ingredient(itemID, recipeID, machineConfig, beaconConfig=null){
		return this.calcRate_Ingredient(recipeID, machineConfig, beaconConfig)[itemID]
	}
	calcItemRate(itemID, recipeID, machineConfig, beaconConfig=null){
		return {
			product: this.calcItemRate_Product(itemID, recipeID, machineConfig, beaconConfig),
			ingredient: this.calcItemRate_Ingredient(itemID, recipeID, machineConfig, beaconConfig)
		}
	}

	isProductivityModule(moduleID){
		return $.inArray(moduleID, [
		   'ProductivityModule1',
		   'ProductivityModule2',
		   'ProductivityModule3',
	   ]) != -1
	}
}
