var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var async = require('async');
var url = require('url');
var router = express.Router();
var db = new sqlite3.Database(process.env.DB_NAME);

router.use(function(req, res, next) {
    var url_parts = url.parse(req.url, true),
        user_id = url_parts.query.user_id,
        event_id = url_parts.query.event_id;

    if (!user_id || !event_id) {
        res.status(400).send({'message': 'user_id and event_id must be provided.'});
        return;
    }

    user_id = user_id.trim();
    event_id = event_id.trim();
        
    var query = "select * from map_marker where user_id = " + user_id + " and " +
        "event_id = " + event_id + ";";

    async.waterfall([
        function(callback) {
            db.all(query, function(err, rows) {
                callback(null, rows);
            });
        }
    ], function (err, rows) {
        if (!err) {
			if (rows) {
				res.status(200).send(rows);
			} else if (!rows || rows.length == 0) {
                res.status(200).send(
                    {'message': 'No map markers found.'}
                );
            } 
        } else {
            res.status(501).send(err);
        }
    });
});

module.exports = router;