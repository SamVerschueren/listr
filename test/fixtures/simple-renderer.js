'use strict';

const renderHelper = (task, event) => {
	if (event.type === 'STATE') {
		const state = task.isPending() ? 'started' : task.state;
		console.log(`${task.title} [${state}]`);

		if (task.isSkipped() && task.output) {
			console.log(`> ${task.output}`);
		}
	} else if (event.type === 'DATA') {
		console.log(`> ${event.data}`);
	}
};

const render = tasks => {
	for (const task of tasks) {
		task.subscribe(
			event => {
				if (event.type === 'SUBTASKS') {
					render(task.subtasks);
					return;
				}

				renderHelper(task, event);
			},
			err => {
				console.log(err);
			}
		);
	}
};

class SimpleRenderer {

	constructor(tasks) {
		this._tasks = tasks;
	}

	static get nonTTY() {
		return true;
	}

	render() {
		render(this._tasks);
	}

	end() {
		console.log('done');
	}
}

module.exports = SimpleRenderer;
