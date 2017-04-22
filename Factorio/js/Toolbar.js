class Toolbar{
	constructor(){
		this.$ = $('#Sidebar #Toolbar');

		this.$newBuild = this.$.find('#newBuild').button({
			icon: 'ui-icon-circle-plus',
			showLabel: false
		}).click(function(e){
			dialog_newBuild.open(function(build){
			 	factory.newBuild(build);
			});
		});

		this.$apply = this.$.find('#apply').button({
			disabled: true
		}).click(function(e){
			factory.updateSelectedBuild(buildEdit.getValue());
		});

		this.$rmBuild = this.$.find('#rmBuild').button({
			icon: 'ui-icon-circle-minus',
			showLabel: false
		}).click(function(e){
			factory.deleteSelectedBuild();
		});

		this.$settings = this.$.find('#settings').button({
			icon: 'ui-icon-gear',
			showLabel: false
		}).click(function(e){
			self.dialog_settings.open(function(config){
				settings.updateSettings(config);
				factory.redraw();
			});
		});
	}
}
