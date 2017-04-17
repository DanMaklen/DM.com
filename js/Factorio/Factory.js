class Factory{
	_addNode(parent, node){
		return this.$tree.create_node(parent, $.extend(true, {state:{opened: true}}, node));
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
				text: 'Item Builds:'}
			),
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
		}

		this.$.on('changed.jstree', function(e, data){
			buildEdit.setSelectedBuild(data.node.data);
		});
	}

	newBuild(build){
		var node = {
			itemID: build.itemID,
			recipeID: build.recipeID,
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

		this._addNode(this.rootNodeID[build.buildTypeID], {
			// id: 'hmmm',
			// text: 'dummy',
			data: node
		})
	}
}
