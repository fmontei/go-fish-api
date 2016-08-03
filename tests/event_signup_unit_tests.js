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
	role: 'user'
};

var new_event_1 = {
	event_name: randomString(10),
	event_desc: randomString(10),
	event_address: randomString(10),
	event_date: randomString(10),
	event_time: randomString(10)
};

describe('CreateEventSignupTest', function() {
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
						callback(_error);
				});
			},
			// Create eveent
			function(callback) {
				request.post('http://localhost:3000/event', { form: new_event_1 }, 
					function(_error, _response, _body) {
						body = JSON.parse(_body);
						new_event_1.event_id = body.last_id;
						callback(_error);
				});
			},
			// Join event
			function(callback) {
				request.post('http://localhost:3000/event_signup', 
					{ form: { event_id: new_event_1.event_id, user_id: new_user_1.user_id } }, 
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
	});
});

describe('GetEventSignupTest_user_id', function() {
	var error, response, body;

	beforeEach(function(done) {
		async.waterfall([
			// Get event signup
			function(callback) {
				request({
				    url: 'http://localhost:3000/event_signup?user_id=' + new_user_1.user_id, 
				    method: 'GET'
				}, function(_error, _response, _body) {
						error = _error;
						response = _response;
						body = _body;
						callback(_error);
						done();
				});
			}
		], function(err) {
			console.log("Something went wrong: " + err);
		});	
	});

	it('get_event_signup should get created event signup from db', function() {
		expect(error).to.equal(null);
		expect(body).to.not.have.string('Error');
		expect(response.statusCode).to.equal(200);
		body = JSON.parse(body);
		expect(body.user_id).to.equal(new_user_1.user_id);
		expect(body.event_id).to.equal(new_event_1.event_id);
		expect(body).to.have.all.keys('event_id', 'event_signup_id', 
			'user_id', 'event_name', 'event_desc', 'event_organizer', 
			'event_address', 'event_date', 'event_time');
	});
});