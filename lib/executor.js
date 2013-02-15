var _      = require('underscore');
var config = require('./config');
var events = require('events');
var exec   = require('child_process').exec;
var logger = require('./logger')(__filename);

var buildStatus = {};
module.exports = new events.EventEmitter();

config.builds.forEach(function(build){
	setStatus(build, 'idle');
});

module.exports.execute = function(build){
	logger.info("exec %s", build.action);
	
	setStatus(build, 'building...');

	var childProcess = exec(build.action, { cwd: build.baseDir, stdio: 'inherit' }, function(error, stdout, stderr){
		if(error == null){
			logger.info('Built %s', build.name);
			setStatus(build, 'up to date')
		} else {
			// console.error(stdout);
			console.error(stderr);
			logger.error('Build %s failed', build.name);
			setStatus(build, 'broken');
		}
	});
};

function setStatus(build, status){
	buildStatus[build.name] = status;
	module.exports.emit('statusChanged', build.name, status);
}

module.exports.getStatus = function(){
	return _.extend({}, buildStatus);
};