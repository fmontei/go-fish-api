var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var async = require('async');
var router = express.Router();
var db = new sqlite3.Database(process.env.DB_NAME);

router.use(function(req, res, next) {
    var event_id = req.body.event_id,
        event_signup_id = req.body.event_signup_id,
        user_id = req.body.user_id;

    var query = "";
    /*if (event_id) {
        event_id = event_id.trim();
        query = "delete from event where event_id = '" + event_id + "';";
    } else if (event_name) {
        event_name = event_name.trim();
        query = "delete from user where event_name = '" + event_name + "';";
    }*/

    if (event_id && user_id){
        event_id = event_id.trim();
        user_id = user_id.trim();

        query = "delete from event_signup where event_id = '" + event_id + "' AND user_id = '" + user_id + "';";
    }

    else if (event_signup_id){
        event_signup_id = event_signup_id.trim();
        query = "delete from event_signup where event_signup_id = '" + event_id +"';";
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
                res.status(200).send({message: 'Problem occured trying to remove you from event'});
            } else if (changes == 1) {
                res.status(200).send({message: 'Deleted user confirmation to event.'});
            }
        } else {
            res.status(501).send(err);
        }
    });
});

module.exports = router;