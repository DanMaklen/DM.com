class TabbedIconSelect{
	_initItem(itemID){
		return $('<div>')
			.attr('id', itemID)
			.addClass('TabbedIconSelect-icon')
			.addClass('TabbedIconSelect-selectable')
			.css({
				'width': this.opt.style.icon_size.width,
				'height': this.opt.style.icon_size.height,
				'margin': '0.2em',
				'background-image': 'url('+this.opt.getIcon_func(itemID)+')'
			});
	}
	_initSubCatigory(subCatigory){
		var subdiv = $('<div>');
		for(var i = 0; i < subCatigory.length; i++)
			this._initItem(subCatigory[i]).appendTo(subdiv);
		return subdiv;
	}
	_initCatigory(id, itemCatigory){
		this.$header.append(
			$('<li>').attr('id', 'header_'+id).append(
				$('<a>').attr('href', '#content_'+id).text(
					itemCatigory.label
				)
			)
		);

		var content = $('<div>').attr('id', 'content_'+id).appendTo(this.$content);
		for(var i = 0; i < itemCatigory.subCatigories.length; i++)
			this._initSubCatigory(itemCatigory.subCatigories[i]).appendTo(content)
	}
	_init(){
		for(var i = 0; i < this.opt.itemCatigories.length; i++)
			this._initCatigory(i, this.opt.itemCatigories[i])
	}

	constructor(id, options){
		var self = this;
		this.opt = $.extend({
			parentSelector: '',
			style:{
				icon_size:{
					width: '32px',
					height: '32px'
				}
			},
			itemCatigories: [],
			getIcon_func: function(itemID){return 'icon/missing.png';},
			change: function(itemID){}
		}, options);

		this.$ = $(this.opt.parentSelector+' .TabbedIconSelect#'+id);
		this.$header = this.$.find('.header');
		this.$content = this.$

		this._init();

		this.selected = null;
		$('.TabbedIconSelect-selectable').click(function(){
			$('.TabbedIconSelect-selectable#'+self.selectedID).removeClass('TabbedIconSelect-item-selected');
			$(this).addClass('TabbedIconSelect-item-selected');
			self.selectedID = $(this).attr('id');
			self.opt.change(self.selectedID);
		})

		this.$.tabs({
			event: 'click',
			heightStyle: 'content'
		})
	}

	getSelectedItem(){
		return this.selectedID;
	}
}
