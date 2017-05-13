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
			recipeDifficulty: 'Normal'
		}

		this.rateLabel = {
			1: '/sec',
			60: '/min',
			3600: '/hour'
		};
	}

	updateSettings(config){
		this.config = $.extend(true, this.config, config);
	}

	getNormalizedRateValue(rate){
		return rate / this.config.rateUnit;
	}
	getRateLabel(){
		return this.rateLabel[this.config.rateUnit];
	}
	getRateValue(rate, round=true){
		var val = rate * this.config.rateUnit;
		if(round) val = this.round(val);
		return val;
	}
	getRateText(rate){
		return this.getRateValue(rate) + this.getRateLabel();
	}

	round(n){
		var factor = Math.pow(10, this.config.percision);
		return Math.round(n * factor)/factor;
	}
}

var factorio, settings;

var dialog_settings, dialog_newBuild, dialog_info;

var factory;

var toolbar;
var buildEdit;

$(document).ready(function(){
	$.getJSON('data/data.json', function(data){
		factorio = new Factorio(data);
		settings = new Settings();

		dialog_settings = new Dialog_Settings();
		dialog_newBuild = new Dialog_NewBuild();
		dialog_info = new Dialog_Info();
		factory = new Factory();

		toolbar = new Toolbar();
		buildEdit = new BuildEdit();

		DONE();

		return;
		var build = {
			rate: 1,
			itemID: 'WoodenChest',
			recipeID: 'WoodenChest',
			count: 1,
 			machineConfig: {
				machineID: "AssemblingMachine3",
				module: [
					"ProductivityModule3",
					"ProductivityModule3",
					"ProductivityModule3",
					"ProductivityModule3"
				]
			},
			beaconConfig: {
				count: 8,
				beaconID: 'Beacon',
				module: [
					'SpeedModule3',
					'SpeedModule3'
				]
			}
		}
		console.log('rate:', factorio.calcItemRate_Product(
			build.itemID,
			build.recipeID,
			build.count,
			build.machineConfig,
			build.beaconConfig
		));
		console.log('machineCount:', factorio.calcMachineCount_Product(
			build.rate,
			build.itemID,
			build.recipeID,
			build.machineConfig,
			build.beaconConfig
		));
	});
});
