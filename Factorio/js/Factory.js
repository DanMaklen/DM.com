class Factory{
	_addTo(a, b){
		for(var key in b) if(b.hasOwnProperty(key))
			if(a.hasOwnProperty(key)) a[key] += b[key];
			else a[key] = b[key];
		return a;
	}

	constructor(){
		this.$ = $('#Factory #BuildTree').jstree({
			core:{
				themes:{
					variant: 'large',
					icons: false,
					stripes: true
				},
				multiple: false,
				check_callback: true
			},
			plugins: ['wholerow']
		});
		this.$tree = this.$.jstree(true);
		this.rootNodeID = '#';

		this.$.on('changed.jstree', function(e, data){
			buildEdit.setBuild(data.node.data);
		});

		this.iconList = Icon.getIconList();
	}

	_addNode(parent, node){
		return this.$tree.create_node(parent, $.extend(true, {state:{opened: true}}, node));
	}
	_getText(build){
		if(!build || !build.buildTypeID) return '::ERROR::';
		switch(build.buildTypeID){
			case 'itemBuild': return this._getText_itemBuild(build.data);
			case 'recipeBuild': return this._getText_recipeBuild(build.data);
		}
		return '::Unknown Build Type ID::'
	}
	_redraw(nodeID){
		// IDEA: offering the option to do a shallow _redraw in case of optimizations
		var treeNode = this.$tree.get_node(nodeID);
		this.$tree.rename_node(treeNode, this._getText(treeNode.data));
		var child = treeNode.children;
		for(var i = 0; i < child.length; i++) this._redraw(child[i]);
	}
	redraw(){
		var child = this.$tree.get_node(this.rootNodeID).children;
		for(var i = 0; i < child.length; i++) this._redraw(child[i]);
	}
	addBuild(build){
		this._redraw(this.newBuild(this.rootNodeID, factorio.newBuild(build.buildTypeID, build)));
	}
	newBuild(parent, build){
		return this._addNode(parent, {data: build});
	}
	updateSelectedBuild(build){
		var treeNode = this.$tree.get_selected(true)[0];
		if(!build || !treeNode) return;
		switch(treeNode.data.buildTypeID){
			case 'itemBuild': this._updateBuild_itemBuild(treeNode, build); break;
			case 'recipeBuild': this._updateBuild_recipeBuild(treeNode, build); break;
		}
		this._redraw(treeNode);
	}
	deleteSelectedBuild(){
		var treeNode = this.$tree.get_selected(true)[0];
		if(!treeNode) return;
		switch(treeNode.data.buildTypeID){
			case 'itemBuild': this._deleteBuild_itemBuild(treeNode); break;
			case 'recipeBuild': this._deleteBuild_recipeBuild(treeNode); break;
		}
		if(!this.$tree.get_selected().length) buildEdit.setBuild(null);
	}
	calcTotalRate(){
		var root = this.$tree.get_node(this.rootNodeID);
		var total = {}
		for(var i = 0; i < root.children.length; i++)
			this._addTo(total, this.calcSubTotalRate(this.$tree.get_node(root.children[i])));
		return total;
	}
	calcSubTotalRate(treeNode=null){
		if(!treeNode) treeNode = this.$tree.get_selected(true)[0];
		switch(treeNode.data.buildTypeID){
			case 'itemBuild': return this._calcSubTotalRate_itemBuild(treeNode);
			case 'recipeBuild': return this._calcSubTotalRate_recipeBuild(treeNode);
		}
		return {};
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
		});
		return icon.getHTML();
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
	_genMachineConfigHTML(count, machineConfig, beaconConfig){
		if(!count || !machineConfig || !machineConfig.machineID) return '';
		var html = '( ';
		html += settings.round(count) + ' * ';
		html += this._genIconHTML(
			factorio.getIcon('machine', machineConfig.machineID),
			this._genModuleOverlay(machineConfig.module)
		);
		if(beaconConfig) html += this._genBeaconConfigHTML(beaconConfig);
		html += ')'
		return html;
	}
	_genByProductHTML(byProduct){
		//................
		var lst = [];
		for(var itemID in byProduct) if(byProduct.hasOwnProperty(itemID))
			lst.push(settings.getRateText(byProduct[itemID]) + this._genIconHTML(factorio.getIcon('item', itemID)));
		if(!lst.length) return '';
		return '[' + lst.join(', ') + ']'
	}


	_getText_itemBuild(build){
		if(!build.itemID) return '::Error::';
		var text = '';

		text += settings.getRateText(build.rate) + this._genIconHTML(factorio.getIcon('item', build.itemID));

		if(build.recipeID){
			var product = factorio.calcRate_Product(build.recipeID, 1, build.machineConfig, build.beaconConfig);
			var factor = build.rate / product[build.itemID];
			var byProduct = {};
			for(var itemID in product) if(product.hasOwnProperty(itemID) && itemID != build.itemID)
				byProduct[itemID] = product[itemID] * factor;

			text += this._genByProductHTML(byProduct);
			if(build.recipeID != build.itemID)
				text += '{' + this._genIconHTML(factorio.getIcon('recipe', build.recipeID)) + '}';

			if(build.machineConfig)
				text += this._genMachineConfigHTML(factor, build.machineConfig, build.beaconConfig);
		}
		return text;
	}
	_updateBuild_itemBuild(treeNode, newBuild){
		var changed = {
			recipeID: newBuild.hasOwnProperty('recipeID') && treeNode.data.data.recipeID != newBuild.recipeID,
			rate: newBuild.hasOwnProperty('rate') && treeNode.data.data.rate != newBuild.rate
		};
		var build = $.extend(true, treeNode.data.data, newBuild);
		if(changed.recipeID){
			this.$tree.delete_node(treeNode.children);
			if(build.recipeID){
				var ingredient = factorio.calcRate_Ingredient(
					build.recipeID,
					1,
					build.machineConfig,
					build.beaconConfig
				);
				var factor = build.rate / factorio.calcItemRate_Product(
					build.itemID,
					build.recipeID,
					1,
					build.machineConfig,
					build.beaconConfig
				);
				for(var itemID in ingredient) if(ingredient.hasOwnProperty(itemID))
					this.newBuild(treeNode, factorio.newBuild('itemBuild', {
						itemID: itemID,
						rate: ingredient[itemID] * factor
					}));
			}
		}
		if(changed.rate && !changed.recipeID){
			var ingredient = factorio.calcRate_Ingredient(
				build.recipeID,
				1,
				build.machineConfig,
				build.beaconConfig
			);
			var factor = build.rate / factorio.calcItemRate_Product(
				build.itemID,
				build.recipeID,
				1,
				build.machineConfig,
				build.beaconConfig
			);

			for(var i = 0; i < treeNode.children.length; i++){
				var child = this.$tree.get_node(treeNode.children[i]);
				this._updateBuild_itemBuild(child, {
					rate: ingredient[child.data.data.itemID] * factor
				});
			}

		}
	}
	_deleteBuild_itemBuild(treeNode){
		var build = treeNode.data.data;
		if(treeNode.parent == this.rootNodeID && !build.recipeID)
			this.$tree.delete_node(treeNode);
		if(build.recipeID){
			build.recipeID = null;
			build.machineConfig = null;
			build.beaconConfig = null;
			this.$tree.delete_node(treeNode.children);
			this._redraw(treeNode);
		}
	}
	_calcSubTotalRate_itemBuild(treeNode){
		var build = treeNode.data.data;
		var rate = factorio.calcRate(
			build.recipeID,
			1,
			build.machineConfig,
			build.beaconConfig
		);
		var factor = build.rate / rate.product[build.itemID];

		var total = {}
		for(var itemID in rate.product) if(rate.product.hasOwnProperty(itemID))
			if(total.hasOwnProperty(itemID)) total[itemID] += rate.product[itemID] * factor;
			else total[itemID] = rate.product[itemID] * factor;
		for(var itemID in rate.ingredient) if(rate.ingredient.hasOwnProperty(itemID))
			if(total.hasOwnProperty(itemID)) total[itemID] += -rate.ingredient[itemID] * factor;
			else total[itemID] = -rate.ingredient[itemID] * factor;

		for(var i = 0; i < treeNode.children.length; i++)
			this._addTo(total, this.calcSubTotalRate(this.$tree.get_node(treeNode.children[i])))
		return total;
	}

	_getText_recipeBuild(build){
		if(!build.recipeID) return '::Error::';
		var text = '';

		if(build.count && build.machineConfig && build.machineConfig.machineID)
			text += this._genByProductHTML(factorio.calcRate_Product(
				build.recipeID,
				build.count,
				build.machineConfig,
				build.beaconConfig
			)) + ' ';

		text += settings.round(build.count) + ' * ';
		text += '{' + this._genIconHTML(factorio.getIcon('recipe', build.recipeID)) + '}';

		if(build.count && build.machineConfig)
			text += this._genMachineConfigHTML(build.count, build.machineConfig, build.beaconConfig);

		return text;
	}
	_updateBuild_recipeBuild(treeNode, newBuild){
		var changed = {
			ingredient: treeNode.children.length == 0
		};
		var build = $.extend(true, treeNode.data.data, newBuild);

		var ingredient = factorio.calcRate_Ingredient(
			build.recipeID,
			build.count,
			build.machineConfig,
			build.beaconConfig
		);
		if(changed.ingredient){
			for(var itemID in ingredient) if(ingredient.hasOwnProperty(itemID))
				this.newBuild(treeNode, factorio.newBuild('itemBuild', {
					itemID: itemID,
					rate: ingredient[itemID]
				}));
		}
		if(!changed.ingredient){
			for(var i = 0; i < treeNode.children.length; i++){
				var child = this.$tree.get_node(treeNode.children[i]);
				this._updateBuild_itemBuild(child, {
					rate: ingredient[child.data.data.itemID]
				});
			}
		}
	}
	_deleteBuild_recipeBuild(treeNode){
		var build = treeNode.data;
		if(build.parent == this.rootNodeID && !build.machineConfig)
			this.$tree.delete_node(treeNode);
		if(build.machineConfig){
			build.machineConfig = null;
			build.beaconConfig = null;
			this.$tree.delete_node(treeNode.children);
			this._redraw(treeNode);
		}
	}
	_calcSubTotalRate_recipeBuild(treeNode){
		var build = treeNode.data.data;
		var rate = factorio.calcRate(
			build.recipeID,
			build.count,
			build.machineConfig,
			build.beaconConfig
		);

		var total = {}
		for(var itemID in rate.product) if(rate.product.hasOwnProperty(itemID))
			if(total.hasOwnProperty(itemID)) total[itemID] += rate.product[itemID];
			else total[itemID] = rate.product[itemID];
		for(var itemID in rate.ingredient) if(rate.ingredient.hasOwnProperty(itemID))
			if(total.hasOwnProperty(itemID)) total[itemID] += -rate.ingredient[itemID];
			else total[itemID] = -rate.ingredient[itemID];

		for(var i = 0; i < treeNode.children.length; i++)
			this._addTo(total, this.calcSubTotalRate(this.$tree.get_node(treeNode.children[i])))
		return total;
	}
}
