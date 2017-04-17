class Factory{
	_addNode(parent, node){
		return this.$tree.create_node(parent, $.extend(true, {state:{opened: true}}, node));
s	}
	_redraw(treeNode, build){
		this.$tree.rename_node(treeNode, this._getText(build));
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
				text: 'Electricity Builds:',
				state: {disabled: true}
			}),
			scienceBuild: this._addNode('#', {
				id: 'scienceBuild',
				text: 'Oil Builds:',
				state: {disabled: true}
			})
		};

		this.$.on('changed.jstree', function(e, data){
			buildEdit.setSelectedBuild(data.node.data);
		});

		this.iconList = Icon.getIconList()
	}

	newBuild(build){
		var node = {
			treeNodeID: null,
			itemID: build.itemID,
			recipeID: build.recipeID,
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
			}
		};
		node.treeNodeID = this._addNode(this.rootNodeID[build.buildTypeID], {data: node});
		this._redraw(node.treeNodeID, node);
	}
	updateSelectedBuild(newBuild){
		if(!newBuild) return;
		var treeNode = this.$tree.get_selected(true)[0];
		treeNode.data = $.extend(true, treeNode.data, newBuild);
		this._redraw(treeNode, treeNode.data);
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
	_getText(build){
		if(!build || (!build.itemID && !build.recipeID)) return '<<ERROR>>';
		var text = '';

		if(build.itemID)
		 	text += settings.getRateText(build.rate) + this._genIconHTML(factorio.getIcon('item', build.itemID));
		text += this._genByProductHTML(build);

		if(build.recipeID && build.recipeID != build.itemID)
			text += this._genIconHTML(factorio.getIcon('recipe', build.recipeID));

		text += this._genMachineConfigHTML(build.machineConfig, build.beaconConfig);
		return text;
	}
}
