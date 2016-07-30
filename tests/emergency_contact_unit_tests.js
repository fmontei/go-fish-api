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

var new_ec_1 = {
	firstname: randomString(10),
	lastname: randomString(10),
	address: randomString(10),
	city: randomString(10),
	zip: randomString(10),
	state: randomString(10),
	phone: randomString(10),
	email: randomString(10)
};

describe('CreateECTest', function() {
	var error, response, body;
	beforeEach(function(done) {
		request.post('http://localhost:3000/user', { form: new_user_1 }, 
			function(_error, _response, _body) {
				body = JSON.parse(_body);
				new_user_1.user_id = body.last_id;
				new_ec_1.user_id = new_user_1.user_id;
				
				request.post('http://localhost:3000/emergency_contact', { form: new_ec_1 }, 
					function(_error, _response, _body) {
						error = _error;
						response = _response;
						body = _body;
						done();
				});
		});
	});
	it('create_emergency_contact should add a new EC to db', function() {
		expect(error).to.equal(null);
		expect(body).to.not.have.string('Error');
		expect(response.statusCode).to.equal(200);
		
		body = JSON.parse(body);
		new_ec_1.emergency_contact_id = body.last_id;

		expect(new_ec_1.emergency_contact_id).to.be.above(0);
	});
});

describe('GetECTest_emergency_contact_id', function() {
	var get_error, get_response, get_body;

	beforeEach(function(done) {
		request({
		    url: 'http://localhost:3000/emergency_contact?user_id=' + new_user_1.user_id, 
		    method: 'GET'
		}, function(_error, _response, _body) {
		    get_error = _error;
			get_response = _response;
			get_body = _body;
		    done();
		});
	});

	it('get_emergency_contact should get the right user from the db', function() {
		expect(get_error).to.equal(null);
		expect(get_body).to.not.have.string('Error');
		expect(get_response.statusCode).to.equal(200);
		
		get_body = JSON.parse(get_body);

		expect(get_body.user_id).to.equal(new_user_1.user_id);
		for (param in new_ec_1) {
			expect(get_body[param]).to.equal(new_ec_1[param]);
		}
	});
});
