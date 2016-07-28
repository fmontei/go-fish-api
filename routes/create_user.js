var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var async = require('async');

var router = express.Router();
var db = new sqlite3.Database('gofish.db');

router.use(function(req, res, next) {
    var firstname = req.body.firstname,
        lastname = req.body.lastname,
        address = req.body.address,
        city = req.body.city,
        zip = req.body.zip,
        state = req.body.state,
        phone = req.body.phone,
        email = req.body.email,
        password = req.body.password,
        role = req.body.role;
    async.waterfall([
        function(callback) {
            console.log("1");
            db.run('insert into user(firstname, lastname, address, city,' +
                'zip, state, phone, email, password, role) ' + 
                'values($firstname, $lastname, $address, $city, $zip, $state, $phone,' +
                '$email, $password, $role);', {
                    $firstname: firstname,
                    $lastname: lastname,
                    $address: address,
                    $city: city,
                    $zip: zip,
                    $state: state,
                    $phone: phone,
                    $email: email,
                    $password: password,
                    $role: role
            }, function(err) {
                console.log("Have error? " + err);
                callback(err, this.lastID);
            });
        }
    ], function(err, created_user_id) {
        console.log("2");
        if (!err) {
            console.log("No error");
            console.log(created_user_id);
            res.status(201).send({last_id: created_user_id});
        } else {
            res.status(500).send('Failed to create user.');
        }
    });
});

module.exports = router;

