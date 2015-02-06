var express = require('express');
var num = require('numeral');
var http = require('http');
var request = require('request');
var libxmljs = require("libxmljs");
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
	console.log("request: " + req_url);

	//debug, saved response so that I dont keep hitting hte API
	fs.readFile(__dirname + '/test/zillowresponse/GetSearchResults_home.xml', 
		function (err, data) {
			if(err)
				console.log(err);
			console.log(data.toString());
			res.json(zillowXMLtoJSON(data.toString()));
	});	
	/*
	request(req_url, function (error, response, body) {
		if(!error && response.statusCode == 200) {
			res.json(zillowXMLtoJSON(body));
		}
	});
	*/
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

function zillowXMLtoJSON(body) {
	var data_ret = 
	{
		prices: 
		{
			low: 0
			, current: 0
			, high: 0
			, change: 0
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
		, last_updated: "01/01/2010"
	};

	//might want to validate against the xsd, will do later
	var doc = libxmljs.parseXmlString(body);
	console.log(doc);
	//get all of the result elements (should be one, unless a rental comples address)
	var res = doc.get('//results');
	console.log(res);

	data_ret.prices.low = res.get('zestimate//low').text();
	data_ret.prices.high = res.get('zestimate//high').text();
	data_ret.prices.current = res.get('zestimate/amount').text();
	data_ret.prices.current = res.get('zestimate/vauleChange').text();

	return data_ret;
}
