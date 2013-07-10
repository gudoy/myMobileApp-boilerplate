var app = $.extend(app || {}, 
{
	init: function()
	{
		// Prepage page (sniff browser, platform, os ..., handle orientation, ...)
		this.prepare();
		
		// Init navigation
		this.nav();
		
		// Fix content with scrollable overflow if necessary
		this.fixScroll('#headerHeader');
		
		// Cache the current page & it's id
		this.$page = $('body').children('.page.current');
		this.pgid = this.$page.data('controller') || this.$page.attr('id') || '';
		
		// 
		if ( typeof this[this.pgid] !== 'undefined' && this[this.pgid].init !== 'function' 
			//&& (typeof this[this.pgid].inited === 'undefined' || !this[this.pgid].inited) 
		)
		{
			this[this.pgid].init.apply(this[this.pgid]); 
			this[this.pgid].inited = true;
			
			//if ( this.pgid !== 'index' ){ $('html').removeClass('loading'); }
			$('html').removeClass('loading');
		}
		else
		{
			$('html').removeClass('loading');
		}
		
		return this;
	},
	
	nav: function()
	{
		var $header = $('#header');
		
		$(document).on('click', '.menuAction', function(e)
		{
			e.preventDefault();
			
			$header[ $header.hasClass('active') ? 'removeClass' : 'addClass' ]('active');
		})
		
		return this;
	}
});
