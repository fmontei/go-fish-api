require('dotenv').load();

var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var request = require('request');

var init_db = require('./scripts/init_db');

var get_user = require('./routes/get_user');
var create_user = require('./routes/create_user');
var delete_user = require('./routes/delete_user');

var get_emergency_contact = require('./routes/get_emergency_contact');
var create_emergency_contact = require('./routes/create_emergency_contact');

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
};

app.use(allowCrossDomain);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Intialize DB
app.get('/init', init_db);

request({
    url: 'http://localhost:3000/init',
    method: 'GET'
}, function(error, response, body) {
	console.log(body);
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

// Get user by specified user_id or email/password
app.get('/user', get_user);
// Create a new user
app.post('/user', create_user);
// Delete user by specified user_id or email/password
app.delete('/user', delete_user);

// Get user by specified user_id or email/password
app.get('/emergency_contact', get_emergency_contact);
// Create a new EC
app.post('/emergency_contact', create_emergency_contact);

app.listen(process.env.PORT || 3000, function() {
    console.log("Listening on port " + (process.env.PORT || 3000));
});