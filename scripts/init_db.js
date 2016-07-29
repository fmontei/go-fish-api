var async = require('async');
var Q = require('q');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('gofish.db');

var create_users_table_statement = "create table if not exists user(" +
	"user_id integer primary key autoincrement not null," +
	"firstname varchar(30) not null," +
	"lastname varchar(30) not null," +
	"address varchar(70)," +
	"city varchar(30)," +
	"zip varchar(10) ," +
	"state varchar(20)," +
	"phone varchar(15)," +
	"email varchar(50)," +
	"password varchar(30) not null," +
	"role varchar(10) not null);";

db.run("drop table if exists user;");
db.run(create_users_table_statement);
