'use strict';
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

		if (this._rendering === false) {
			return null;
		}

		return this._tasks.map(task => task.render()).join('\n');
	}

	end() {
		this._rendering = false;
	}
}

module.exports = LocalRenderer;
