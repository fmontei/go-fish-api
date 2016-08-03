var chai = require('chai');
var sqlite3 = require('sqlite3').verbose();
var request = require('request');
var async = require('async');

var expect = chai.expect;

function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
    	var randomPoz = Math.floor(Math.random() * charSet.length);
    	randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}

var new_user_1 = {
	firstname: randomString(10),
	lastname: randomString(10),
	address: randomString(10),
	city: randomString(10),
	zip: randomString(10),
	state: randomString(10),
	phone: randomString(10),
	email: randomString(10),
	password: randomString(10),
	role: 'Admin'
};

var new_event_1 = {
	event_name: randomString(10),
	event_desc: randomString(10),
	event_address: randomString(10),
	event_date: randomString(10),
	event_time: randomString(10)
};

var map_marker = {
	title: randomString(10),
	fish_type: randomString(10),
	fish_description: randomString(10),
	coordinates: randomString(50)
};

describe('CreateMapMarkerTest', function() {
	var error, response, body;

	beforeEach(function(done) {
		async.waterfall([
			// Create user
			function(callback) {
				request.post('http://localhost:3000/user', { form: new_user_1 }, 
					function(_error, _response, _body) {
						body = JSON.parse(_body);
						new_user_1.user_id = body.last_id;
						new_event_1.event_organizer = new_user_1.user_id;
						map_marker.user_id = new_user_1.user_id;
						callback(_error);
				});
			},
			// Create eveent
			function(callback) {
				request.post('http://localhost:3000/event', { form: new_event_1 }, 
					function(_error, _response, _body) {
						body = JSON.parse(_body);
						new_event_1.event_id = body.last_id;
						map_marker.event_id = new_event_1.event_id;
						callback(_error);
				});
			},
			// Join event
			function(callback) {
				request.post('http://localhost:3000/map_marker', 
					{ form: map_marker }, 
					function(_error, _response, _body) {
						error = _error;
						response = _response;
						body = _body;
						done();
				});
			}
		], function(err) {
			console.log("Something went wrong: " + err);
		});	
	});

	it('create_event_signup should add a new event signup to db', function() {
		expect(error).to.equal(null);
		expect(body).to.not.have.string('Error');
		expect(response.statusCode).to.equal(200);
		body = JSON.parse(body);
		expect(body.last_id).to.be.a('Number');
		map_marker.map_marker_id = body.last_id;
		body.map_marker_id = body.last_id;
		delete body.last_id;
		for (var key in body) {
			expect(body[key]).to.equal(map_marker[key]);
		}
	});
});

describe('GetMapMarkerTest_user_id', function() {
	var error, response, body;

	beforeEach(function(done) {
		async.waterfall([
			// Get event signup
			function(callback) {
				request({
				    url: 'http://localhost:3000/map_marker?user_id=' + new_user_1.user_id +
				    	'&event_id=' + new_event_1.event_id,
				    method: 'GET'
				}, function(_error, _response, _body) {
						error = _error;
						response = _response;
						body = _body;
						callback(_error);
				});
			}
		], function(err) {
			if (err) console.log("Something went wrong: " + err);
			done();
		});	
	});

	it('get_map_marker should get created map marker from db', function() {
		expect(error).to.equal(null);
		expect(body).to.not.have.string('Error');
		expect(response.statusCode).to.equal(200);
		body = JSON.parse(body)[0];
		expect(body.user_id).to.equal(map_marker.user_id);
		expect(body.event_id).to.equal(map_marker.event_id);
		expect(body).to.have.all.keys('event_id', 'map_marker_id', 
			'user_id', 'title', 'fish_type', 
			'fish_description', 'coordinates');
		for (var key in body) {
			expect(body[key]).to.equal(map_marker[key]);
		}
	});
});