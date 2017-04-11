function DONE(){if(parent.frame_loaded_event) parent.frame_loaded_event();}
function isArrayEqual(arr1, arr2){
	if(arr1.length != arr2.length) return false;
	for(var ind = 0; ind < arr1.length; ind++)
		if(arr1[ind] != arr2[ind])
			return false;
	return true;
}

class DataBase{
	constructor(data){
		this.data = data;
	}

	getItemLabel(itemID){
		if(!this.data.items.hasOwnProperty(itemID)) return '<<null>>';
		var item = this.data.items[itemID];
		if(item.hasOwnProperty('label') && item['label'])
			return item['label'];
		return 'MissingLabel'
	}
	getItemIcon(itemID){
		if(!this.data.items.hasOwnProperty(itemID)) return '';
		var item = this.data.items[itemID];
		if(item.hasOwnProperty('icon') && item['icon'])
			return item['icon'];
		return 'icon/missing.png'
	}

	getRecipeLabel(recipeID){
		if(!this.data.recipe.hasOwnProperty(recipeID)) return '<<null>>';
		var recipe = this.data.recipe[recipeID];
		if(recipe.hasOwnProperty('label') && recipe['label'])
			return recipe['label'];
		return this.getItemLabel(recipeID);
	}
	getRecipeIcon(recipeID){
		if(!this.data.recipe.hasOwnProperty(recipeID)) return '';
		var recipe = this.data.recipe[recipeID];
		if(recipe.hasOwnProperty('icon') && recipe['icon'])
			return recipe['icon'];
		return this.getItemIcon(recipeID) || 'icon/missing.png';
	}
}
class FactoryTree{
	constructor(id){
		var self = this;
		this.$tree = $('.tree#'+id).jstree({
			core:{
				themes:{
					stripes: true
				},
				check_callback: true
			},
			plugins:[
				// 'noclose'
			]
		});
		this.tree = this.$tree.jstree(true);
		this.root = this.tree.get_node('#');
		this.dummyNode = {text: 'dummyNode'};

		var self = this;
		this.$tree.on('click', '.jstree-default .jstree-leaf>.jstree-ocl', function(e){
			self.build(self.get_selected());
		})
		// this.$tree.on('open_node.jstree', function(e, data){ self.build(data.node)});
		// this.$tree.on('close_node.jstree', function(e, data){ self.destroy(data.node)});

	}

	// addToBuild(parent, build){
	// 	var node = this.tree.create_node(this.root, build);
	// 		//Adding dependencies:
	// 		this.tree.create_node(node, {text: '2/sec Iron Plate'});
	// 	this.tree.open_node(node);
	// }
	addToBuild(parent, node){
		this.tree.create_node(parent, node);
		this.tree.open_node(parent);
	}
	destroy(node){
		this.tree.delete_node(node.children);
		this.tree.create_node(node, this.dummyNode);
	}
}
class SelectTab{
	_addTab(id, tab){
		this.$header.append(
			$('<li>').attr('id', 'header_'+id).append(
				$('<a>').attr('href', '#content_'+id).text(
					tab.label
				)
			)
		);

		var content = $('<div>').attr('id', 'content_'+id).appendTo(this.$content);

		for(var ind=0; ind < tab.subCatigories.length; ind++){
			var subCatigories = tab.subCatigories[ind];
			var subdiv = $('<div>').appendTo(content);

			for(var i=0; i < subCatigories.length; i++){
				subdiv.append(
					$('<div>')
						.attr('id', subCatigories[i])
						.addClass('icon')
						.addClass('selectableItem')
						.css('background-image', 'url('+this.db.getItemIcon(subCatigories[i])+')')
				);
			}
		}
	}

