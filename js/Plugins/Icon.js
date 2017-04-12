class Icon{
	static newIcon(icon, overlay = {}, icon_size={}){
		overlay.main = icon;
		return new Icon('', {
			style:{
				icon_size: icon_size
			},
			icon: overlay
		}, true)
	}

	_init(main){
		this.$main = this.$
			.css({
				'width': this.opt.style.icon_size.width,
				'height': this.opt.style.icon_size.height
			});
		this.$top_left = $('<div>').appendTo(this.$main)
			.addClass('Icon')
			.addClass('Icon-overlay')
			.addClass('Icon-top')
			.addClass('Icon-left')
			;
		this.$top_right = $('<div>').appendTo(this.$main)
			.addClass('Icon')
			.addClass('Icon-overlay')
			.addClass('Icon-top')
			.addClass('Icon-right')
			;
		this.$bottom_left = $('<div>').appendTo(this.$main)
			.addClass('Icon')
			.addClass('Icon-overlay')
			.addClass('Icon-bottom')
			.addClass('Icon-left')
			;
		this.$bottom_right = $('<div>').appendTo(this.$main)
			.addClass('Icon')
			.addClass('Icon-overlay')
			.addClass('Icon-bottom')
			.addClass('Icon-right')
			;
	}
	_renderIcon(){
		this.$main.css('background-image', 'url('+(this.opt.icon.main||'')+')');
		this.$top_left.css('background-image', 'url('+(this.opt.icon.top_left||'')+')');
		this.$top_right.css('background-image', 'url('+(this.opt.icon.top_right||'')+')');
		this.$bottom_left.css('background-image', 'url('+(this.opt.icon.bottom_left||'')+')');
		this.$bottom_right.css('background-image', 'url('+(this.opt.icon.bottom_right||'')+')');
	}

	constructor(id, options, newInstance = false){
		this.opt = $.extend(true, {
			parentSelector: null,
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

		if(newInstance){
			this.$ = $('<div>')
				.attr('id', id)
				.addClass('Icon')
				;
			if(this.opt.parentSelector)
				$(this.opt.parentSelector).append(this.$);
		}
		else
			this.$ = $(this.opt.parentSelector+' .Icon#'+id);
		this._init();
		this._renderIcon();
	}

	setIconAt(ind, icon){
		var map = ['main', 'top_left', 'top_right', 'bottom_left', 'bottom_right'];
		if(!this.opt.icons.hasOwnProperty(ind))
			ind = map[ind];
		this.opt.icon[ind] = icon;
		_renderIcon()
	}
	setIcon(icon = {}){
		this.opt = $.merge(this.opt.icon, icon);
		_renderIcon();
	}

	get$(){
		return this.$;
	}
	getHTML(){
		return this.$[0].outerHTML;
	}
}
