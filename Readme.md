Build on Write
==============

Build on Write is a monitors filesystem directories. When a file changes, a build is fired.

![Build on Write](https://aldaviva.com/portfolio/artwork/buildonwrite.png)

- Red: failed
- Yellow: in progress
- Green: succeeded
- White: not yet run

#Requirements

- Node + NPM
- Local filesystem access to the monitored source tree. SMB and NFS won't provide the necessary notifications when files are modified.

#Installation

In the directory where you unpacked Build on Write, run

	$ npm install

#Running

	$ node path/to/buildonwrite/

Use `Ctrl+C` to exit.

#Configuration

Configuration is stored in `config.json`, read from the installation directory by default. To get started, make a copy of `config.json.example`. To use an alternate configuration filename, run with `--config [filename]`.

```json
{
	"logLevel": "none",
	"builds": [
		{
			"name": "Skinny Sprites",
			"baseDir": "/var/www/rivet/bjn/media/browserdev",
			"trigger": {
				"path": "src/images",
				"include": "*.png",
				"exclude": ["sprites.png", "sprites.png.uncompressed.png"]
			},
			"action": "ant sprites css html"
		}
	]
}
```

##logLevel

*values: log, info, warn, error, none*

*default: none*

Log is written to stdout. Build failure details use the **error** level.

##builds

###name

This will appear in the UI.

###baseDir

This path will be used as a base when resolving trigger paths and running actions.

###trigger

####path

Directory to monitor for changes. Relative to **baseDir**.

####include

*( optional, default: * )*

Only files that match these patterns are monitored. Can be a single String or an Array. If include is missing, all files except exclusions are monitored.

Patterns use [glob syntax](https://github.com/isaacs/minimatch).

####exclude

*( optional, default: [ ] )*

Files that match these patterns are ignored. If a file matches both an inclusion and exclusion rule, it is excluded. If exclude is missing, all inclusions are monitored. Can be a single String or an Array.

Patterns use [glob syntax](https://github.com/isaacs/minimatch).

###action

Command to execute when a file changes. The working directory will be **baseDir**. The return value of executing this command will be used to determine build failure (zero = success, nonzero = failure).