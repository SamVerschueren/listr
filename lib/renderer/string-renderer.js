'use strict';
const state = require('../state');

/**
 * The `.render()` method returns the output as a string
 */
class StringRenderer {

	constructor(tasks) {
		this._tasks = tasks;
	}

	render() {
		if (this._rendering === undefined) {
			this._rendering = true;
		}

		if (this._rendering === false && !this._tasks.some(task => task.state === state.SKIPPED)) {
			return null;
		}

		return this._tasks.map(task => task.render()).join('\n');
	}

	end() {
		this._rendering = false;
	}
}

module.exports = StringRenderer;
