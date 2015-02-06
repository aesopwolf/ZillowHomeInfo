var address_search_bar;

function initialize() {
	address_search_bar = $('#address_search_bar').geocomplete({ 
		types: ['geocode'] 
	});

	bindEvents();
}

function bindEvents() {
	address_search_bar.bind("geocode:result", function(event, result){
		var address = processAddress(result);
		var address_data = requestInfo(address);
		displayAddress(address);
		displayAddressData(address_data);
	});

	address_search_bar.bind("geocode:error", function(event, result){
		alert("error");
	});

	$('#search').on('click', function() {
		address_search_bar.trigger('geocode');
	});
}

function requestInfo(address) {
	var address_info;

	$.getJSON('/getSearchResults', address)
		.done(function( json ) {
			address_info = json;
		});

	return address_info;
}

function displayAddressData(address_data) {

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
