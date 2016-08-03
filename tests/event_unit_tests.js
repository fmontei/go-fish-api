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

describe('CreateEventTest', function() {
	var error, response, body;

	beforeEach(function(done) {
		async.waterfall([
			// Create user
			function(callback) {
				request.post('http://localhost:3000/user', { form: new_user_1 }, 
					function(_error, _response, _body) {
						body_1 = JSON.parse(_body);
						new_user_1.user_id = body_1.last_id;
						new_event_1.event_organizer = new_user_1.user_id;
						callback(_error);
				});
			},
			// Create eveent
			function(callback) {
				request.post('http://localhost:3000/event', { form: new_event_1 }, 
					function(_error, _response, _body) {
						error = _error;
						response = _response;
						body = _body;
						done();
				});
			},
		], function(err) {
			console.log("Something went wrong: " + err);
		});	
	});

	it('create_event should add a new event to db', function() {
		expect(error).to.equal(null);
		expect(body).to.not.have.string('Error');
		expect(response.statusCode).to.equal(200);

		body = JSON.parse(body);
		new_event_1.event_id = body.last_id;

		expect(new_event_1.event_id).to.be.a('Number');
	});
});

describe('GetEventTest_event_id', function() {
	var get_error, get_response, get_body;

	beforeEach(function(done) {
		request({
		    url: 'http://localhost:3000/event?event_id=' + new_event_1.event_id, 
		    method: 'GET'
		}, function(_error, _response, _body) {
		    get_error = _error;
			get_response = _response;
			get_body = _body;
		    done();
		});
	});

	it('get_event should get the right event by event_id from the db', function() {
		expect(get_error).to.equal(null);
		expect(get_body).to.not.have.string('Error');
		expect(get_response.statusCode).to.equal(200);
		get_body = JSON.parse(get_body)[0];
		for (param in new_event_1) {
			expect(get_body[param]).to.equal(new_event_1[param]);
		}
	});
});

describe('GetEventTest_event_name', function() {
	var get_error, get_response, get_body;

	beforeEach(function(done) {
		request({
		    url: 'http://localhost:3000/event?event_name=' + new_event_1.event_name, 
		    method: 'GET'
		}, function(_error, _response, _body) {
		    get_error = _error;
			get_response = _response;
			get_body = _body;
		    done();
		});
	});

	it('get_event should get the right event by event_name from the db', function() {
		expect(get_error).to.equal(null);
		expect(get_body).to.not.have.string('Error');
		expect(get_response.statusCode).to.equal(200);
		get_body = JSON.parse(get_body)[0];
		for (param in new_event_1) {
			expect(get_body[param]).to.equal(new_event_1[param]);
		}
	});
});

describe('DeleteEventTest_event_id', function() {
	var get_error, get_response, get_body,
		delete_error, delete_response, delete_body;

	beforeEach(function(done) {
		request({
		    url: 'http://localhost:3000/event',
		    method: 'DELETE',
		    form: { event_id: new_event_1.event_id }
		}, function(_error, _response, _body) {
		    delete_error = _error;
		    delete_response = _response;
		    delete_body = _body;
		    
		    request({
			    url: 'http://localhost:3000/event?event_id=' + new_event_1.event_id,
			    method: 'GET'
			}, function(_error, _response, _body) {
			    get_error = _error;
			    get_response = _response;
			    get_body = _body;
			    done();
			});
		});
	});

	it('deleted event should not be retrieved', function() {
		expect(delete_error).to.be.a('null');
		expect(delete_response.statusCode).to.equal(200);
		expect(delete_body).to.be.a('string');
		expect(get_body).to.not.have.string('Error');
		expect(get_error).to.be.a('null');
		expect(get_response.statusCode).to.equal(200);
		expect(get_body).to.be.a('string');
		expect(get_body).to.have.string('not found');
	});
});