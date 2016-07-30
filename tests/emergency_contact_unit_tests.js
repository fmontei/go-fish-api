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

var new_ec_2 = {
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
	var error_1, response_1, body_1, error_2, response_2, body_2;
	beforeEach(function(done) {
		async.waterfall([
			// Create user
			function(callback) {
				request.post('http://localhost:3000/user', { form: new_user_1 }, 
					function(_error, _response, _body) {
						body_1 = JSON.parse(_body);
						new_user_1.user_id = body_1.last_id;
						new_ec_1.user_id = new_user_1.user_id;
						new_ec_2.user_id = new_user_1.user_id;
						callback(_error);
				});
			},
			// Create first emergency contact
			function(callback) {
				request.post('http://localhost:3000/emergency_contact', { form: new_ec_1 }, 
					function(_error, _response, _body) {
						error_1 = _error;
						response_1 = _response;
						body_1 = _body;
						callback(_error);
				});
			},
			// Create second emergency contact
			function(callback) {
				request.post('http://localhost:3000/emergency_contact', { form: new_ec_2 }, 
					function(_error, _response, _body) {
						error_2 = _error;
						response_2 = _response;
						body_2 = _body;
						done();
				});
			}
		], function(err) {
			console.log("Something went wrong: " + err);
		});
	});
	it('create_emergency_contact should add a new EC to db', function() {
		expect(error_1).to.equal(null);
		expect(body_1).to.not.have.string('Error');
		expect(response_1.statusCode).to.equal(200);
		expect(error_2).to.equal(null);
		expect(body_2).to.not.have.string('Error');
		expect(response_2.statusCode).to.equal(200);
		
		body_1 = JSON.parse(body_1);
		new_ec_1.emergency_contact_id = body_1.last_id;
		body_2 = JSON.parse(body_2);
		new_ec_2.emergency_contact_id = body_2.last_id;

		expect(new_ec_1.emergency_contact_id).to.be.a('Number');
		expect(new_ec_2.emergency_contact_id).to.be.a('Number');
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

		expect(get_body).to.be.instanceOf(Array);
		expect(get_body).to.have.length.within(2, 2);
		expect(get_body[0].user_id).to.equal(new_user_1.user_id);
		expect(get_body[1].user_id).to.equal(new_user_1.user_id);
		for (param in new_ec_1) {
			expect(get_body[0][param]).to.equal(new_ec_1[param]);
		}
		for (param in new_ec_2) {
			expect(get_body[1][param]).to.equal(new_ec_2[param]);
		}
	});
});

describe('DeleteECTest_emergency_contact_id', function() {
	var get_error, get_response, get_body,
		delete_error, delete_response, delete_body;

	beforeEach(function(done) {
		request({
		    url: 'http://localhost:3000/emergency_contact',
		    method: 'DELETE',
		    form: { emergency_contact_id: new_ec_1.emergency_contact_id }
		}, function(_error, _response, _body) {
		    delete_error = _error;
		    delete_response = _response;
		    delete_body = _body;
		    
		    request({
			    url: 'http://localhost:3000/emergency_contact?' + 
			    'emergency_contact_id=' + new_ec_1.emergency_contact_id,
			    method: 'GET'
			}, function(_error, _response, _body) {
			    get_error = _error;
			    get_response = _response;
			    get_body = _body;
			    done();
			});
		});
	});

	it('deleted EC should not be retrieved', function() {
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

describe('DeleteCascadeECTest', function() {
	var error, response, body;
	beforeEach(function(done) {
		// Create user
		async.waterfall([
			function(callback) {
				request.post('http://localhost:3000/user', { form: new_user_1 }, 
					function(_error, _response, _body) {
						body = JSON.parse(_body);
						new_user_1.user_id = body.last_id;
						new_ec_1.user_id = new_user_1.user_id;
						callback(_error);
				});
			},
			// Create emergency contact
			function(callback) {
				request.post('http://localhost:3000/emergency_contact', { form: new_ec_1 }, 
					function(_error, _response, _body) {
						callback(_error);
				});
			}, 
			// Delete user
			function(callback) {
				request({
				    url: 'http://localhost:3000/user',
				    method: 'DELETE',
				    form: { user_id: new_user_1.user_id }
				}, function(_error, _response, _body) {
					callback(_error);
				});
			},
			// Attempt to get emergency contact
			function(callback) {
				request.get('http://localhost:3000/emergency_contact?emergency_contact_id=' +
					new_ec_1.emergency_contact_id, function(_error, _response, _body) {
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
	it('delete user should delete dependent emergency_contact record', function() {
		expect(error).to.equal(null);
		expect(body).to.not.have.string('Error');
		expect(response.statusCode).to.equal(200);
		expect(body).to.have.string('not found');
	});
});
