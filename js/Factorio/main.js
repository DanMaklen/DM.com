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

var factorio, settings;

var dialog_settings, dialog_newBuild;

var factory;

var toolbar;
var buildEdit;

$(document).ready(function(){
	$.getJSON('data/Factorio/data.json', function(data){
		factorio = new Factorio(data);
		settings = new Settings();

		dialog_settings = new Dialog_Settings();
		dialog_newBuild = new Dialog_NewBuild();

		factory = new Factory();

		toolbar = new Toolbar();
		buildEdit = new BuildEdit();

		DONE();
	});
});
