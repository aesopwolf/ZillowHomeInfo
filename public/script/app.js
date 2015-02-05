var autoComplete;

function initialize() {
	console.log('init');
	var options = 	{
		types: ['geocode'],
		componentRestrictions: {country: 'us'}
	};

	autoComplete = new google.maps.places.Autocomplete($('#autocomplete')[0], options);
	google.maps.event.clearListeners(autoComplete, 'place_changed');
	bindEvents();
}

function bindEvents() {
	console.log('bind');

	$('#autocomplete').on("blur",function(e){
		$('#search').focus();
	});

	$('#search').on("click", function() {
		displayAddress();
	});
	$('#autocomplete').keypress(function(e) {
		if (e.which == 13) {
			google.maps.event.trigger(autoComplete, 'place_changed');
			console.log("trigger");
			return false;
		}
	});
	google.maps.event.addListener(autoComplete, 'places_changed', function(event) {
		alert("hmm");
		console.log(event);
	});

}

function displayAddress() {
	var place = autoComplete.getPlace();
	console.log('display');
	var line1, line2;
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
	line1 = address_obj.street_number 
		+ ' ' 
		+ address_obj.route;
	line2 = address_obj.city
		+ ', '
		+ address_obj.state
		+ ' '
		+ address_obj.zip;

	$('#address_line1').text(line1);
	$('#address_line2').text(line2);
}
console.log(1);
initialize();
console.log(2);

