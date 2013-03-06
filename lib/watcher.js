var _         = require('underscore');
var config    = require('./config');
var executor  = require('./executor');
var fs        = require('fs');
var logger    = require('./logger')(__filename);
var Minimatch = require('minimatch').Minimatch;
var path      = require('path');

module.exports.start = function(){
	config.builds.forEach(registerBuild);
};

function registerBuild(build){
	ensureMatchers(build);

	var pathToWatch = path.join(config.baseDir, build.trigger.path);
	var watchHandle = fs.watch(pathToWatch, _.debounce(_.partial(onFileChanged, build), 10));

	logger.log("Watching for updates to %s.", build.name);
}

function onFileChanged(build, event, filename){
	logger.info("%s: %s was %sd", build.name, filename, event);

	if(doesFileMatchTriggers(build, filename)){
		executor.execute(build);
	}
}

function doesFileMatchTriggers(build, filename){
	var doesFileMatch;
	if(filename){
		
		var doesFileMatchIncludes = _.chain(build.trigger.includeMatchers)
			.map(function(matcher){
				return matcher.match(filename);
			})
			.any()
			.value();

		var doesFileMatchExcludes = _.chain(build.trigger.excludeMatchers)
			.map(function(matcher){
				var doesMatch = matcher.match(filename);
				doesMatch && logger.log("%s excluded from %s by rule %s", filename, build.name, matcher.pattern);
				return doesMatch;
			})
			.any()
			.value()
		
		!doesFileMatchIncludes && !doesFileMatchExcludes && logger.log("%s ignored by %s because none of the inclusions matched", filename, build.name);

		doesFileMatch = doesFileMatchIncludes && !doesFileMatchExcludes;
	} else {
		logger.log("Unknown file changed in %s, so ")
		doesFileMatch = true;
	}

	return doesFileMatch;
}

function ensureMatchers(build){
	var matcherOptions = {
		nocase: true
	};

	if(!build.trigger.includeMatchers){
		build.trigger.includeMatchers = build.trigger.include.map(function(pattern){
			return new Minimatch(pattern, matcherOptions);
		});
	}

	if(!build.trigger.excludeMatchers){
		build.trigger.excludeMatchers = build.trigger.exclude.map(function(pattern){
			return new Minimatch(pattern, matcherOptions);
		});
	}
}