	constructor(tab_id, db, opt){
		this.db = db;
		this.$tabs = $('.tabs#'+tab_id);
		this.$header = this.$tabs.find('.header');
		this.$content = this.$tabs;

		this.opt = $.extend({
			on_change: function(itemID){}
		}, opt);

		for(var i = 0; i < db.data.itemCatigories.length; i++)
			this._addTab(i, db.data.itemCatigories[i]);

		this.selectedID = null
		var self = this;
		$('.selectableItem').on('click', function(){
			$('.selectableItem#'+self.selectedID).removeClass('selectedItem');
			$(this).addClass('selectedItem');
			self.selectedID = $(this).attr('id');
			self.opt.on_change(self.selectedID);
		})

		this.$tabs.tabs({
			event: 'click',
			heightStyle: 'content'
		});
	}
}
class IconSelectMenu{
	_defWidget(){
		var db = this.db;
		var self = this;
		$.widget("custom.iconSelect", $.ui.selectmenu, {
			_renderItem: function(ul, item){
				var li = $('<li>');
				var div = self._newItemDiv({
					text: db.getRecipeLabel(item.value),
					icon: db.getRecipeIcon(item.value)
				}).css('padding', '0.5em 1em 0.5em 1em');
				return li.append(div).appendTo(ul);
			},
			_renderButtonItem: function(item){
				if(self.$select.iconSelect('option', 'disabled'))
					return $('<div>', {text: 'Please Select an Item'}).css('margin-right', '1.2em');
				return self._newItemDiv({
					text: db.getRecipeLabel(item.value),
					icon: db.getRecipeIcon(item.value)
				}).css('margin-right', '1.2em');
			}
		});
	}
	_newItemDiv(item){
		return $('<div>', {text: item.text}).prepend(
			$('<div>')
				.addClass('icon')
				.addClass('selectmenuIcon')
				.css('background-image', 'url('+item.icon+')')
				.css('margin-right', '0.5em')
		);
	}
	_newItem(itemID){
		return $('<option>', {value: itemID});
	}

	constructor(id, db){
		this.db = db;
		this.$select = $('.selectmenu#'+id);

		this._defWidget();
		this.$select.iconSelect({
			disabled: true,
			width: 'auto'
		});
	}

	setItems(item){
		this.$select.iconSelect((item.length == 0) ? 'disable' : 'enable');
		this.$select.find('option').remove();
		for(var i = 0; i < item.length; i++)
			this.$select.append(this._newItem(item[i]));
		this.$select.iconSelect('refresh');
	}
}

var db;
var factory_tree;

function createBuild(build){
	alert("Creating Build");
}

$(document).ready(function(){
	$.getJSON('data/Factorio/data.json', function(data){
		db = new DataBase(data);
		factory_tree = new FactoryTree('Build');

		initNewBuildDialog(createBuild);

		$('.btn#newBuild').button({
			label: "New Build",
			icon: 'ui-icon-circle-plus',
			showLabel: false
		});
		$('.btn#newBuild').click(function(){
			$('.dialog#newBuild').dialog('open');
		});

		DONE();
	});
});

function initNewBuildDialog(newBuild_func){
	function _getBuild(){
		return {};
	}
	var dialog = $('.dialog#newBuild').dialog({
		width: 'auto',
		autoOpen: false,
		modal: true,
		resizable: false,
		buttons: {
			'Add': function(){
				newBuild_func(_getBuild());
				$(this).dialog('close');
			},
			'Cancle': function(){
				$(this).dialog('close');
			}
		}
	});
	$('.dialog #BuildType').selectmenu({
		width: 'auto',
		change: function(e, ui){
			$('.dialog > fieldset > div').removeClass('ActiveBuildType');
			$('.dialog > fieldset > #' + ui.item.value).addClass('ActiveBuildType');
		}
	});
	var recipe_select = new IconSelectMenu('RecipeSelect', db);
	var item_select = new SelectTab('ItemSelect', db, {
		on_change: function(itemID){
			recipe_select.setItems(db.data.items[itemID].recipe);
		}
	});
}
