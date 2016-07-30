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

describe('CreateUserTest', function() {
	var error, response, body;

	beforeEach(function(done) {
		request.post('http://localhost:3000/user', { form: new_user_1 }, 
			function(_error, _response, _body) {
				error = _error;
				response = _response;
				body = _body;
				done();
		});
	});

	it('create_user should add a new user to db', function() {
		expect(error).to.equal(null);
		expect(body).to.not.have.string('Error');
		expect(response.statusCode).to.equal(200);

		body = JSON.parse(body);
		new_user_1.user_id = body.last_id;

		expect(new_user_1.user_id).to.be.above(0);
	});
});

describe('GetUserTest_user_id', function() {
	var get_error, get_response, get_body;

	beforeEach(function(done) {
		request({
		    url: 'http://localhost:3000/user?user_id=' + new_user_1.user_id, 
		    method: 'GET'
		}, function(_error, _response, _body) {
		    get_error = _error;
			get_response = _response;
			get_body = _body;
		    done();
		});
	});

	it('get_user should get the right user by id from the db', function() {
		expect(get_error).to.equal(null);
		expect(get_body).to.not.have.string('Error');
		expect(get_response.statusCode).to.equal(200);
		get_body = JSON.parse(get_body);
		for (param in new_user_1) {
			expect(get_body[param]).to.equal(new_user_1[param]);
		}
	});
});

describe('GetUserTest_email_password', function() {
	var get_error, get_response, get_body;

	beforeEach(function(done) {
		request({
		    url: 'http://localhost:3000/user?email=' + new_user_1.email
		    	+ "&password=" + new_user_1.password, 
		    method: 'GET'
		}, function(_error, _response, _body) {
		    get_error = _error;
			get_response = _response;
			get_body = _body;
		    done();
		});
	});

	it('get_user should get the right user by email/password from the db', function() {
		expect(get_error).to.equal(null);
		expect(get_body).to.not.have.string('Error');
		expect(get_response.statusCode).to.equal(200);
		get_body = JSON.parse(get_body);
		for (param in new_user_1) {
			expect(get_body[param]).to.equal(new_user_1[param]);
		}
	});
});

describe('GetUserTest_should_fail', function() {
	var get_error, get_body;

	beforeEach(function(done) {
		request({
		    url: 'http://localhost:3000/user?firstname=' + randomString(10)
		    	+ "&lastname=" + randomString(10), 
		    method: 'GET'
		}, function(_error, _response, _body) {
		    get_error = _error;
		    get_response = _response;
		    get_body = _body;
		    done();
		});
	});

	it('get_user should fail', function() {
		expect(get_error).to.be.a('null');
		expect(get_response.statusCode).to.equal(200);
		expect(get_body).to.be.a('string');
		expect(get_body).to.have.string('not found');
	});
});

describe('DeleteUserTest_user_id', function() {
	var get_error, get_response, get_body,
		delete_error, delete_response, delete_body;

	beforeEach(function(done) {
		request({
		    url: 'http://localhost:3000/user',
		    method: 'DELETE',
		    form: { user_id: new_user_1.user_id }
		}, function(_error, _response, _body) {
		    delete_error = _error;
		    delete_response = _response;
		    delete_body = _body;
		    
		    request({
			    url: 'http://localhost:3000/user?user_id=' + new_user_1.user_id,
			    method: 'GET'
			}, function(_error, _response, _body) {
			    get_error = _error;
			    get_response = _response;
			    get_body = _body;
			    done();
			});
		});
	});

	it('deleted user should not be retrieved', function() {
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