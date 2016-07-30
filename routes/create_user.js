var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var async = require('async');
var router = express.Router();
var db = new sqlite3.Database(process.env.DB_NAME);

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
                callback(err, this.lastID);
            });
        }
    ], function(err, created_user_id) {
        if (!err) {
            res.status(200).send({last_id: created_user_id});
        } else {
            res.status(501).send('Error: ' + err + '.');
        }
    });
});

module.exports = router;

