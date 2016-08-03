// Jon
var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var async = require('async');
var router = express.Router();
var db = new sqlite3.Database(process.env.DB_NAME);

router.use(function(req, res, next) {
    var event_id = req.body.event_id,
        user_id = req.body.user_id;
        
    async.waterfall([
        function(callback) {
            db.run('insert into event_signup(event_id, user_id) ' + 
                'values($event_id, $user_id);', {
                    $event_id: event_id,
                    $user_id: user_id
            }, function(err) {
                callback(err, this.lastID);
            });
        }
    ], function(err, created_event_signup_id) {
        if (!err) {
            res.status(200).send({last_id: created_event_signup_id});
        } else {
            res.status(501).send(err);
        }
    });
});

module.exports = router;

