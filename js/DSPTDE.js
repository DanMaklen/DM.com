var tree = [
	{
		label: "Item 1", expanded: true, items: [
	    	{ label: "Item 1.1" },
	        { label: "Item 1.2", selected: true }
	    ]
	},
	{ label: "Item 2" },
	{ label: "Item 3" },
	{ label: "Item 4", items: [
			{ label: "Item 4.1" },
			{ label: "Item 4.2" }
		]
	},
	{ label: "Item 5" },
	{ label: "Item 6" },
	{ label: "Item 7" }
];
$(document).ready(function(){
	$('.accordion').jqxNavigationBar({
		arrowPosition: 'center',
		showArrow: false,
		expandMode: 'toggle',
		initContent: function(e){
			console.log('yoyoyo');
			// console.log(e);
			$('#StartingSets').jqxTree({
				height: '300px',
				source: tree,
				checkboxes: true,
				hasThreeStates: true,
				easing:'swing'
			});
		}
	});
	// $('#StartingSets').jqxTree({
	// 	height: '300px',
	// 	source: tree,
	// 	checkboxes: true,
	// 	hasThreeStates: true,
	// 	easing:'swing'
	// });
});
