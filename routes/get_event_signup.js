// jon edited

var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var async = require('async');
var url = require('url');
var router = express.Router();
var db = new sqlite3.Database(process.env.DB_NAME);

router.use(function(req, res, next) {
    var url_parts = url.parse(req.url, true),
        event_id = url_parts.query.event_id,
        event_signup_id = url_parts.query.event_signup_id,
        user_id = url_parts.query.user_id;
        
    var query = "";
    if (event_id) {
        event_id = event_id.trim();
        query = "select * from event_signup where event_id = " + event_id + ";";
    } else if (user_id) {
        user_id = user_id.trim();
        query = "select * from event_signup inner join event on event_signup.event_id = " +
            "event.event_id where user_id = " + user_id + ";";
    } else if (event_signup_id) {
        event_signup_id = event_signup_id.trim();
        query = "select * from event_signup where event_signup_id = " +
            event_signup_id + ";";
    }

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
                    {'message': 'Event Signup with provided parameters not found.'}
                );
            } 
        } else {
            res.status(501).send(err);
        }
    });
});

module.exports = router;