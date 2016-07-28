var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();

var get_user = require('./routes/get_user');
var create_user = require('./routes/create_user');

app.use('/static/css/', express.static(__dirname + '/public/css/'));
app.use('/static/js/', express.static(__dirname + '/public/js/'));
app.use('/static/lib/', express.static(__dirname + '/public/lib/'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(process.env.PORT || 3000, function() {
    console.log("Listening on port " + (process.env.PORT || 3000));
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

// Get user by specified user_id
app.get('/user/:user_id', function(req, res, next) {
    req.user_id = req.params.user_id;
    get_user(req, res, next);
});

app.post('/user', create_user);