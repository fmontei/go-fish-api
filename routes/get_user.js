var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var async = require('async');

var router = express.Router();
var db = new sqlite3.Database('gofish.db');

router.use(function(req, res, next) {
    var user_id = req.user_id;

    async.waterfall([
        function(callback) {
            user_id = user_id.trim();
            var query = "SELECT * from user WHERE user_id = '" + user_id + "';";
            db.all(query, function(err, rows) {
                callback(null, rows);
            });
        }
    ], function (err, rows) {
        if (!err) {
            res.status(200).send(rows[0]);
        } else {
            res.status(404).send('User with user_id: ' + user_id + ' not found.');
        }
    });
});

module.exports = router;