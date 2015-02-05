var express = require('express');
var num = require('numeral');
var http = require('http');

var app = express();

//build static routes
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/', express.static(__dirname + '/public/html'));
app.use('/script', express.static(__dirname + '/public/script'));

//setup api call route
app.get('/getSearchResults'. function(req, res) {

});

var server = http.createServer(app);
server.listen(80);
