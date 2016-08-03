var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var async = require('async');
var router = express.Router();
var db = new sqlite3.Database(process.env.DB_NAME);

router.use(function(req, res, next) {
    var event_id = req.body.event_id,
        user_id = req.body.user_id,
        title = req.body.title,
        fish_type = req.body.fish_type,
        fish_description = req.body.fish_description,
        coordinates = req.body.coordinates;

    if (!user_id || !event_id || !coordinates) {
        console.log(user_id + " " + event_id + " " + coordinates);
        res.status(400).send({'message': 'user_id and event_id and coordinates must be provided.'});
        return;
    }

    event_id = (event_id) ? event_id.trim() : "";
    user_id = (user_id) ? user_id.trim() : "";
    title = (title) ? title.trim() : "";
    fish_type = (fish_type) ? fish_type.trim() : "";
    fish_description = (fish_description) ? fish_description.trim() : "";
    coordinates = (coordinates) ? coordinates.trim() : "";
        
    async.waterfall([
        function(callback) {
            db.run("insert into map_marker(event_id, user_id, title, " +
                "fish_type, fish_description, coordinates) values( " +
                "$event_id, $user_id, $title, $fish_type, $fish_description, " +
                "$coordinates);", {
                    $event_id: event_id,
                    $user_id: user_id,
                    $title: title,
                    $fish_type: fish_type,
                    $fish_description: fish_description,
                    $coordinates: coordinates
            }, function(err) {
                callback(err, this.lastID);
            });
        }
    ], function(err, create_map_marker_id) {
        if (!err) {
            res.status(200).send({last_id: create_map_marker_id});
        } else {
            console.log(err);
            res.status(501).send(err);
        }
    });
});

module.exports = router;

