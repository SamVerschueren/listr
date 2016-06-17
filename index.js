'use strict';
const Task = require('./lib/task');
const CLIRenderer = require('./lib/renderer').CLIRenderer;

class Listr {

	constructor(tasks) {
		if (tasks && !Array.isArray(tasks)) {
			throw new TypeError('Expected an array of tasks');
		}

		this._RendererClass = CLIRenderer;
		this._tasks = [];
		this.level = 0;

		tasks = tasks || [];
		tasks.forEach(this.addTask.bind(this));
	}

	setRenderer(renderer) {
		this._RendererClass = renderer;
	}

	addTask(task) {
		this._tasks.push(new Task(this, task));

		return this;
	}

	render() {
		if (!this._renderer) {
			this._renderer = new this._RendererClass(this._tasks);
		}

		return this._renderer.render();
	}

	run() {
		this.render();

		return this._tasks.reduce((promise, task) => promise.then(() => task.run()), Promise.resolve())
			.then(() => {
				this._renderer.end();
			})
			.catch(err => {
				if (this.level === 0) {
					this._renderer.end();
				}
				throw err;
			});
	}
}

module.exports = Listr;
