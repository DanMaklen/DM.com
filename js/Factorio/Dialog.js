class Dialog_Settings{
	_init(){
		this.$rateUnit = new SelectMenu(this.$.find('#RateUnit'), {
			items: {
				1: {label: '/sec'},
				60: {label: '/min'},
				3600: {label: '/hour'}
			},
			default: 1
		});
		this.$percision = new SelectMenu(this.$.find('#Percision'), {
			items: {
				0: {label: 1},
				1: {label: 0.1},
				2: {label: 0.01},
				3: {label: 0.001},
				4: {label: 0.0001}
			},
			default: 2
		});
		this.$crudeOilYield = new Spinner(this.$.find('#CrudeOilYield'), {
			min: 0,
			default: 0.1
		});
		this.$crudeOilYieldUnit = new SelectMenu(this.$.find('#CrudeOilYieldUnit'), {
			items: {
				1: {label: '/sec'},
				60: {label: '/min'},
				3600: {label: '/hour'}
			},
			default: 1
		});
		this.$recipeDifficulty = new SelectMenu(this.$.find('#RecipeDifficulty'), {
			items: {'normal': {label: 'Normal'}},
			default: 'normal'
		});
		this.$scienceDifficulty = new SelectMenu(this.$.find('#ScienceDifficulty'), {
			items: {'normal': {label: 'Normal'}},
			default: 'normal'
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
				'Apply': function(){self._OK();},
				'Cancle': function(){self.$.dialog('close');}
			}
		});
		this._init();
	}

	_OK(){
		var val = this.getVal();
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
	getVal(){
		return this._validate({
			rateUnit: this.$rateUnit.getSelected(),
			percision: this.$percision.getSelected(),
			crudeOilYield: this.$crudeOilYield.getValue() * this.$crudeOilYieldUnit.getSelected(),
			recipeDifficulty: this.$recipeDifficulty.getSelected(),
			scienceDifficulty: this.$scienceDifficulty.getSelected()
		});
	}
}

class Dialog_NewBuild{
	_init(){
		var self = this;
		this.buildType = new SelectMenu(this.$.find('#BuildType'), {
			items: {
				'itemBuild': {label: 'Item Build'},
				'oilBuild': {label: 'Oil Build'},
				'electricityBuild': {
					label: 'Electricity Build',
					disabled: true
				},
				'scienceBuild': {
					label: 'Science Build',
					disabled: true
				}
			},
			default: 'itemBuild',
			change: function(buildTypeID){
				self.$.find('.ActiveBuildForm').removeClass('ActiveBuildForm');
				self.$.find('#'+buildTypeID).addClass('ActiveBuildForm');
			}
		});

		console.log(factorio.getItemCategories());
		//Item Build:
			this.item_select = new TabbedIconSelect(this.$.find('#ItemSelect'), {
				itemCategories: factorio.getItemCategories(),
				getIcon_func: function(itemID){return factorio.getIcon('item', itemID);}
			});
		//Oil Build:

	}
	constructor(){
		var self = this;
		this.callback = function(val){};
		this.$ = $('.dialog#NewBuild').dialog({
			width: 'auto',
			autoOpen: false,
			modal: true,
			resizable: false,
			buttons: {
				'Apply': function(){self._OK();},
				'Cancle': function(){self.$.dialog('close');}
			}
		});
		this._init();
	}

	_OK(){
		var val = this.getVal();
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
	getVal(){
		return this._validate({
			rateUnit: this.$rateUnit.getSelected(),
			percision: this.$percision.getSelected(),
			crudeOilYield: this.$crudeOilYield.getValue() * this.$crudeOilYieldUnit.getSelected(),
			recipeDifficulty: this.$recipeDifficulty.getSelected(),
			scienceDifficulty: this.$scienceDifficulty.getSelected()
		});
	}
}
