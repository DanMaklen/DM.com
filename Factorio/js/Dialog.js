class Dialog_Settings{
	_init(){
		this.$rateUnit = new SelectMenu(this.$.find('#RateUnit'), {
			items: {
				1: {label: '/sec'},
				60: {label: '/min'},
				3600: {label: '/hour'}
			},
			default: settings.config.rateUnit
		});
		this.$powerUnit = new SelectMenu(this.$.find('#PowerUnit'), {
			items: {
				1: {label: 'W'},
				1000: {label: 'KW'},
				1000000: {label: 'MW'},
				1000000000: {label: 'GW'}
			},
			default: settings.config.powerUnit
		})
		this.$percision = new SelectMenu(this.$.find('#Percision'), {
			items: {
				0: {label: 1},
				1: {label: 0.1},
				2: {label: 0.01},
				3: {label: 0.001},
				4: {label: 0.0001}
			},
			default: settings.config.percision
		});
		this.$crudeOilYieldUnit = new SelectMenu(this.$.find('#CrudeOilYieldUnit'), {
			items: {
				1: {label: '/sec'},
				60: {label: '/min'},
				3600: {label: '/hour'}
			},
			default: settings.config.rateUnit
		});
		this.$recipeDifficulty = new SelectMenu(this.$.find('#RecipeDifficulty'), {
			items: {'normal': {label: 'Normal'}},
			default: settings.config.recipeDifficulty
		});
		this.$scienceDifficulty = new SelectMenu(this.$.find('#ScienceDifficulty'), {
			items: {'normal': {label: 'Normal'}},
			default: settings.config.scienceDifficulty
		});
	}
	constructor(){
		var self = this;
		this.callback = function(val){};
		this.$ = $('.dialog#Settings').dialog({
			width: 'auto',
			autoOpen: false,
			modal: true,
			resizable: false,
			buttons: {
				'Set': function(){self._OK();},
				'Cancle': function(){self.$.dialog('close');}
			}
		});
		this._init();
	}

	_OK(){
		var val = this.getValue();
		if(val){
			if(this.callback) this.callback(val);
			this.$.dialog('close');
		}
		else alert('Missing Info');
	}
	open(callback=function(val){}){
		this.callback = callback;
		this.$.dialog('open');
	}

	_validate(val){
		return val;
	}
	getValue(){
		return this._validate({
			rateUnit: this.$rateUnit.getSelected(),
			powerUnit: this.$powerUnit.getSelected(),
			percision: this.$percision.getSelected(),
			recipeDifficulty: this.$recipeDifficulty.getSelected(),
			scienceDifficulty: this.$scienceDifficulty.getSelected()
		});
	}
}

class Dialog_NewBuild{
	_init(){
		var self = this;
		this.$buildType = new SelectMenu(this.$.find('#BuildType'), {
			items: {
				'itemBuild': {label: 'Item Build'},
				'oilBuild': {label: 'Oil Build'},
				'electricityBuild': {label: 'Electricity Build'},
				'scienceBuild': {
					label: 'Science Build',
					disabled: true
				}
			},
			default: 'itemBuild',
			change: function(buildTypeID){
				self.$.find('.ActiveBuildForm').removeClass('ActiveBuildForm');
				self.$.find('#'+buildTypeID).addClass('ActiveBuildForm');

				self.$.dialog('option', 'position', { my: "center", at: "center", of: window});
			}
		});

		//Item Build:
		this.$item = new TabbedIconSelect(this.$.find('#itemBuild #Item'), {
			itemCategories: factorio.getItemCategories(),
			getIcon_func: function(itemID){return factorio.getIcon('item', itemID);}
		});

		//Oil Build:
		this.$recipe = new SelectMenu(this.$.find('#oilBuild #Recipe'), {
			items: {
				'BasicOilProcessing': {
					label: factorio.getLabel('recipe', 'BasicOilProcessing', false),
					icon: factorio.getIcon('recipe', 'BasicOilProcessing', false)
				},
				'AdvancedOilProcessing': {
					label: factorio.getLabel('recipe', 'AdvancedOilProcessing', false),
					icon: factorio.getIcon('recipe', 'AdvancedOilProcessing', false)
				},
				'HeavyOilCracking': {
					label: factorio.getLabel('recipe', 'HeavyOilCracking', false),
					icon: factorio.getIcon('recipe', 'HeavyOilCracking', false)
				},
				'LightOilCracking': {
					label: factorio.getLabel('recipe', 'LightOilCracking', false),
					icon: factorio.getIcon('recipe', 'LightOilCracking', false)
				}
			},
			default: 'BasicOilProcessing'
		})

		//Electricity Build:
		this.$electricityType = new SelectMenu(this.$.find('#electricityBuild #ElectricityType'), {
			items: {
				'Burner': {
					label: factorio.getLabel('electricity', 'Burner'),
					icon: factorio.getIcon('electricity', 'Burner')
				},
				'Electric':{
					label: factorio.getLabel('electricity', 'Electric'),
					icon: factorio.getIcon('electricity', 'Electric')
				}
			},
			default: "electric"
		});
	}
	constructor(){
		var self = this;
		this.callback = function(val){};
		this.$ = $('.dialog#NewBuild').dialog({
			width: 'auto',
			autoOpen: false,
			modal: true,
			resizable: false,
			draggable: false,
			buttons: {
				'Add': function(){self._OK();},
				'Cancle': function(){self.$.dialog('close');}
			}
		});
		this._init();
	}

	_OK(){
		var val = this.getValue();
		if(val){
			if(this.callback) this.callback(val);
			this.$.dialog('close');
		}
		else alert('Missing Info');
	}
	open(callback=function(val){}){
		this.callback = callback;
		this.$.dialog('open');
	}

	_validate(val){
		if(val.buildTypeID != 'itemBuild') val.itemID = null;
		if(val.buildTypeID != 'oilBuild') val.recipeID = null;
		if(val.buildTypeID != 'electricityBuild') val.electricityTypeID = null;
		return val;
	}
	getValue(){
		return this._validate({
			buildTypeID: this.$buildType.getSelected(),
			itemID: this.$item.getSelected(),
			recipeID: this.$recipe.getSelected(),
			electricityTypeID: this.$electricityType.getSelected()
		});
	}
}