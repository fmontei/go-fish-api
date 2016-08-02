var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var async = require('async');
var router = express.Router();
var db = new sqlite3.Database(process.env.DB_NAME);

router.use(function(req, res, next) {
    var firstname = req.body.firstname,
        lastname = req.body.lastname,
        latitude = req.body.latitude,
        longitude = req.body.longitude;
        user_id = req.body.user_id;
        
    async.waterfall([
        function(callback) {
            db.run('insert into location(firstname, lastname, latitude, longitude, user_id) ' + 
                'values($firstname, $lastname, $latitude, $longitude, $user_id);', {
                    $firstname: firstname,
                    $lastname: lastname,
                    $latitude: latitude,
                    $longitude: longitude,
                    $user_id: user_id
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