class TabbedIconSelect{
	_initItem(itemID){
		return Icon.gen(this.opt.getIcon_func(itemID), {}, this.opt.style.icon_size).get$()
			.attr('id', itemID)
			.addClass('TabbedIconSelect-selectable')
			;
	}
	_initSubCategory(subCategory){
		var subdiv = $('<div>');
		for(var i = 0; i < subCategory.length; i++)
			this._initItem(subCategory[i]).appendTo(subdiv);
		return subdiv;
	}
	_initCategory(id, itemCategory){
		this.$header.append(
			$('<li>').attr('id', 'header_'+id).append(
				$('<a>').attr('href', '#content_'+id).text(
					itemCategory.label
				)
			)
		);

		var content = $('<div>').attr('id', 'content_'+id).appendTo(this.$content);
		for(var i = 0; i < itemCategory.subCategories.length; i++)
			this._initSubCategory(itemCategory.subCategories[i]).appendTo(content)
	}
	_init(){
		for(var i = 0; i < this.opt.itemCategories.length; i++)
			this._initCategory(i, this.opt.itemCategories[i])
	}

	constructor(div, options){
		var self = this;
		this.opt = $.extend({
			style:{
				icon_size:{
					width: '32px',
					height: '32px'
				}
			},
			itemCategories: [],

			getIcon_func: function(itemID){return 'icon/missing.png';},
			change: function(itemID){}
		}, options);

		this.$ = div;
		this.$header = this.$.find('.header');
		this.$content = this.$

		this._init();

		this.selected = null;
		self.$.find('.TabbedIconSelect-selectable').click(function(){
			self.$.find('.TabbedIconSelect-item-selected').removeClass('TabbedIconSelect-item-selected');
			$(this).addClass('TabbedIconSelect-item-selected');
			self.selectedID = $(this).attr('id');
			self.opt.change(self.selectedID);
		})

		this.$.tabs();
	}

	getSelectedItem(){
		return this.selectedID;
	}
}
