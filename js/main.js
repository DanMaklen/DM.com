var doc = [
	{
		title: 'Dark Souls PTDE',
		src: 'DSPTDE.html'
	},
	{
		title: 'Factorio',
		src: 'Factorio.html'
	}
];
var curDoc = -1;

$(document).ready(function(){
	var navbar = $('#navbar');

	navbar.jqxNavBar({
		height:30,
		theme:'DMSimpleGrey',
		selectedItem: curDoc
	});
	navbar.on('change', function(){
		var ind = navbar.jqxNavBar('getSelectedIndex');
		if(curDoc != ind){
			$("#frame").attr('src', doc[ind].src);
			document.title = "DM.com: " + doc[ind].title;
			curDoc = ind;
		}
	});
});
