class SelectMenu{
	_defWidget(){
		var self = this;
		$.widget('custom.SelectMenu', $.ui.selectmenu, {
			_renderItem: function(parent, item){
				var li = $('<li>');
				var div = self._genItemDiv(item.value);
				var item = self.opt.items[item.value];
				if(item.hasOwnProperty('disabled') && item.disabled)
					li.addClass('SelectMenu-item-disabled');

				return li.append(div).appendTo(parent);
			},
			_renderButtonItem: function(item){
				if(item.value == null)
					return $('<div>', {text: '<<null>>'})
						.css({
							'color': 'transparent'
						})
						;

				return self._genItemDiv(item.value);
			},
			_renderMenu: function(ul, items){
				for(var i = 0; i < items.length; i++)
					this._renderItemData(ul, items[i]);
			},
			_resizeMenu: function(){
				var menu_width = this.menu.outerWidth();
				var widget_width = self.$.SelectMenu('widget').outerWidth();
				this.menu.outerWidth(Math.max(menu_width, widget_width));
			}
		});
	}
	_genItemDiv(itemID){
		var div = $('<div>').css('text-align', this.opt.style.alignment);
		var item = this.opt.items[itemID];
		if(item.hasOwnProperty('label') && item.label)
			div.text(item.label);
		if(item.hasOwnProperty('icon') && item.icon)
			Icon.gen(item.icon, {}, this.opt.icon_size).get$().prependTo(div).css('margin-right', '0.5em');
		return div;
	}
	_genItemOption(itemID){
		return $('<option>', {value: itemID});
	}

	constructor(select, options){
		var self = this;
		this.opt = $.extend(true, {
			style:{
				alignment: 'center',
				icon_size: {
					width: '32px',
					height: '32px'
				}
			},
			items: {},
			default: null,

			change: function(item){}
		}, options);

		this.$ = select;

		this._defWidget();
		this.$.SelectMenu({
			icons: {button: 'ui-icon-blank'},
			width: 'auto',
			position: {collision: 'fit'},
			change: function(e, ui){return self.opt.change(ui.item.value);}
		})
		this.setItems(this.opt.items);
		if(this.opt.default) this.setSelected(this.opt.default);
	}

	enable(){
		this.$.SelectMenu('enable');
	}
	disable(){
		this.$.SelectMenu('disable');
	}
	isDisabled(){
		return this.$.SelectMenu('option', 'disabled');
	}
	clearItems(){
		this.$.empty();
		this.$.SelectMenu('disable');
		this.$.SelectMenu('refresh');
	}
	setItems(items){
		this.opt.items = items;
		this.$.SelectMenu(($.isEmptyObject(items)) ? 'disable' : 'enable');
		//Possibile Optimization: Instead of removing all then adding all, change first elements then add/remove the rest
		this.$.empty();
		for(var itemID in items) if(items.hasOwnProperty(itemID))
			this.$.append(this._genItemOption(itemID, items[itemID]));
		this.$.SelectMenu('refresh');
	}
	getSelected(){
		return this.$.val()
	}
	setSelected(id){
		this.$.val(id);
		this.$.SelectMenu('refresh');
	}

	onchange(callback){
		this.opt.change = callback;
	}
}
