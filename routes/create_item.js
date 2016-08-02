var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var async = require('async');
var router = express.Router();
var db = new sqlite3.Database(process.env.DB_NAME);

router.use(function(req, res, next) {
    var event_id = req.body.event_id,
        item_name = req.body.item_name,
        item_type = req.body.item_type;

    if (!event_id || !item_name || !item_type) {
    	res.status(400).send('event_id and item_name and item_type must be provided.');
    }
        
    async.waterfall([
        function(callback) {
            db.run('insert into item(event_id, item_name, item_type) ' + 
                'values($event_id, $item_name, $item_type);', {
                    $event_id: event_id,
                    $item_name: item_name,
                    $item_type: item_type
            }, function(err) {
                callback(err, this.lastID);
            });
        }
    ], function(err, created_item_id) {
        if (!err) {
            res.status(200).send({last_id: created_item_id});
        } else {
            res.status(501).send(err);
        }
    });
});

module.exports = router;

