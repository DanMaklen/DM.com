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

	$('#navbar').jqxNavBar({
		height:30,
		theme:'DMSimpleGrey',
		selectedItem: curDoc
	});
	$('#loader').jqxLoader({
		theme: 'DMSimpleGrey',
		isModal: true
	});
	$('#navbar').on('change', function(){
		var ind = $(this).jqxNavBar('getSelectedIndex');
		if(curDoc != ind){
			$('#loader').jqxLoader('open');
			$('#frame').attr('src', doc[ind].src);
			document.title = 'DM.com: ' + doc[ind].title;
			curDoc = ind;
		}
		$('#frame').focus();
	});

});
function frame_loaded_event(){
	$('#loader').jqxLoader('close');
}
