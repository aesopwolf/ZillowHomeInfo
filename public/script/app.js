var address_search_bar;

function initialize() {
	address_search_bar = $('#address_search_bar').geocomplete({ 
		types: ['geocode'] 
	});

	bindEvents();
}

function bindEvents() {
	address_search_bar.bind("geocode:result", function(event, result){
		$('#error_pane').hide();
		$('#landing_pane').hide();
		$('#info_pane').css('display','flex');

		var address = processAddress(result);
		displayAddress(address);

		$.getJSON('/getSearchResults', address)
			.done(function( json ) {
				displayAddressData(json);
			});
	});

	address_search_bar.bind("geocode:error", function(event, result){
		$('#error_pane').text('Please enter a full address.').show();
	});

	$('#search').on('click', function() {
		address_search_bar.trigger('geocode');
	});
}

function displayAddressData(addr_data) {
	console.log(addr_data.error.code);
	console.log(addr_data);
	if(addr_data.error.code != 0) {
		//display error

	} else {
		//zestimate data
		$('#zestimate_date > span.date').text(addr_data.zestimate.last_updated);
		$('#zestimate_low > span.value')
			.text(numeral(addr_data.zestimate.prices.low).format('$0,0'));
		$('#zestimate_current > span.value')
			.text(numeral(addr_data.zestimate.prices.current).format('$0,0'));
		$('#zestimate_high > span.value')
			.text(numeral(addr_data.zestimate.prices.high).format('$0,0'));

		//calc width of bar... this is currently usesless (needs to be changed)
		var width = $('#zestimate').innerWidth() * 
			(Math.abs(addr_data.zestimate.prices.change) / addr_data.zestimate.prices.current);

		console.log(addr_data.zestimate.prices.change);

		if(width < 100)
			width = 100;
console.log(parseInt(addr_data.zestimate.prices.change) > 0);
		if(parseInt(addr_data.zestimate.prices.change) > 0){
			$('#zestimate_mv_pos').show();
			$('#zestimate_mv_pos').width(width);
			$('#zestimate_mv_pad').width(width);
			$('#zestimate_mv_neg').hide();
			$('#zestimate_mv_pos').text(
					numeral(addr_data.zestimate.prices.change).format('$0,0'));
		} else {
			$('#zestimate_mv_pos').hide();
			$('#zestimate_mv_pad').width(width);
			$('#zestimate_mv_neg').width(width);
			$('#zestimate_mv_neg').show();
			$('#zestimate_mv_neg').text(
					numeral(addr_data.zestimate.prices.change).format('+$0,0'));
		}

	}
}

function processAddress(place) {
	var address_obj = {
		street_number: ""
			, route: ""
			, city: ""
			, state: ""
			, zip: ""
	};
	//place address_components are annoying to grab, organizing...
	//line1 is street_num and route,
	//line2 is city, state, and zip

	for(var i = 0; i < place.address_components.length; i++) {
		var comp = place.address_components[i];

		if(comp.types[0] == "street_number")
			address_obj.street_number = comp.short_name;
		else if(comp.types[0] == "route")
			address_obj.route = comp.short_name;
		else if(comp.types[0] == "locality")
			address_obj.city = comp.short_name;
		else if(comp.types[0] == "administrative_area_level_1")
			address_obj.state = comp.short_name;
		else if(comp.types[0] == "postal_code")
			address_obj.zip = comp.short_name;
	}

	return address_obj;
}


function displayAddress(address) {
	var line1 = address.street_number 
		+ ' ' 
		+ address.route;
	var line2 = address.city
		+ ', '
		+ address.state
		+ ' '
		+ address.zip;

	$('#address_line1').text(line1);
	$('#address_line2').text(line2);
}

initialize();
