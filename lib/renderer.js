'use strict';
module.exports = {
	silent: require('listr-silent-renderer'),
	verbose: require('listr-verbose-renderer'),
	default: require('listr-update-renderer')
};
