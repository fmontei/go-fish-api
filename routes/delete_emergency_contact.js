var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var async = require('async');
var router = express.Router();
var db = new sqlite3.Database(process.env.DB_NAME);

router.use(function(req, res, next) {
    var emergency_contact_id = req.body.emergency_contact_id,
        email = req.body.email;

    var query = "";
    if (emergency_contact_id) {
        emergency_contact_id = emergency_contact_id.trim();
        query = "delete from emergency_contact where emergency_contact_id = '" + 
            emergency_contact_id + "';";
    } else if (email) {
        email = email.trim();
        query = "delete from emergency_contact where email = '" + email + "';";
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
                res.status(200).send({message: 'No such EC was found. No records deleted.'});
            } else if (changes == 1) {
                res.status(200).send({message: 'Deleted user.'});
            } else {
                res.status(200).send({message: 'Multiple users were deleted. Number: ' + changes + '.'});
            }
        } else {
            res.status(501).send(err);
        }
    });
});

module.exports = router;