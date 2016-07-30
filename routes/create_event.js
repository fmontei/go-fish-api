var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var async = require('async');
var router = express.Router();
var db = new sqlite3.Database(process.env.DB_NAME);

router.use(function(req, res, next) {
    var event_name = req.body.event_name,
        event_desc = req.body.event_desc,
        event_address = req.body.event_address,
        event_organizer = req.body.event_organizer,
        event_date = req.body.event_date,
        event_time = req.body.event_time;
        
    async.waterfall([
        function(callback) {
            db.run('insert into event(event_name, event_desc, event_address,' +
                'event_organizer, event_date, event_time) ' + 
                'values($event_name, $event_desc, $event_address,' +
                '$event_organizer, $event_date, $event_time);', {
                    $event_name: event_name,
                    $event_desc: event_desc,
                    $event_address: event_address,
                    $event_organizer: event_organizer,
                    $event_date: event_date,
                    $event_time: event_time
            }, function(err) {
                callback(err, this.lastID);
            });
        }
    ], function(err, created_user_id) {
        if (!err) {
            res.status(200).send({last_id: created_user_id});
        } else {
            res.status(501).send(err);
        }
    });
});

module.exports = router;

