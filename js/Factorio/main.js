function DONE(){if(parent.frame_loaded_event) parent.frame_loaded_event();}
function mergeInto_byAddition(obj1, obj2){
	if(!obj1 || !obj2) return obj1 || {};
	for(var key in obj2) if(obj2.hasOwnProperty(key))
		if(obj1.hasOwnProperty(key))
			obj1[key] += obj2[key];
		else
			obj1[key] = obj2[key];
	return obj1;
}

class Settings{
	constructor(){
		this.config = {
			rateUnit: 1,
			percision: 2,

			crudeOilYield: 0.1,

			recipeDifficulty: 'normal',
			scienceDifficulty: 'normal'
		}

		this.rateLabel = {
			1: '/sec',
			60: '/min',
			3600: '/hour'
		};
	}

	updateSettings(config){
		this.config = $.extend(true, this.config, config);
		factory.redrawAll();
	}

	getRateLabel(){
		return this.rateLabel[this.config.rateUnit];
	}
	getRateValue(rate){
		return this.round(rate / this.config.rateUnit);
	}
	getRateText(rate){
		return this.getRateValue(rate) + this.getRateLabel();
	}
	round(n){
		var factor = Math.pow(10, this.config.percision);
		return Math.round(n * factor)/factor;
	}
}

class Control{
	_gen_SelectMenuItems(lst, isRecipe){
		var ret = {};
		for(var i = 0; i < lst.length; i++){
			var recipeID = lst[i];

			ret[recipeID] = {
				label: null,
				icon: null
			};

			if(isRecipe) ret[recipeID].label = db.getRecipeLabel(recipeID, true);
			else ret[recipeID].label = db.getItemLabel(recipeID, true);

			if(isRecipe) ret[recipeID].icon = db.getRecipeIcon(recipeID, true);
			else ret[recipeID].icon = db.getItemIcon(recipeID, true);
		}
		return ret;
	}
	_module_select_items(){
		return {
			"noModule": {icon: 'icon/blank.png'},
			"SpeedModule1": {icon: db.getItemIcon('SpeedModule1')},
			"SpeedModule2": {icon: db.getItemIcon('SpeedModule2')},
			"SpeedModule3": {icon: db.getItemIcon('SpeedModule3')},

			"ProductivityModule1": {icon: db.getItemIcon('ProductivityModule1')},
			"ProductivityModule2": {icon: db.getItemIcon('ProductivityModule2')},
			"ProductivityModule3": {icon: db.getItemIcon('ProductivityModule3')},

			"EfficiencyModule1": {icon: db.getItemIcon('EfficiencyModule1')},
			"EfficiencyModule2": {icon: db.getItemIcon('EfficiencyModule2')},
			"EfficiencyModule3": {icon: db.getItemIcon('EfficiencyModule3')}
		}
	}
	_beacon_module_select_items(){
		return {
			"noModule": {icon: 'icon/blank.png'},
			"SpeedModule1": {icon: db.getItemIcon('SpeedModule1')},
			"SpeedModule2": {icon: db.getItemIcon('SpeedModule2')},
			"SpeedModule3": {icon: db.getItemIcon('SpeedModule3')},
			"EfficiencyModule1": {icon: db.getItemIcon('EfficiencyModule1')},
			"EfficiencyModule2": {icon: db.getItemIcon('EfficiencyModule2')},
			"EfficiencyModule3": {icon: db.getItemIcon('EfficiencyModule3')}
		}
	}

	_newSelectMenu(id, items={}, appendParentSelector=''){
		var ret = new SelectMenu(id, {
			parentSelector: this.parentSelector + ' ' + appendParentSelector,
			style: {
				alignment: 'center'
			},
			items: items
		});
		ret.disable();
		return ret;
	}
	_newSpinner(id){
		return $(this.parentSelector+' .spinner#'+id).spinner({
			min: 1,
			disabled: true
		});
	}

	_initControl(){
		this.rate = this._newSpinner('Rate').spinner('option', 'min', 0);
		this.rateLabel = $(this.parentSelector + ' #RateLabel').text(settings.getRateLabel() + ' ');
		this.recipeSelect = this._newSelectMenu('recipeSelect');

		this.machineCount = this._newSpinner('machineCount');
		this.machineSelect = this._newSelectMenu('machineSelect');
		this.machineModule = [
			this._newSelectMenu('module1', this._module_select_items(), '#Machine'),
			this._newSelectMenu('module2', this._module_select_items(), '#Machine'),
			this._newSelectMenu('module3', this._module_select_items(), '#Machine'),
			this._newSelectMenu('module4', this._module_select_items(), '#Machine')
		]

		this.beaconCount = this._newSpinner('beaconCount').spinner('option', 'min', 0);
		this.beaconModule = [
			this._newSelectMenu('module1', this._module_select_items(), '#Beacon'),
			this._newSelectMenu('module2', this._module_select_items(), '#Beacon')
		]
	}

