class Icon{
	static gen(icon, overlay = {}, icon_size={}){
		overlay.main = icon;
		return new Icon($('<div>'), {
			style:{icon_size: icon_size},
			icon: overlay
		});
	}
	static getIconList(){
		return ['main', 'top_left', 'top_right', 'bottom_left', 'bottom_right'];
	}

	_init(main){
		this.$icon = {
			main: this.$,
			top_left: $('<div>'),
			top_right: $('<div>'),
			bottom_left: $('<div>'),
			bottom_right: $('<div>')
		};

		this.$icon.main
			.css({
				'width': this.opt.style.icon_size.width,
				'height': this.opt.style.icon_size.height
			})
			;
		this.$icon.top_left.appendTo(this.$icon.main)
			.addClass('Icon')
			.addClass('Icon-overlay')
			.addClass('Icon-top')
			.addClass('Icon-left')
			;
		this.$icon.top_right.appendTo(this.$icon.main)
			.addClass('Icon')
			.addClass('Icon-overlay')
			.addClass('Icon-top')
			.addClass('Icon-right')
			;
		this.$icon.bottom_left.appendTo(this.$icon.main)
			.addClass('Icon')
			.addClass('Icon-overlay')
			.addClass('Icon-bottom')
			.addClass('Icon-left')
			;
		this.$icon.bottom_right.appendTo(this.$icon.main)
			.addClass('Icon')
			.addClass('Icon-overlay')
			.addClass('Icon-bottom')
			.addClass('Icon-right')
			;
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
		this.icon_lst = Icon.getIconList();

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
