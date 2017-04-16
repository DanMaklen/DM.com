class Toolbar{
	constructor(){
		this.$ = $('#Sidebar #Toolbar');

		this.$.find('#newBuild').button({
			icon: 'ui-icon-circle-plus',
			showLabel: false
		}).click(function(e){
			dialog_newBuild.open(function(build){
			 	factory.newBuild(build);
			});
		});

		this.$.find('#Apply').button().click(function(e){});

		this.$.find('#rmBuild').button({
			icon: 'ui-icon-circle-minus',
			showLabel: false
		}).click(function(e){});

		this.$.find('#Settings').button({
			icon: 'ui-icon-gear',
			showLabel: false
		}).click(function(e){
			self.dialog_settings.open(function(config){
				//settings.updateSettings(config);
			});
		});

		// this.$.find('#refreshTotal').button({
		// 	label: 'Refresh Total',
		// 	icon: 'ui-icon-arrowrefresh-1-s',
		// 	showLabel: false
		// }).click(function(e){
		// 	// factory.calcTotal();
		// });
	}
}
