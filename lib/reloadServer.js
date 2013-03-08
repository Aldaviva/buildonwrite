var config   = require('./config');
var executor = require('./executor');
var http     = require('http');
var logger   = require('./logger')(__filename);

function registerConnection(req, res){
	var listener = function(buildName, status){
		logger.log('%s status changed to %s', buildName, status)
		if(status == 'up to date'){
			res.setHeader('connection', 'close');
			res.setHeader('content-type', 'application/javascript');
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
		if(req.method == 'GET' && req.url == '/'){
			res.setHeader('content-type', 'application/javascript');
			res.end("window.addEventListener('load', function(){ var scriptEl = document.createElement('script'); scriptEl.setAttribute('type', 'text/javascript'); scriptEl.setAttribute('src', 'http://"+req.headers['host']+"/reloadOnBuildSuccess'); document.body.appendChild(scriptEl);}, false);")
		
		} else if(req.method == 'GET' && req.url == '/reloadOnBuildSuccess'){
			registerConnection(req, res);
			logger.info("Registered browser connection from %s", req.connection.remoteAddress);
			
		} else {
			res.statusCode = 404;
			res.end();
		}
	}).listen(config.reloadServerPort);
};