var logger = require('./lib/logger')(__filename);
var config = require('./lib/config').init();

var watcher = require('./lib/watcher');
watcher.start();