var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var async = require('async');
var router = express.Router();
var db = new sqlite3.Database(process.env.DB_NAME);

router.use(function(req, res, next) {
    var event_id = req.body.event_id,
        event_name = req.body.event_name;

    var query = "";
    if (event_id) {
        event_id = event_id.trim();
        query = "delete from event where event_id = '" + event_id + "';";
    } else if (event_name) {
        event_name = event_name.trim();
        query = "delete from user where event_name = '" + event_name + "';";
    }

    async.waterfall([
        function(callback) {
            db.run(query, function(err) {
                callback(err, this.changes);
            });
        }
    ], function (err, changes) {
        if (!err) {
            if (changes == 0) {
                res.status(200).send({message: 'No such event was found. No records deleted.'});
            } else if (changes == 1) {
                res.status(200).send({message: 'Deleted event.'});
            }
        } else {
            res.status(501).send(err);
        }
    });
});

module.exports = router;