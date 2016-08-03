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

var new_user_2 = {
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
	var error_1, response_1, body_1,
		error_2, response_2, body_2;

	beforeEach(function(done) {
		async.waterfall([
			function(callback) {
				request.post('http://localhost:3000/user', { form: new_user_1 }, 
					function(_error, _response, _body) {
						error_1 = _error;
						response_1 = _response;
						body_1 = _body;
						callback(error_1);
				});
			},
			function(callback) {
				request.post('http://localhost:3000/user', { form: new_user_2 }, 
					function(_error, _response, _body) {
						error_2 = _error;
						response_2 = _response;
						body_2 = _body;
						callback(error_2);
				});
			}
		], function(err) {
			if (err) console.log("Something went wrong: " + err);
			done();
		});
	});

	it('create_user should add a new user to db', function() {
		expect(error_1).to.equal(null);
		expect(body_1).to.not.have.string('Error');
		body_1 = JSON.parse(body_1);
		expect(body_1).to.be.instanceof(Object);
		new_user_1.user_id = body_1.last_id;
		expect(response_1.statusCode).to.equal(200);
		expect(new_user_1.user_id).to.be.a('Number');

		expect(error_2).to.equal(null);
		expect(body_2).to.not.have.string('Error');
		body_2 = JSON.parse(body_2);
		expect(body_2).to.be.instanceof(Object);
		new_user_2.user_id = body_2.last_id;
		expect(response_2.statusCode).to.equal(200);
		expect(new_user_2.user_id).to.be.a('Number');
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

	it('get_user should get the right user by user_id from the db', function() {
		expect(get_error).to.equal(null);
		expect(get_body).to.not.have.string('Error');
		expect(get_response.statusCode).to.equal(200);
		get_body = JSON.parse(get_body)[0];
		for (param in new_user_1) {
			expect(get_body[param]).to.equal(new_user_1[param]);
		}
	});
});

describe('GetUsersTest', function() {
	var get_error, get_response, get_body;

	beforeEach(function(done) {
		request({
		    url: 'http://localhost:3000/users', 
		    method: 'GET'
		}, function(_error, _response, _body) {
		    get_error = _error;
			get_response = _response;
			get_body = _body;
		    done();
		});
	});

	it('get_users should get all the users from db', function() {
		expect(get_error).to.equal(null);
		expect(get_body).to.not.have.string('Error');
		expect(get_response.statusCode).to.equal(200);
		get_body = JSON.parse(get_body);
		expect(get_body).to.be.instanceOf(Array);
		expect(get_body).to.have.length.above(2);
		var match = 0;
		for (var i = 0; i < get_body.length; i++) {
			if (get_body[i].user_id == new_user_1.user_id ||
				get_body[i].user_id == new_user_2.user_id) {
				match += 1;
			}
		}
		expect(match).to.equal(2);
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
		get_body = JSON.parse(get_body)[0];
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