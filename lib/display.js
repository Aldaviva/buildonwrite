var _        = require('underscore');
var executor = require('./executor');
var logger   = require('./logger')(__filename);
var Terminal = require('blessings');

var terminal  = new Terminal();
var positions = {};
var maxBuildNameLength = 0;
var restPosition = {};
var animations = {};

module.exports.start = function(){
	writeEverything();

	executor.on('statusChanged', function(buildName, status){
		if(status == 'building...'){
			writeEverything();
		} else {
			var position = positions[buildName];
			writeStatus(buildName, status, position.x, position.y);
			goToRestPosition();
		}
	});
};

function writeEverything(){
	terminal.hideCursor();
	terminal.clear();

	var position = { x: 3, y: 1 };

	var initialStatus = executor.getStatus();

	maxBuildNameLength = _.chain(initialStatus)
		.keys()
		.map(function(key){
			return key.length;
		})
		.max()
		.value();

	_.each(initialStatus, function(status, buildName){
		position.y += 1;
		writeStatus(buildName, status, position.x, position.y);

		positions[buildName] = _.extend({}, position);
		position.y += 3;
	});

	restPosition = { x: 0, y : position.y };
	goToRestPosition();
}

function writeStatus(buildName, status, x, y){
	terminal.write(terminal.move(x, y));
	terminal.clearLine();

	var verticalPaddingLine = format(new Array(maxBuildNameLength+5).join(" "), status);
	terminal.write(verticalPaddingLine);
	terminal.write(terminal.move(x, y+1));
	terminal.write(getFormattedBuildStatus(buildName, status));
	terminal.write(terminal.move(x, y+2));
	terminal.write(verticalPaddingLine);

	if(animations[buildName]){
		clearInterval(animations[buildName]);
		animations[buildName] = null;
	}

	if(status == 'building...'){
		var animationShowText = true;

		animations[buildName] = setInterval(function(){
			var text = (animationShowText ^= 1)
				? buildName
				: "";
			var position = positions[buildName];
			terminal.write(terminal.move(position.x, position.y + 1));
			terminal.write(getFormattedBuildStatus(text, status));
			goToRestPosition();
		}, 750);
	}
}

function getFormattedBuildStatus(buildName, status){
	var label = center(buildName, maxBuildNameLength+4);
	return format(label, status);
}

function format(label, status){
	switch(status){
		case 'idle':
			return terminal.normal(label);
		case 'building...':
			return terminal.black(terminal.bg.yellow(label));
		case 'up to date':
			return terminal.black(terminal.bg.green(label));
		case 'broken':
			return terminal.black(terminal.bg.red(label));
		default:
			return terminal.normal(label);
		}
}

function center(str, width){
	var strLen = str.length;
	var spacesToAddBefore = Math.floor((width - strLen)/2);
	var spacesToAddAfter = width - spacesToAddBefore - strLen;
	var prefix = spacesToAddBefore ? new Array(spacesToAddBefore+1).join(" ") : "";
	var suffix = spacesToAddAfter ? new Array(spacesToAddAfter+1).join(" ") : "";
	return prefix + str + suffix;
}

function goToRestPosition(){
	terminal.write(terminal.move(restPosition.x, restPosition.y));
}