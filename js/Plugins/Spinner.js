class Spinner{
	constructor(input, options){
		var self = this;
		this.opt = $.extend(true, {
			default: 0,
			min: null,
			max: null,
			step: 'any',

			change: function(val){}
		}, options);

		this.$ = input.attr({
			type: 'number',
			min: this.opt.min,
			max: this.opt.max,
			step: this.opt.step,
			value: this.opt.default
		}).addClass('Spinner').change(function(e, v){self.opt.change(self.$.val());});
	}

	getValue(){
		return this.$.val();
	}
	setValue(val){
		return this.$.val(val);
	}

	onchange(callback){
		this.opt.change = callback;
	}
}
