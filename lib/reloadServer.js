var http = require('http');
var config = require('./config');
var executor = require('./executor');
var logger   = require('./logger')(__filename);

function registerConnection(req, res){
	var listener = function(buildName, status){
		logger.log('%s status changed to %s', buildName, status)
		if(status == 'up to date'){
			res.setHeader('connection', 'close');
			res.end("window.location.reload(true);");
			executor.removeListener('statusChanged', listener);
		}
	};
	res.on('close', function(){
		executor.removeListener('statusChanged', listener);
	});
	executor.on('statusChanged', listener);
}

module.exports.start = function(){
	var server = http.createServer(function(req, res){
		registerConnection(req, res);
		logger.info("Registered browser connection from %s", req.connection.remoteAddress);
	}).listen(config.reloadServerPort);
};