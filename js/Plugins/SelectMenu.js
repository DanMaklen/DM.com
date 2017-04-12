class SelectMenu{
	_defWidget(){
		var self = this;
		$.widget('custom.SelectMenu', $.ui.selectmenu, {
			_renderItem: function(ul, item){
				var li = $('<li>');
				var div = self._ItemDiv(item.value);
				if(self.opt.style.compress){
					div.addClass('SelectMenu-item-compressed')
						.css({
							'padding-left': '0.25em',
							'padding-right': '0.25em',
						});
					li.addClass('SelectMenu-item-compressed');
				}

				var item = self.opt.items[item.value];
				if(item.hasOwnProperty('disabled') && item.disabled)
					li.addClass('SelectMenu-item-disabled');
				return li.append(div).appendTo(ul);
			},
			_renderButtonItem: function(item){
				if(item.value == null)
					return $('<div>', {text: '<<null>>'})
						.css({
							'color': 'transparent'
						})
						;

				return self._ItemDiv(item.value);
			},
			_renderMenu: function(ul, items){
				for(var i = 0; i < items.length; i++)
					this._renderItemData(ul, items[i]);
			},
			_resizeMenu: function(){
				var menu_width = this.menu.outerWidth();
				var widget_width = self.$.SelectMenu('widget').outerWidth();
				if(self.opt.style.compress)
					this.menu.outerWidth(widget_width);
				else
					this.menu.outerWidth(Math.max(menu_width, widget_width));
			}
		});
	}
	_ItemDiv(itemID){
		var div = $('<div>')
			.css({
				'text-align': this.opt.style.alignment
			})
			;
		if(this.opt.items[itemID].hasOwnProperty('label') && this.opt.items[itemID].label)
			div.text(this.opt.items[itemID].label);
		if(this.opt.items[itemID].hasOwnProperty('icon') && this.opt.items[itemID].icon)
			Icon.newIcon(this.opt.items[itemID].icon, {}, {
					width: this.opt.style.icon_size.width,
					height: this.opt.style.icon_size.height
				}).get$()
				.prependTo(div)
				.css({
					'margin-right': '0.5em'
				});
		return div;
	}
	_ItemOption(itemID){
		return $('<option>', {
			value: itemID
		});
	}

	constructor(id, options){
		var self = this;
		this.opt = $.extend(true, {
			parentSelector: '',
			style:{
				alignment: 'left',
				compress: false,
				icon_size: {
					width: '32px',
					height: '32px'
				}
			},
			items: {},

			change: function(item){}
		}, options);
		this.$ = $(this.opt.parentSelector+' .SelectMenu#'+id);
		this._defWidget();
		this.$.SelectMenu({
			icons: {
				button: 'ui-icon-blank'
			},
			width: 'auto',
			change: function(e, ui){
				return self.opt.change(ui.item.value);
			}
		})
		this.setItems(this.opt.items);
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
	}
	setItems(items){
		this.opt.items = items;
		this.$.SelectMenu(($.isEmptyObject(items)) ? 'disable' : 'enable');
		this.clearItems();
		for(var itemID in items) if(items.hasOwnProperty(itemID))
			this.$.append(this._ItemOption(itemID, items[itemID]));
		this.$.SelectMenu('refresh');
	}
	getSelectedItem(){
		return this.$.val()
	}
}
