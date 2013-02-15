var commander = require('commander');
var fs        = require('fs');
var logger    = require('./logger')(__filename);

var config = module.exports = {
	logLevel: 'log',
	builds: []
};

var isInitialized = false;

module.exports.init = function(config_){
	if(!isInitialized){
		isInitialized = true;

		if(config_){
			copyConfig(config_);
			applyLogConfig();
			logger.info("Using programmatic configuration.");
			onLoadedConfig();
		} else {
			commander
				.option('-c, --config [file]', 'Configuration file')
				.parse(process.argv);

			var filename = commander.config || "./config.json";

			if(fs.existsSync(filename)){
				var configText = fs.readFileSync(filename, 'utf8');
				try {
					var configObj = JSON.parse(configText);
					copyConfig(configObj);
				} catch(e){
					logger.error("%s in %s", e.message, filename);
				}

				applyLogConfig();
				logger.info("Using %s", filename);
				onLoadedConfig();

			} else {
				applyLogConfig();
				logger.info("Using defaults (missing %s)", filename);
				onLoadedConfig();
			}
		}
	}

	return config;
};

function applyLogConfig(){
	// if(config.logFile){
	// 	logger.useFile(config.logFile);
	// }
	logger.setLevel(config.logLevel);
}

function onLoadedConfig(){
	// if(config.uid != null && process.setuid){
	// 	try {
	// 		process.setuid(config.uid);
	// 		logger.info("setuid to %s", process.getuid());
	// 	} catch(e){
	// 		logger.error("Unable to setuid to %s: %s", config.uid, e);
	// 	}
	// }

	// fs.mkdir(config.dataDir, function(err){
	// 	if(err != null && err.code != 'EEXIST'){
	// 		logger.warn(err);
	// 	}
	// });
}

function copyConfig(config_){
	for(var key in config_){
		if(config_.hasOwnProperty(key)){
			config[key] = config_[key];
		}
	}
}