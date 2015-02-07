var express = require('express');
var http = require('http');
var request = require('request');
var xmljs = require("xml2js");
var xmlParser = new xmljs.Parser();
var fs = require('fs');
var config;

try {
	config = require('./config.json');
} catch (e) {
	console.log('Rename config.sample.json to config.json and enter your zillow api-key.');
}

var zillow_api_url = 'http://www.zillow.com/webservice/GetSearchResults.htm?zws-id='
	, zillow_addr_q = '&address='
	, zillow_csz_q = '&citystatezip=';

var app = express();

//build static routes
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/', express.static(__dirname + '/public/html'));
app.use('/script', express.static(__dirname + '/public/script'));

//setup api call route
app.get('/getSearchResults', function(req, res) {
	var req_url = zillow_api_url
				+ config.zillow_api_key
				+ zillow_addr_q
				+ zillowAddrEncode(req)
				+ zillow_csz_q
				+ zillowCSZEncode(req);
	//if scale become an issue, this ould need to change
	//	and cache would become more important
	request(req_url, function (error, response, body) {
		if(!error && response.statusCode == 200) {
			res.json(zillowXMLtoJSON(body));
		}
	});
	
});

var server = http.createServer(app);
server.listen(80);

function zillowAddrEncode(req) {
	var req_str = '';
	if(req.query.street_number != '') 
		req_str += req.query.street_number + ' ';
	if(req.query.route != '')
		req_str += req.query.route;

	return encodeURIComponent(req_str).replace(/%20/g, '+');
}

function zillowCSZEncode(req) {
	var req_str = '';
	if(req.query.city != '') 
		req_str += req.query.city + ',';
	if(req.query.state != '')
		req_str += req.query.state;
	if(req.query.zip != '')
		req_str += ' ' + req.query.zip;

	return encodeURIComponent(req_str).replace(/%20/g, '+');
}

function zillowXMLtoJSON(body, error) {
	//quick and easy
	var data_ret = 
	{
		zestimate:
		{
			prices: 
			{
				low: 0
				, current: 0
				, high: 0
				, change: 0
			}
			, last_updated: "01/01/2010"
		}
		, region:
		{
			type: "city"
			, name: ""
			, zindex_value: 0
		}
		, links:
		{
			home_details: ""
			, map_home: ""
			, overview: ""
		}
		, error:
		{
			code: 0
			, reason: ""
		}
	};

	//might want to validate against the xsd, will do later
	xmlParser.parseString(body, function(err, data) {
		if(err) {
			data_ret.error.reason = "Problem parsing response.";
			data_ret.error.code = -1;
		} else {
			var data_body = data['SearchResults:searchresults'];
			//TODO: right here if there are multiple results we can iterate
			
			//error
			data_ret.error.reason = data_body.message[0].text[0];
			data_ret.error.code = data_body.message[0].code[0];
			if(data_ret.error.code == 0) {
				//results section
				var body_result = data_body.response[0].results[0].result[0];
				
				//zestimate prices
				data_ret.zestimate.prices.change = 
					body_result.zestimate[0].valueChange[0]['_'];
				data_ret.zestimate.prices.low = 
					body_result.zestimate[0].valuationRange[0].low[0]['_'];
				data_ret.zestimate.prices.high = 
					body_result.zestimate[0].valuationRange[0].high[0]['_'];
				data_ret.zestimate.prices.current = 
					body_result.zestimate[0].amount[0]['_'];

				//last updated
				data_ret.zestimate.last_updated = 
					body_result.zestimate[0]['last-updated'][0];

				//region
				data_ret.region.type = body_result.localRealEstate[0].region[0].$.type;
				data_ret.region.name = body_result.localRealEstate[0].region[0].$.name;
				data_ret.region.zindex_value = 
					body_result.localRealEstate[0].region[0].zindexValue[0];
				//links
			}
		}
	});
	return data_ret;
}
