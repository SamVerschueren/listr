
const renderHelper = (task, event) => {
	switch (event.type) {
		case 'STATE': {
			const state = task.isPending() ? 'started' : task.state;
			console.log(`${task.title} [${state}]`);

			if (task.isSkipped() && task.output) {
				console.log(`> ${task.output}`);
			}

			break;
		}

		case 'DATA': {
			console.log(`> ${event.data}`);

			break;
		}

		case 'TITLE': {
			console.log(`${task.title} [title changed]`);

			break;
		}
	// No default
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
			error => {
				console.log(error);
			},
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

export default SimpleRenderer;
