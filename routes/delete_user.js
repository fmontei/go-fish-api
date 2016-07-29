var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var async = require('async');
var router = express.Router();
var db = new sqlite3.Database('gofish.db');

router.use(function(req, res, next) {
    var user_id = req.body.user_id,
        email = req.body.email;
        
    var query = "";
    if (user_id) {
        user_id = user_id.trim();
        query = "delete from user where user_id = '" + user_id + "';";
    } else if (email) {
        email = email.trim();
        query = "delete from user where email = '" + email + "';";
    }

    async.waterfall([
        function(callback) {
            db.run(query, function(err) {
                callback(err, this.lastID, this.changes);
            });
        }
    ], function (err, lastId, changes) {
        if (!err) {
            if (changes == 0) {
                res.status(200).send('No such user was found. No records deleted.');
            } else if (changes == 1) {
                res.status(200).send('Deleted user.');
            } else {
                res.status(200).send('Multiple users were deleted. Number: ' + changes + '.');
            }
        } else {
            res.status(501).send('Error: ' + error + '.');
        }
    });
});

module.exports = router;