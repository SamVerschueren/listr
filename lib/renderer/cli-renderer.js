'use strict';
const logUpdate = require('log-update');

const render = tasks => {
	const output = tasks.map(task => task.render());
	logUpdate(output.join('\n'));
};

/**
 * The `.render()` method renders the output to the screen
 */
class CLIRenderer {

	constructor(tasks) {
		this._tasks = tasks;
	}

	render() {
		if (this._id) {
			// Do not render if we are already rendering
			return;
		}

		this._id = setInterval(() => {
			render(this._tasks);
		}, 100);
	}

	end() {
		if (this._id) {
			clearInterval(this._id);
			this._id = undefined;
		}

		render(this._tasks);
		logUpdate.done();
	}
}

module.exports = CLIRenderer;
