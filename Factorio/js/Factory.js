class Factory{
	_addNode(parent, node){
		return this.$tree.create_node(parent, $.extend(true, {state:{opened: true}}, node));
	}
	_newNode(parent, data){
		var nodeData = $.extend(true, {
			buildTypeID: null,
			itemID: null,
			recipeID: null,
			rate: 1,
			machineConfig: {
				count: 1,
				machineID: null,
				module: [
					null,
					null,
					null,
					null
				]
			},
			beaconConfig: {
				count: 0,
				beaconID: 'Beacon',
				module: [
					null,
					null
				]
			},

			electricityTypeID: null,
			power: 1,
			fuelID: null,
			generatorConfig: {
				count: 0,
				generatorID: null
			},
			accumlatorConfig: {
				count: 0,
				accumlatorID: null
			}
		}, data);
		return this.$tree.get_node(this._addNode(parent, {data: nodeData}));
	}
	_redraw(treeNode){
		this.$tree.rename_node(treeNode, this._getText(treeNode.data));
		var child = treeNode.children;
		for(var i = 0; i < child.length; i++)
			this._redraw(this.$tree.get_node(child[i]));
	}

	constructor(){
		this.$ = $('#Factory #BuildTree').jstree({
			core:{
				themes:{
					variant: 'large',
					icons: false,
					stripes: true
				},
				check_callback: true
			},
			plugins: ['wholerow']
		});
		this.$tree = this.$.jstree(true);
		this.rootNodeID = {
			itemBuild: this._addNode('#', {
				id: 'itemBuild',
				text: 'Item Builds:'
			}),
			oilBuild: this._addNode('#', {
				id: 'oilBuild',
				text: 'Oil Builds:'
			}),
			electricityBuild: this._addNode('#', {
				id: 'electricityBuild',
				text: 'Electricity Builds:'
			}),
			scienceBuild: this._addNode('#', {
				id: 'scienceBuild',
				text: 'Science Builds:'
			})
		};

		this.$.on('changed.jstree', function(e, data){
			buildEdit.setSelectedBuild(data.node.data);
		});

		this.iconList = Icon.getIconList()
	}

	_expandBuild(node){
		var build = node.data;
		if(!build.recipeID) return;
		var ingredient = factorio.calcRate_Ingredient(
			build.recipeID,
			build.machineConfig,
			build.beaconConfig
		);
		for(var itemID in ingredient) if(ingredient.hasOwnProperty(itemID))
			this._newNode(node, {
				buildTypeID: 'itemBuild',
				itemID: itemID,
				rate: ingredient[itemID]
			});
	}
	newBuild(newBuildInfo){
		var node = this._newNode(this.rootNodeID[newBuildInfo.buildTypeID], newBuildInfo);
		this._redraw(node);
	}

	_updateBuild_Rate(node, rate){
		var build = node.data;
		if(build.itemID){
			build.rate = rate;
			if(build.machineConfig.machineID)
				build.machineConfig.count = factorio.calcMachineCount_Product(
					build.rate,
					build.itemID,
					build.recipeID,
					build.machineConfig,
					build.beaconConfig
				);
		}
		if(build.recipeID){
			var ingredient = factorio.calcRate_Ingredient(
				build.recipeID,
				build.machineConfig,
				build.beaconConfig
			)
			for(var i = 0; i < node.children.length; i++){
				var child = this.$tree.get_node(node.children[i]);
				this._updateBuild_Rate(child, ingredient[child.data.itemID]);
			}
		}
	}
	updateSelectedBuild(newBuild){
		var treeNode = this.$tree.get_selected(true)[0];
		if(!newBuild || !treeNode) return;

		if(treeNode.data.recipeID != newBuild.recipeID)
			this.$tree.delete_node(treeNode.children);
		treeNode.data = $.extend(true, treeNode.data, newBuild);
		if(treeNode.children.length == 0) this._expandBuild(treeNode)

		this._updateBuild_Rate(treeNode, newBuild.rate);
		this._redraw(treeNode);
	}
	deleteSelectedBuild(){
		var treeNode = this.$tree.get_selected(true)[0];
		if(!treeNode || treeNode.parents.length < 2) return;
		var build = treeNode.data;
		if(treeNode.parents.length > 2 || build.machineConfig.machineID){
			build.machineConfig.machineID = null;
			if(build.itemID) build.recipeID = null;
			this.$tree.delete_node(treeNode.children);
			this._redraw(treeNode);
		}
		else if(treeNode.parents.length == 2 && !build.machineConfig.machineID)
			this.$tree.delete_node(treeNode);
	}

	_genModuleOverlay(lst){
		if(!lst) return {};
		var overlay = {};
		for(var i = 0; i < lst.length; i++)
			overlay[this.iconList[i+1]] = factorio.getIcon('module', lst[i]);
		return overlay;
	}
	_genIconHTML(img, overlay={}){
		var icon = Icon.gen(img, overlay);
		icon.get$().css({
			'margin-right': '0.1em',
			'margin-left': '0.1em'
		})
		return icon.getHTML();
	}

	_genByProductHTML(build){
		var product = factorio.calcRate_Product(build.recipeID, build.machineConfig, build.beaconConfig);
		var lst = [];
		for(var itemID in product) if(product.hasOwnProperty(itemID) && itemID != build.itemID)
			lst.push(settings.getRateText(product[itemID]) + this._genIconHTML(factorio.getIcon('item', itemID)));
		if(!lst.length) return '';
		return '[' + lst.join(', ') + ']'
	}
	_genBeaconConfigHTML(beaconConfig){
		if(!beaconConfig || !beaconConfig.beaconID || !beaconConfig.count) return '';
		var html = '';
		html += settings.round(beaconConfig.count) + ' * ';
		html += this._genIconHTML(
			factorio.getIcon('beacon', beaconConfig.beaconID),
			this._genModuleOverlay(beaconConfig.module)
		);
		return html;
	}
	_genMachineConfigHTML(machineConfig, beaconConfig=null){
		if(!machineConfig || !machineConfig.machineID || !machineConfig.count) return '';
		var html = '( ';
		html += settings.round(machineConfig.count) + ' * ';
		html += this._genIconHTML(
			factorio.getIcon('machine', machineConfig.machineID),
			this._genModuleOverlay(machineConfig.module)
		);
		html += this._genBeaconConfigHTML(beaconConfig);
		html += ')'
		return html;
	}
	_genElectricityHTML(power, electricityTypeID){
		if(!power || !electricityTypeID) return '';
		var html = '';
	 	html += settings.getPowerText(power)
		html += this._genIconHTML(factorio.getIcon('electricity', electricityTypeID, false));
		return html;
	}

	_getText_ItemRecipe(build){
		var text = '';
		if(build.itemID){
			text += settings.getRateText(build.rate) + this._genIconHTML(factorio.getIcon('item', build.itemID));
			var item = factorio.getItem(build.itemID);
			console.log(build);
			if(!item.recipe || !item.recipe.length) return text;
		}

		text += this._genByProductHTML(build);

		if(build.recipeID && build.recipeID != build.itemID)
			text += this._genIconHTML(factorio.getIcon('recipe', build.recipeID));

		text += this._genMachineConfigHTML(build.machineConfig, build.beaconConfig);
		return text;
	}
	_getText_electricity(build){
		return this._genElectricityHTML(build.power, build.electricityTypeID);
	}
	_getText_science(build){
		return 'Not Yet Implemented';
	}
	_getText(build){
		if(!build || !build.buildTypeID) return '<<ERROR>>';

		var text = '';
		switch(build.buildTypeID){
			case 'itemBuild':
			case 'oilBuild':
				text =  this._getText_ItemRecipe(build);
				break;
			case 'electricityBuild':
				text = this._getText_electricity(build);
				break;
			case 'scienceBuild':
				text = this._getText_science(build);
				break;
		}
		return text;
	}

	redraw(){
		for(var buildTypeID in this.rootNodeID) if(this.rootNodeID.hasOwnProperty(buildTypeID)){
			var node = this.$tree.get_node(this.rootNodeID[buildTypeID]);
			for(var i = 0; i < node.children.length; i++)
				this._redraw(this.$tree.get_node(node.children[i]));
		}
	}
}