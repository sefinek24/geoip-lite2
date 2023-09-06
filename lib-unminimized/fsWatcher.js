const fs = require('node:fs'),
	path = require('node:path'),
	FSWatcher = {};

/**
 * Takes a directory/file and watch for change. Upon change, call the
 * callback.
 *
 * @param name
 * @param directory
 * @param {String} [filename]: (optional) specific filename to watch for, watches for all files in the directory if unspecified
 * @param cooldownDelay
 * @param callback
 **/
function makeFsWatchFilter(name, directory, filename, cooldownDelay, callback) {
	let cooldownId = null;

	// Delete the cooldownId and callback the outer function
	function timeoutCallback() {
		cooldownId = null;
		callback();
	}

	// This function is called when there is a change in the data directory
	// It sets a timer to wait for the change to be completed
	function onWatchEvent(event, changedFile) {
		// Check to make sure changedFile is not null
		if (!changedFile) {
			return;
		}

		const filePath = path.join(directory, changedFile);
		if (!filename || filename === changedFile) {
			fs.exists(filePath, function onExists(exists) {
				if (!exists) return; // If the changed file no longer exists, it was a deletion. We ignore deleted files.

				// At this point, a new file system activity has been detected,
				// We have to wait for file transfer to be finished before moving on.

				// If a cooldownId already exists, we delete it
				if (cooldownId !== null) {
					clearTimeout(cooldownId);
					cooldownId = null;
				}

				// Once the cooldownDelay has passed, the timeoutCallback function will be called
				cooldownId = setTimeout(timeoutCallback, cooldownDelay);
			});
		}
	}

	// Manage the case where filename is missing (because it's optional)
	if (typeof cooldownDelay === 'function') {
		callback = cooldownDelay;
		cooldownDelay = filename;
		filename = null;
	}

	if (FSWatcher[name]) {
		stopWatching(name);
	}

	FSWatcher[name] = fs.watch(directory, onWatchEvent);
}

/**
 * Take a FSWatcher object and close it.
 * @param name
 **/
function stopWatching(name) {
	FSWatcher[name].close();
}

module.exports.makeFsWatchFilter = makeFsWatchFilter;
module.exports.stopWatching = stopWatching;