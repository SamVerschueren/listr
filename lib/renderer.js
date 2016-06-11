'use strict';
const logUpdate = require('log-update');

const render = tasks => {
	const output = tasks.map(task => task.render());
	logUpdate(output.join('\n'));
};

class Renderer {

	constructor(tasks) {
		this._tasks = tasks;
	}

	render() {
		this._id = setInterval(() => {
			render(this._tasks);
		}, 100);
	}

	end() {
		if (this._id) {
			clearInterval(this._id);
		}

		render(this._tasks);
	}
}

module.exports = Renderer;
