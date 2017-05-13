class Toolbar{
	constructor(){
		this.$ = $('#Sidebar #Toolbar');

		this.$addBuild = this.$.find('#addBuild').button({
			icon: 'ui-icon-circle-plus',
			showLabel: false
		}).click(function(e){
			dialog_newBuild.open(function(build){
			 	factory.addBuild(build);
			});
		});

		this.$rmBuild = this.$.find('#rmBuild').button({
			icon: 'ui-icon-circle-minus',
			showLabel: false
		}).click(function(e){
			factory.deleteSelectedBuild();
		});

		this.$apply = this.$.find('#apply').button({
			disabled: true
		}).click(function(e){
			factory.updateSelectedBuild(buildEdit.getValue());
		});

		this.$info = this.$.find('#info').button({
			icon: 'ui-icon-info',
			showLabel: false
		}).click(function(e){
			dialog_info.open();
		});

		this.$settings = this.$.find('#settings').button({
			icon: 'ui-icon-gear',
			showLabel: false
		}).click(function(e){
			self.dialog_settings.open(function(config){
				settings.updateSettings(config);
				factory.redraw();
				buildEdit.syncWithSettings();
			});
		});
	}
}
