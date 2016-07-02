#!/usr/bin/env node

'use strict';

var globlr = require('.');


var argv = require('minimist')(process.argv.slice(2), {
	alias: {
		'help': 'h',
		'port': 'p',
		'delay': 'd',
		'quiet': 'q',
	},
});

//Help
if (argv.help || !argv._.length) {
	console.log(`
Takes globs, watches matching files, runs a livereload server
Usage: glob-lr 'glob_string...' [options]
Example: glob-lr 'client/**/*.{css,js}' '!client/vendor/**' -d 5000
Options:
    -p, --port        Port to host livereload server at, default 35729
    -d, --delay       Milliseconds to debounce changes, default 200
    -q, --quiet       Suppress console output
    --noDefaultGlobs  Without this option node_modules is ignored
    Other options will be passed to the chokidar and tiny-lr modules on npm
`);
	process.exit();
}


// Non-option parameters are globs to be passed to the watcher
var globs = argv._;
delete argv._;


globlr(globs, argv);