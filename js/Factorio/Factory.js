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
	_getByProductHTML(byProduct){
		if(!byProduct || Object.keys(byProduct).length == 0) return '';
		var lst = [];
		for(var itemID in byProduct) if(byProduct.hasOwnProperty(itemID))
		lst.push(round(byProduct[itemID], this.percision) + '/sec' + this._getIconHTML(db.getItemIcon(itemID)));
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
			+	this._getByProductHTML(build.byProduct)
			+	this._getMachineHTML(build.machineCount, build.machineConfig)
			;
	}
	_getRecipeHTML(build){
		return  this._getByProductHTML(build.byProduct)
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

class Factory {
	/*	Build Node Example
	{
		treeNodeID: 'nodeID',
		itemID: info.itemID,
		recipeID: 'AdvancedOilProcessing',	//Currently for testing. Should be null.
		byProduct: {						//Currently for testing. Should be null.
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
			byProduct: null,
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
		build.byProduct = rate.product;

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

	_calcTotal_ByProduct(node){
		var product = {};
		mergeInto_byAddition(product, node.byProduct);
		for(var i = 0; i < node.child; i++)
			mergeInto_byAddition(product, this._calcTotal_ByProduct(node.child[i]));
		return product;
	}
	_calcTotal_Ingredient(node){
		var ingredient = {};
		if(node.child.length == 0)
			ingredient[node.itemID] = node.rate;
		for(var i = 0; i < node.child.length; i++)
			mergeInto_byAddition(ingredient, this._calcTotal_Ingredient(node.child[i]));
		return ingredient;
	}

	_calcTotal_ItemBuild(){
		var total = {
			product: {},
			ingredient: {}
		}
		for(var i = 0; i < this.build['ItemBuild'].child.length; i++){
			var build = this.build['ItemBuild'].child[i];

			mergeInto_byAddition(total.product, this._calcTotal_ByProduct(build));
			if(total.product.hasOwnProperty(build.itemID)) total.product[build.itemID] += build.rate;
			else total.product[build.itemID] = build.rate;

			mergeInto_byAddition(total.ingredient, this._calcTotal_Ingredient(build));
		}

		return total;
	}
	_calcTotal_OilBuild(){
		var total = {
			product: {},
			ingredient: {}
		}
		for(var i = 0; i < this.build['OilBuild'].child.length; i++){
			var build = this.build['OilBuild'].child[i];
			mergeInto_byAddition(total.product, this._calcTotal_ByProduct(build));
			mergeInto_byAddition(total.ingredient, this._calcTotal_Ingredient(build));
		}
		return total;
	}

	_renderRates$(parent$, rate){
		for(var itemID in rate) if(rate.hasOwnProperty(itemID)){
			$('<div>', {id: 'totalRate_'+itemID})
				.addClass('inline')
				.text(round(rate[itemID], 2) + '/sec')
				.append(Icon.newIcon(db.getItemIcon(itemID)).get$())
				.appendTo(parent$)
				;
		}
	}
	_renderTotal(){
		this.total$.product.find('div').empty();
		this.total$.ingredient.find('div').empty();
		this._renderRates$(this.total$.product, this.total.product);
		this._renderRates$(this.total$.ingredient, this.total.ingredient);
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
		this._calcTotal = {
			'ItemBuild': this._calcTotal_ItemBuild,
			'OilBuild': this._calcTotal_OilBuild,
			'ElectricityBuild': function(){return {}},
			'ScienceBuild': function(){return {}}
		}

		this.total$ = {
			product: $('#TotalBuild #TotalProducts'),
			ingredient: $('#TotalBuild #TotalIngredients')
		}
		this.total = {
			product: {},
			ingredient: {}
		};
		this._renderTotal();
	}

	newBuild(build){
		this._newBuild[build.type].call(this, this.build[build.type], build.info);
		this.calcTotal();
	}
	calcTotal(){
		this.total = {
			product: {},
			ingredient: {}
		}
		for(var buildTypeID in this._calcTotal) if(this._calcTotal.hasOwnProperty(buildTypeID)){
			var temp = this._calcTotal[buildTypeID].call(this);
			mergeInto_byAddition(this.total.product, temp.product);
			mergeInto_byAddition(this.total.ingredient, temp.ingredient);
		}
		this._renderTotal();
		return this.total;
	}
}
