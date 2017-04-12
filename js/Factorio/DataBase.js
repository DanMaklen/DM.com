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
}
