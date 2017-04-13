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
		var self = this;
		this.config = {
			rateUnit: 1,
			percision: 2
		}
		//this.dialog_settings = new Dialog_Settings();

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
	getRateText(rate){
		rate = this.round(rate) / this.config.rateUnit;
		return rate + this.rateLabel[this.config.rateUnit];
	}
	round(n){
		var factor = Math.pow(10, this.config.percision);
		return Math.round(n * factor)/factor;
	}
}

var db;
var settings;

var factory;
var dialog_machineSelect;
var dialog_newBuild;
var dialog_settings;

$(document).ready(function(){
	$.getJSON('data/Factorio/data.json', function(data){
		db = new DataBase(data);
		settings = new Settings();

		factory = new Factory();
		dialog_machineSelect = new Dialog_machineSelect();
		dialog_newBuild = new Dialog_newBuild();
		dialog_settings = new Dialog_Settings();

		var new_build = $('.btn#newBuild').button({
			label: "New Build",
			icon: 'ui-icon-circle-plus',
			showLabel: false
		}).click(function(e){
			dialog_newBuild.open(function(build){
				factory.newBuild(build);
			})
		});
		var set_settings = $('.btn#setSettings').button({
			label: 'New Build',
			icon: 'ui-icon-gear',
			showLabel: false
		}).click(function(e){
			self.dialog_settings.open(function(config){
				settings.updateSettings(config);
			});
		});
		var refresh_total = $('.btn#refreshTotal').button({
			label: 'Refresh Total',
			icon: 'ui-icon-arrowrefresh-1-s',
			showLabel: false
		}).click(function(e){
			factory.calcTotal();
		});

		var refresh
		DONE();
	});
});
