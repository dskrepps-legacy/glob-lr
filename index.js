
'use strict';

var debug = require('debug')('glob-lr');
var watch = require('chokidar').watch;
var debounce = require('lodash.debounce');
var tinylr = require('tiny-lr');


var defaults = {
	port: 35729, // standard LiveReload port
	delay: 200, // Milliseconds to debounce notification
	quiet: false, // Suppress console output (unless using debug)
	noDefaultGlobs: false,
};


module.exports = function globlr(globs, opts) {
	
	var self = {fileCount: 0};
	
	if (!Array.isArray(globs)) {
		globs = [globs];
	}
	
	opts = Object.assign({}, defaults, opts);
	
	
	var log = opts.quiet
		? debug
		: console.log;
	
	
	// Defaults NEGATIVE globs only
	if (!opts.noDefaultGlobs) {
		globs.push(
			// Ignore node_modules and .git, etc at ANY depth
			'!**/node_modules/**',
			'!.git', '!.svn', '!.hg'
		);
	}
	
	
	debug('Watching glob rules:', globs);
	
	
	
	
	
	
	
	
	//
	// Start our tiny-lr LiveReload server
	//
	var server = tinylr(opts);
	server.on('error', shutdown);
	
	server.listen(opts.port, ()=>{
		log('LiveReload listening on port %s', opts.port);
	});
	
	
	
	
	//
	// Watch for files added, changed, or unlinked, and debounce notify
	//
	var watcher = watch(globs, opts);
	watcher.on('error', shutdown);
	
	var queue = {};
	var debouncedNotify = debounce(notify, opts.delay);
	watcher.on('add', watcherFileEvent.bind(null, 'add'));
	watcher.on('change', watcherFileEvent.bind(null, 'change'));
	watcher.on('unlink', watcherFileEvent.bind(null, 'unlink'));
	function watcherFileEvent(event, filepath, stat) {
		queue[event] = queue[event] || {};
		queue[event][filepath] = true;
		debouncedNotify();
	}
	
	
	
	
	
	//
	// Notify tiny-lr of changed file (debounced)
	//
	function notify(){
		
		var addedFiles = Object.keys(queue.add || {});
		var changedFiles = Object.keys(queue.change || {});
		var unlinkedFiles = Object.keys(queue.unlink || {});
		var files = addedFiles.concat(changedFiles, unlinkedFiles);
		queue = {};
		
		
		if (addedFiles.length) {
			log('LiveReload added %d files', addedFiles.length);
			debug('Added files:', addedFiles.join(', '));
			self.fileCount += addedFiles.length;
		}
		
		if (changedFiles.length) {
			log('LiveReload:', changedFiles.join(', '));
		}
		
		if (unlinkedFiles.length) {
			log('LiveReload unlinked %d files', unlinkedFiles.length);
			self.fileCount -= unlinkedFiles.length;
		}
		
		server.changed({
			body: {
				files: files,
			}
		});
	}
	
	
	
	
	//
	// SHUT. DOWN. EVERYTHING. so the process can end.
	//
	function shutdown(err) {
		err && console.error(err);
		log('Stopping LiveReload');
		debouncedNotify.cancel();
		server.close();
		watcher.close();
	};
	
	
	
	
	self.watcher = watcher;
	self.server = server;
	self.shutdown = shutdown;
	
	return self;
};
