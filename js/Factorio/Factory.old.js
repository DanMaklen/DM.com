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
		lst.push(settings.getRateText(byProduct[itemID]) + this._getIconHTML(db.getItemIcon(itemID)));
		return ' [' + lst.join(', ') + ']';
	}
	_getBeaconHTML(count, module){
		if(!count || !module || !module.length) return '';
		return  ' ' + settings.round(count) + '*'
			+	this._getIconHTML(db.getItemIcon('Beacon'), this._getModuleOverlay(module))
			;
	}
	_getMachineHTML(count, config){
		if(!count || !config || !config.machineID) return '';
		return  ' (' + settings.round(count) + '*'
			+	this._getIconHTML(db.getItemIcon(config.machineID), this._getModuleOverlay(config.module))
			+	this._getBeaconHTML(config.beacon.count, config.beacon.module)
			+	')'
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
		});
		this.$.on('changed.jstree', function(e, data){
			control.setBuild(data.node.data);
		});
		this.tree = this.$.jstree(true);
	}

	getItemText(build){
		return settings.getRateText(build.rate) + this._getIconHTML(db.getItemIcon(build.itemID))
		+	this._getByProductHTML(build.byProduct)
		+	this._getMachineHTML(build.machineCount, build.machineConfig)
		;
	}
	getRecipeText(build){
		return  this._getByProductHTML(build.byProduct)
		+	' ' + this._getIconHTML(db.getRecipeIcon(build.recipeID)) + ' '
		+	this._getMachineHTML(build.machineCount, build.machineConfig)
		;
	}
	addNode(parent, node){
		return this.tree.create_node(parent, node);
	}
	newItemNodeJSON(build){
		return {
			id: build.treeNodeID,
			text: this.getItemText(build),
			state: {
				opened: true
			},
			data: build
		}
	}
	newRecipeNodeJSON(build){
		return {
			id: build.treeNodeID,
			text: this.getRecipeText(build),
			state: {
			opened: true
			},
			data: build
		}
	}
	updateText(nodeID, text){
		this.tree.rename_node(nodeID, text);
	}
	redraw(nodeID){
		this.tree.redraw(true);
	}
	getSelectedBuild(){
		console.log(this.tree.get_selected(true));
		return this.tree.get_selected(true).build;
	}
}

class Factory {
	_newBuildNode(parent){
		return {
			parentBuild: parent,
			treeNodeID: null,
			itemID: null,
			recipeID: null,
			byProduct: null,
			rate: 0,
			machineCount: 1,
			machineConfig: {
				machineID: null,
				module: [
					null,
					null,
					null,
					null
				],
				beacon: {
					count: 0,
					module: [
						null,
						null
					]
				}
			},
			child: []
		}
	}
	_newBuild_Item(parent, info){
		var build = this._newBuildNode(parent);

		build.itemID = info.itemID;
		build.rate = info.rate;

		parent.child.push(build);
		build.treeNodeID = this.tree_factory.addNode(
			parent.treeNodeID,
			this.tree_factory.newItemNodeJSON(build)
		);
	}
	_newBuild_Recipe(parent, info){
		var build = this._newBuildNode(parent);

		build.recipeID = info.recipeID;
		build.machineCount = info.machineCount
		build.machineConfig = info.machineConfig;

		var rate = db.calcRate(info.recipeID, info.machineCount, info.machineConfig);
		build.byProduct = rate.product;

		parent.child.push(build);
		build.treeNodeID = this.tree_factory.addNode(
			parent.treeNodeID,
			this.tree_factory.newRecipeNodeJSON(build)
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

	constructor(){
		var self = this;
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
		this.tree_factory = new FactoryTree();

		this._newBuild = {
			'ItemBuild': this._newBuild_Item,
			'OilBuild': this._newBuild_Recipe,
			'ElectricityBuild': function(parent, info){},
			'ScienceBuild': function(parent, info){}
		}
		this._redraw = {
			'ItemBuild': this._redraw_Item,
			'OilBuild': this._redraw_Recipe,
			'ElectricityBuild': function(build, deep){},
			'ScienceBuild': function(build, deep){}
		};
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
		this.redrawTotal();
	}

	newBuild(build){
		this._newBuild[build.type].call(this, this.build[build.type], build.info);
		this.total$.product.addClass('greyed-out');
		this.total$.ingredient.addClass('greyed-out');
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
		this.redrawTotal();
		return this.total;
	}

	_redraw_Item(build, deep){
		console.log(build)
		this.tree_factory.updateText(build.treeNodeID, this.tree_factory.getItemText(build));
		this.tree_factory.redraw(build.treeNodeID);
	}
	_redraw_Recipe(build, deep){
		this.tree_factory.updateText(build.treeNodeID, this.tree_factory.getRecipeText(build));
	}
	_renderRates$(parent$, rate){
		for(var itemID in rate) if(rate.hasOwnProperty(itemID)){
			$('<div>', {id: 'totalRate_'+itemID})
			.addClass('inline')
			.text(settings.getRateText(rate[itemID]))
			.append(Icon.newIcon(db.getItemIcon(itemID)).get$())
			.appendTo(parent$)
			;
		}
	}
	redrawTotal(){
		this.total$.product.find('div').empty();
		this.total$.ingredient.find('div').empty();
		this.total$.product.removeClass('greyed-out');
		this.total$.ingredient.removeClass('greyed-out');
		this._renderRates$(this.total$.product, this.total.product);
		this._renderRates$(this.total$.ingredient, this.total.ingredient);
	}
	redrawAll(){
		for(var buildTypeID in this.build) if(this.build.hasOwnProperty(buildTypeID))
			for(var i = 0; i < this.build[buildTypeID].child.length; i++)
				this._redraw[buildTypeID].call(this, this.build[buildTypeID].child[i], true);
		this.redrawTotal();
	}
}
