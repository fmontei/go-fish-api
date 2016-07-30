# GoFish API

## Before cloning the repo:

* Install Node.js https://nodejs.org
* `npm install -g bower grunt-cli`

## Initialize DB:
* node scripts/init_node.js

## Every time you pull changes:

* `npm install`
* `bower install`
* `grunt` 

## Testing:

* Change DB_NAME in .env to a something else like "test.db"
* npm start
* mocha tests/unit_tests.js

## Structure

* `public/`: Static files such as JavaScript, images, CSS, fonts, etc. Files
  in this directory are available at `/static/` client-side.
  * `lib/`: 3rd-party library files. This folder should be modified only
    by `Gruntfile.js`, which is executed using `grunt` and copies the necessary
    files from `bower_components`.
* `routes/`: Instead of assigning all routes in `index.js`, create a route
for each part of the application in separate files here and then
mount them in `index.js`.
* `scripts/`: Database utilities.

## Misc

### Adding packages

* Pass the `-S` flag to `npm install ...` to save the package as an application
  dependency in `package.json`.
* Pass the `-D` flag to `npm install ...` to save the package as a development
  dependency in `package.json` (e.g., grunt modules).
