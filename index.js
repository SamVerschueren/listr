'use strict';
const Task = require('./lib/task');
const Renderer = require('./lib/renderer');

class Listr {

	constructor(tasks) {
		if (tasks && !Array.isArray(tasks)) {
			throw new TypeError('Expected an array of tasks');
		}

		this._tasks = [];

		tasks = tasks || [];
		tasks.forEach(this.addTask.bind(this));
	}

	addTask(task) {
		this._tasks.push(new Task(task));

		return this;
	}

	run() {
		this._renderer = new Renderer(this._tasks);
		this._renderer.render();

		return this._tasks.reduce((promise, task) => promise.then(() => task.run()), Promise.resolve())
			.then(() => {
				this._renderer.end();
			})
			.catch(err => {
				this._renderer.end();
				throw err;
			});
	}
}

module.exports = Listr;
