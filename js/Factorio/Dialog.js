class Dialog_Settings{
	_validate(val){

	}
	_getVal(){

	}
	_OK(){
		var val = this._validate(this._getVal());
		if(val){
			if(this.callback) this.callback(val);
			this.$.dialog('close');
		}
		else alert('Missing Info');
	}

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
		this.$ = $('#Settings').dialog({
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

	open(callback=function(val){}){
		this.callback = callback;
		this.$.dialog('open');
	}
}
