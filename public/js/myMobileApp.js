var myMobileApp = 
{
	init: function()
	{
		this.nav();
		
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
} 
