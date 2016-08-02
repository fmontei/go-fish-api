
var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var async = require('async');
var router = express.Router();
var db = new sqlite3.Database(process.env.DB_NAME);

router.use(function(req, res, next) {
    var item_id = req.body.item_id.trim(),
        user_id = req.body.user_id.trim();
        
    if (!item_id || !user_id) {
    	res.status(400).send("item_id and user_id must be selected.");
    }

    async.waterfall([
        function(callback) {
            db.run("update item set assigned_user_id = $user_id where item_id = $item_id;", {
                    $user_id: user_id,
                    $item_id: item_id
            }, function(err) {
                callback(err, this.lastID);
            });
        }
    ], function(err, updated_item_id) {
        if (!err) {
            res.status(200).send({last_id: updated_item_id});
        } else {
            res.status(501).send(err);
        }
    });
});

module.exports = router;

