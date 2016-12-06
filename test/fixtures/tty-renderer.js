'use strict';
const SimpleRenderer = require('./simple-renderer');

class TTYRenderer extends SimpleRenderer {

	static get nonTTY() {
		return false;
	}

	end() {
		console.log('tty done');
	}
}

module.exports = TTYRenderer;
