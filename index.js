var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();

var get_user = require('./routes/get_user');
var create_user = require('./routes/create_user');
var delete_user = require('./routes/delete_user');

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
};

app.use(allowCrossDomain);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(process.env.PORT || 3000, function() {
    console.log("Listening on port " + (process.env.PORT || 3000));
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