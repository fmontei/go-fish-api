var chai = require('chai');
var sqlite3 = require('sqlite3').verbose();
var request = require('request');
var async = require('async');
var init_db = require('../scripts/init_db');

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

describe('CreateUserTest', function() {
	var error, response, body;

	var new_user = {
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

	beforeEach(function(done) {
		request.post('http://localhost:3000/user', { form: new_user }, 
			function(_error, _response, _body) {
				error = _error;
				response = _response;
				body = JSON.parse(_body);
				done();
		});
	});

	it('create_user should add a new user to db', function() {
		expect(error).to.equal(null);
		expect(response.statusCode).to.equal(200);
		var user_id = body.last_id;
		expect(user_id).to.be.above(0);
	});
});

describe('CreateAndGetUserTest', function() {
	var post_error, post_response, post_body,
		get_error, get_response, get_body;

	var new_user = {
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

	beforeEach(function(done) {
		request.post('http://localhost:3000/user', { form: new_user }, 
			function(_error, _response, _body) {
				post_error = _error;
				post_response = _response;
				post_body = JSON.parse(_body);
				var user_id = post_body.last_id;

				request({
				    url: 'http://localhost:3000/user?user_id=' + user_id, 
				    method: 'GET'
				}, function(_error, _response, _body) {
				    get_error = _error;
					get_response = _response;
					get_body = JSON.parse(_body);
				    done();
				});
		});
	});

	it('create_user should add a new user to db', function() {
		expect(post_error).to.equal(null);
		expect(post_response.statusCode).to.equal(200);
		expect(get_error).to.equal(null);
		expect(get_response.statusCode).to.equal(200);
		for (param in new_user) {
			expect(get_body[param]).to.equal(new_user[param]);
		}
	});
});