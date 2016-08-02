var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var async = require('async');
var url = require('url');
var router = express.Router();
var db = new sqlite3.Database(process.env.DB_NAME);

router.use(function(req, res, next) {
    var url_parts = url.parse(req.url, true),
        event_id = url_parts.query.event_id,
        user_id = url_parts.query.user_id;
        
    var query = "select * from event order by event_id;";
    if (event_id) {
        event_id = event_id.trim();
    	query = "select * from user inner join event_signup on user.user_id = event_signup.user_id where event_id = " 
            + event_id + " order by user.user_id;";   
    } 
    else if (user_id) {
        user_id = user_id.trim();
        query = "select event.event_id, event.event_name, event.event_desc, event.event_address, event.event_organizer, event.event_date, " +
            "event.event_time from event inner join event_signup on event.event_id = event_signup.event_id where user_id = " 
            + user_id + " order by event.event_id;";   
    } 

    async.waterfall([
        function(callback) {
            db.all(query, function(err, rows) {
                callback(null, rows);
            });
        }
    ], function (err, rows) {
        if (!err) {
			if (rows && rows.length >= 1) {
				res.status(200).send(rows);
			} else {
                res.status(200).send(
                    {'message': 'No events found.'}
                );
            } 
        } else {
            res.status(501).send(err);
        }
    });
});

module.exports = router;
