var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var async = require('async');
var url = require('url');
var router = express.Router();
var db = new sqlite3.Database('gofish.db');

router.use(function(req, res, next) {
    var url_parts = url.parse(req.url, true),
        user_id = url_parts.query.user_id,
        email = url_parts.query.email,
        password = url_parts.query.password,
		first = url.parts.query.firstname,
		last = url.parse.query.lastname;
        
    var query = "";
    if (user_id) {
        user_id = user_id.trim();
        query = "select * from user where user_id = '" + user_id + "';";
    } else if (email && password) {
        email = email.trim();
        password = password.trim();
        query = "select * from user where email = '" + email + "' and " +
            "password = '" + password + "';";
    } else if (first || last){
		if(first != null && last != null){
			first = first.trim();
			last = last.trim();
			query = "select * from user where firstname = '" + first + "' and " +
            "lastname = '" + last + "';";
		} else if (first != null){
			first = first.trim();
			query = "select * from user where firstname = '" + first + "'";
		} else {
			last = last.trim();
			query = "select * from user where lastname = '" + last + "'";
		}
		
	}

    async.waterfall([
        function(callback) {
            db.all(query, function(err, rows) {
                callback(null, rows);
            });
        }
    ], function (err, rows) {
        if (! err) {
			if((last || first) && rows && rows.length > 0){
				res.status(200).send(rows);
			} else if (rows && rows.length > 0) {
                res.status(200).send(rows[0]);
            } else if (rows && rows.length == 0) {
                res.status(200).send('User with user_id, username, password: ' + user_id + ', ' + 
                    username + ', ' + password + ' not found.');
            } 
        } else {
            res.status(501).send('Error: ' + error + '.');
        }
    });
});

module.exports = router;