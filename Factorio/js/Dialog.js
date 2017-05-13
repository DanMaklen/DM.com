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
		this.$recipeDifficulty = new SelectMenu(this.$.find('#RecipeDifficulty'), {
			items: {
				'Normal': {label: 'Normal'},
				'Expensive': {label: 'Expensive'}
			},
			default: settings.config.recipeDifficulty
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
			percision: this.$percision.getSelected(),
			recipeDifficulty: this.$recipeDifficulty.getSelected()
		});
	}
}

class Dialog_NewBuild{
	_init(){
		var self = this;
		this.$buildType = new SelectMenu(this.$.find('#BuildType'), {
			items: {
				'itemBuild': {label: 'Item Build'},
				'recipeBuild': {label: 'Recipe Build'},
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

				self.$.dialog('option', 'position', { my: "center", at: "center", of: window});
			}
		});

		//Item Build:
		this.$item = new TabbedIconSelect(this.$.find('#itemBuild #Item'), {
			itemCategories: factorio.getItemCategory(),
			getIcon_func: function(itemID){return factorio.getIcon('item', itemID);},
			changeTab: function(tabID){
				self.$.dialog('option', 'position', { my: "center", at: "center", of: window});
			}
		});

		//Recipe Build:
		this.$recipe = new TabbedIconSelect(this.$.find('#recipeBuild #Recipe'), {
			itemCategories: factorio.getRecipeCategory(),
			getIcon_func: function(recipeID){return factorio.getIcon('recipe', recipeID);},
			changeTab: function(tabID){
				self.$.dialog('option', 'position', { my: "center", at: "center", of: window});
			}
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
		if(val.buildTypeID != 'recipeBuild') val.recipeID = null;
		return val;
	}
	getValue(){
		return this._validate({
			buildTypeID: this.$buildType.getSelected(),
			itemID: this.$item.getSelected(),
			recipeID: this.$recipe.getSelected()
		});
	}
}

class Dialog_Info{
	_init(){
		this.$product = this.$.find('#Product');
		this.$ingredient = this.$.find('#Ingredient');
	}
	constructor(){
		var self = this;
		this.$ = $('.dialog#info').dialog({
			width: 'auto',
			autoOpen: false,
			modal: true,
			resizable: false,
			draggable: false,
			buttons: {
				'Okay': function(){self.$.dialog('close');}
			}
		});
		this._init();
	}

	open(){
		this.clear();
		this.setTotalRate(factory.calcTotalRate());
		this.$.dialog('open');
	}

	clear(){
		this.$product.empty();
		this.$ingredient.empty();
	}
	_add(parent, itemID, rate){
		$('<div>')
			.append(settings.getRateText(rate))
			.append(Icon.gen(factorio.getIcon('item', itemID)).get$())
			.appendTo(parent)
			.css({
				'display': 'inline',
				'margin-right': '0.1em',
				'margin-left': '0.1em'
			})
			;
	}
	setTotalRate(rate){
		for(var itemID in rate) if(rate.hasOwnProperty(itemID))
				 if(rate[itemID] > 0) this._add(this.$product, itemID, rate[itemID]);
			else if(rate[itemID] < 0) this._add(this.$ingredient, itemID, -rate[itemID]);
	}
}
