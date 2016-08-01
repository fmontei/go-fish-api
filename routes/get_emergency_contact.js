var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var async = require('async');
var url = require('url');
var router = express.Router();
var db = new sqlite3.Database(process.env.DB_NAME);

router.use(function(req, res, next) {
    var url_parts = url.parse(req.url, true),
        user_id = url_parts.query.user_id,
        email = url_parts.query.email,
		first = url_parts.query.firstname,
		last = url_parts.query.lastname;
        
    var query = "";
    if (user_id) {
        user_id = user_id.trim();
        query = "select * from emergency_contact where user_id = " + user_id;
    } else if (email) {
        email = email.trim();
        query = "select * from emergency_contact where email = '" + email + "';";
    } else if (first || last){
		if (first != null && last != null) {
			first = first.trim();
			last = last.trim();
			query = "select * from emergency_contact where firstname = '" + first + "' and " +
                "lastname = '" + last + "';";
		} else if (first != null) {
			first = first.trim();
			query = "select * from emergency_contact where firstname = '" + first + "';";
		} else {
			last = last.trim();
			query = "select * from emergency_contact where lastname = '" + last + "';";
		}
	}

    query += " order by user_id;";

    async.waterfall([
        function(callback) {
            db.all(query, function(err, rows) {
                callback(null, rows);
            });
        }
    ], function (err, rows) {
        if (!err) {
			if (rows && rows.length > 1) {
				res.status(200).send(rows);
			} else if (rows && rows.length == 1) {
                res.status(200).send(rows[0]);
            } else if (!rows || rows.length == 0) {
                res.status(200).send(
                    {'message': 'EC with provided parameters not found.'}
                );
            } 
        } else {
            res.status(501).send(err);
        }
    });
});

module.exports = router;