	_recipe_onchange(recipeID){
		this.machineCount.spinner('enable');
		this.machineSelect.setItems(this._gen_SelectMenuItems(db.getRecipe(recipeID).machine));
		this._machine_onchange(this.machineSelect.getSelectedItem());
	}
	_machine_onchange(machineID){
		var machineModuleSlots = db.getItem(machineID).production.moduleSlots;
		for(var i = 0; i < 4; i++)
			if(i < machineModuleSlots) this.machineModule[i].enable();
			else this.machineModule[i].disable();

		if(machineModuleSlots > 0){
			this.beaconCount.spinner('enable');
			for(var i = 0; i < 2; i++) this.beaconModule[i].enable();
		}
		else {
			this.beaconCount.spinner('disable');
			for(var i = 0; i < 2; i++) this.beaconModule[i].disable();
		}
	}
	_hookEvents(){
		var self = this;
		this.recipeSelect.onchange(function(recipeID){self._recipe_onchange(recipeID);});
		this.machineSelect.onchange(function(machineID){self._machine_onchange(machineID)});
	}

	constructor(){
		this.parentSelector = '#sidebar #Control #machineConfig';
		this.build = null;



		this._initControl();
		this._hookEvents();
	}

	_disable_machine(){

	}
	disable(){
		this.rate.spinner('disable');
		this.recipeSelect.disable();

		this.machineCount.spinner('disable');
		this.machineSelect.disable();
		for(var i = 0; i < 4; i++) this.machineModule[i].disable();

		this.beaconCount.spinner('disable');
		for(var i = 0; i < 2; i++) this.beaconModule[i].disable();
	}

	setBuild(build){
		this.build = build;
		if(!build) {
			this.disable();
			return;
		}

		this.rate.spinner('value', settings.getRateValue(build.rate));
		if(build.itemID){
			this.rate.spinner('enable');
			this.recipeSelect.setItems(this._gen_SelectMenuItems(db.getItem(build.itemID).recipe, true));
		}
		else if(build.recipeID){
			this.rate.spinner('disable');
			this.recipeSelect.setItems(this._gen_SelectMenuItems([build.recipeID], true));
		}
		if(build.recipeID){
			this.recipeSelect.setSelectedItem(build.recipeID);
			this.machineSelect.setItems(this._gen_SelectMenuItems(db.getRecipe(build.recipeID).machine, false));
		}
		else{
			this.machineSelect.setItems(
				this._gen_SelectMenuItems(db.getRecipe(this.recipeSelect.getSelectedItem()).machine, false)
			);
		}

		this.machineCount.spinner('value', build.machineCount).spinner('enable');

		var machineID = build.machineConfig.machineID;
		if(build.machineConfig.machineID) this.machineSelect.setSelectedItem(build.machineConfig.machineID);
		else machineID = this.machineSelect.getSelectedItem();

		var machineModuleSlots = db.getItem(machineID).production.moduleSlots;

		for(var i = 0; i < 4; i++){
			if(i < machineModuleSlots) this.machineModule[i].enable();
			else this.machineModule[i].disable();
			if(build.machineConfig.module[i])
				this.machineModule[i].setSelectedItem(build.machineConfig.module[i]);
		}

		this.beaconCount.spinner('value', build.machineConfig.beacon.count);
		for(var i = 0; i < 2; i++)
			if(build.machineConfig.beacon.module[i])
				this.beaconModule[i].setSelectedItem(build.machineConfig.beacon.module[i]);
		if(machineModuleSlots > 0){
			this.beaconCount.spinner('enable');
			for(var i = 0; i < 2; i++) this.beaconModule[i].enable();
		}
		else {
			this.beaconCount.spinner('disable');
			for(var i = 0; i < 2; i++) this.beaconModule[i].disable();
		}

	}
	updateDisplay(){
		//for when settings change
	}
}

var db;
var settings;

var dialog_settings;

var dialog_newBuild;

var control;
var factory;
var dialog_machineSelect;

$(document).ready(function(){
	$.getJSON('data/Factorio/data.json', function(data){
		db = new DataBase(data);
		settings = new Settings();

		dialog_settings = new Dialog_Settings();

		var toolbar = new Toolbar();

		//factory = new Factory();
		//control = new Control();
		//dialog_machineSelect = new Dialog_machineSelect();
		//dialog_newBuild = new Dialog_newBuild();
		//dialog_settings = new Dialog_Settings();

		DONE();
	});
});
