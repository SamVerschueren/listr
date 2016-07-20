'use strict';

const state = require('../state');

/**
 * The `.render()` method returns the output
 */
class LocalRenderer {

	constructor(tasks) {
		this._tasks = tasks;
	}

	render() {
		if (this._rendering === undefined) {
			this._rendering = true;
		}

		let tasks = this._tasks;

		if (this._rendering === false) {
			// Even if we're finished rendering we still want to render any skipped tasks and their reason for being skipped
			tasks = this._tasks.filter(task => task.state === state.SKIPPED);

			if (!tasks.length) {
				return null;
			}
		}

		return tasks.map(task => task.render()).join('\n');
	}

	end() {
		this._rendering = false;
	}
}

module.exports = LocalRenderer;
