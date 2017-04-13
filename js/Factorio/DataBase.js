class DataBase{
	constructor(data){
		this.data = data;
	}

	getItemCatigories(){
		return this.data.itemCatigories
	}
	getItem(itemID){
		return this.data.items[itemID];
	}
	getRecipe(recipeID){
		return this.data.recipe[recipeID];
	}

	getItemLabel(itemID){
		if(!this.data.items.hasOwnProperty(itemID)) return '<<null>>';
		var item = this.data.items[itemID];
		if(item.hasOwnProperty('label') && item['label'])
			return item['label'];
		return 'MissingLabel'
	}
	getItemIcon(itemID){
		if(!this.data.items.hasOwnProperty(itemID)) return '';
		var item = this.data.items[itemID];
		if(item.hasOwnProperty('icon') && item['icon'])
			return 'icon/Factorio/'+item['icon'];
		return 'icon/missing.png'
	}

	getRecipeLabel(recipeID){
		if(!this.data.recipe.hasOwnProperty(recipeID)) return '<<null>>';
		var recipe = this.data.recipe[recipeID];
		if(recipe.hasOwnProperty('label') && recipe['label'])
			return recipe['label'];
		return 'MissingLabel';
	}
	getRecipeIcon(recipeID){
		if(!this.data.recipe.hasOwnProperty(recipeID)) return '';
		var recipe = this.data.recipe[recipeID];
		if(recipe.hasOwnProperty('icon') && recipe['icon'])
			return 'icon/Factorio/'+recipe['icon'];
		return 'icon/missing.png';
	}

	calcBaseRate(itemID, recipeID){
		var recipe = this.getRecipe(recipeID);
		return recipe.product[itemID] / recipe.craftingTime;
	}
	calcSpeedModifier(module, beaconConfig){
		var mod_module = 0;
		for(var i = 0; i < module.length; i++)
			if(module[i] && module[i] != 'noModule')
				mod_module += this.getItem(module[i]).moduleModifer.speed;

		var mod_beacon = 0;
		for(var i = 0; i < module.length; i++)
			if(module[i] && module[i] != 'noModule')
				mod_beacon += this.getItem(beaconConfig.module[i]).moduleModifer.speed;
		mod_beacon *= beaconConfig.count * this.getItem('Beacon').production.moduleEffeciency;
		return mod_module + mod_beacon;
	}
	calcProductivityModifier(module){
		var mod_module = 0;
		for(var i = 0; i < module.length; i++)
			if(module[i] && module[i] != 'noModule')
				mod_module += this.getItem(module[i]).moduleModifer.productivity;
		return mod_module;
	}
	calcSpeed(machineConfig){
		var baseSpeed = this.getItem(machineConfig.machineID).production.craftingSpeed;
		var mod = 1 + this.calcSpeedModifier(machineConfig.module, machineConfig.beacon);
		return baseSpeed * mod;
	}
	calcProductivity(machineConfig){
		return 1 + this.calcProductivityModifier(machineConfig.module);
	}
	calcRate(recipeID, machineCount, machineConfig){
		var recipe = this.getRecipe(recipeID);
		if($.inArray(machineConfig.machineID, recipe.machine) == -1) return false;

		var speed = this.calcSpeed(machineConfig);
		var productivity = this.calcProductivity(machineConfig);

		var rate = {
			product: {},
			ingredient: {}
		};

		for(var itemID in recipe.product) if(recipe.product.hasOwnProperty(itemID))
			rate.product[itemID] = recipe.product[itemID] / recipe.craftingTime * speed * productivity * machineCount;
		for(var itemID in recipe.ingredient) if(recipe.ingredient.hasOwnProperty(itemID))
			rate.ingredient[itemID] = recipe.ingredient[itemID] / recipe.craftingTime * speed * machineCount;

		return rate;
	}
}
