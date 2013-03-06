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

#Live Reloading

Your page can reload itself when a build finishes. This works by making a hanging JSONP-style HTTP request to a script file, served from buildonwrite, which eventually responds with Javascript that triggers a reload.

Insert this into your HTML, assuming your buildonwrite script is running on `127.0.0.1` configured with `reloadServerPort: 8080`:

```html
<script type="text/javascript">
	setTimeout(function(){
		var scriptEl = document.createElement('script');
		scriptEl.setAttribute('type', 'text/javascript');
		scriptEl.setAttribute('src', 'http://127.0.0.1:8080/');
		document.body.appendChild(scriptEl);
	}, 2000);
</script>
```

You should probably set your builds to not let this snippet into production.

#Configuration

Configuration is stored in `config.json`, read from the installation directory by default. To get started, make a copy of `config.json.example`. To use an alternate configuration filename, run with `--config [filename]`.

```json
{
	"logLevel": "none",
	"baseDir": "/var/www/rivet/bjn/media/browserdev",
	"reloadServerPort": 8080,
	"builds": [
		{
			"name": "Javascript",
			"trigger": {
				"path": "src/scripts",
				"include": "*.js"
			},
			"action": "ant lint js html"
		},
		{
			"name": "CSS",
			"trigger": {
				"path": "src/styles",
				"include": "*.less",
				"exclude": "sprites.less"
			},
			"action": "ant css html"
		},
		{
			"name": "Sprites",
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

##baseDir

This path will be used as a base when resolving trigger paths and running actions.

##reloadServerPort

Requests to listen on for reload notification requests.

##builds

###name

This will appear in the UI.

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