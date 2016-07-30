var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var async = require('async');
var router = express.Router();
var db = new sqlite3.Database(process.env.DB_NAME);

router.use(function(req, res, next) {
    var user_id = req.body.user_id,
        firstname = req.body.firstname,
        lastname = req.body.lastname,
        address = req.body.address,
        city = req.body.city,
        zip = req.body.zip,
        state = req.body.state,
        phone = req.body.phone,
        email = req.body.email;
        
    async.waterfall([
        function(callback) {
            db.run('insert into emergency_contact(user_id, firstname, lastname,' + 
                'address, city, zip, state, phone, email) ' + 
                'values($user_id, $firstname, $lastname, $address,' + 
                '$city, $zip, $state, $phone, $email);', {
                    $user_id: user_id,
                    $firstname: firstname,
                    $lastname: lastname,
                    $address: address,
                    $city: city,
                    $zip: zip,
                    $state: state,
                    $phone: phone,
                    $email: email
            }, function(err) {
                callback(err, this.lastID);
            });
        }
    ], function(err, created_ec_id) {
        if (!err) {
            res.status(200).send({last_id: created_ec_id});
        } else {
            res.status(501).send(err);
        }
    });
});

module.exports = router;

