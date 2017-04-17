class Icon{
	static gen(icon, overlay = {}, icon_size={}){
		overlay.main = icon;
		return new Icon($('<div>'), {
			style:{icon_size: icon_size},
			icon: overlay
		});
	}

	_init(main){
		this.$icon = {
			main: this.$
				.css({
					'width': this.opt.style.icon_size.width,
					'height': this.opt.style.icon_size.height
				}),
			top_left: $('<div>').appendTo(this.$main)
				.addClass('Icon')
				.addClass('Icon-overlay')
				.addClass('Icon-top')
				.addClass('Icon-left'),
			top_right: $('<div>').appendTo(this.$main)
				.addClass('Icon')
				.addClass('Icon-overlay')
				.addClass('Icon-top')
				.addClass('Icon-right'),
			bottom_left: $('<div>').appendTo(this.$main)
				.addClass('Icon')
				.addClass('Icon-overlay')
				.addClass('Icon-bottom')
				.addClass('Icon-left'),
			bottom_right: $('<div>').appendTo(this.$main)
				.addClass('Icon')
				.addClass('Icon-overlay')
				.addClass('Icon-bottom')
				.addClass('Icon-right')
		};
	}
	_renderIconAt(pos, icon){
		this.$icon[pos].css('background-image', 'url('+(icon||'')+')');
	}
	_renderIcon(){
		for(var i = 0; i < this.icon_lst.length; i++)
			this._renderIconAt(this.icon_lst[i], this.opt.icon[this.icon_lst[i]]);
	}

	constructor(div, options){
		this.opt = $.extend(true, {
			style:{
				icon_size:{
					width: '32px',
					height: '32px'
				}
			},
			icon: {
				main: null,
				top_left: null,
				top_right: null,
				bottom_left: null,
				bottom_right: null
			}
		}, options);
		this.icon_lst = ['main', 'top_left', 'top_right', 'bottom_left', 'bottom_right'];

		this.$ = div.addClass('Icon');
		this._init();

		this._renderIcon();
	}

	setIconAt(ind, icon){
		var pos = ind;
		if(!this.opt.icon.hasOwnProperty(ind))
			pos = map[ind];
		this.opt.icon[pos] = icon;
		this._renderIconAt(pos, icon);
	}
	setIcon(icon = {}){
		this.opt.icon = $.extend(this.opt.icon, icon);
		this._renderIcon();
	}

	get$(){
		return this.$;
	}
	getHTML(){
		return this.$[0].outerHTML;
	}
}
