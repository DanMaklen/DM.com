/*
	name: noclose
	description: Prevent closing of opened nodes.
*/
(function ($, undefined) {
	'use strict';
	$.jstree.plugins.noclose = function () {
		this.close_node = $.noop;
	};
})(jQuery);
