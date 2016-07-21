'use strict';
const Task = require('./lib/task');
const CLIRenderer = require('./lib/renderer').CLIRenderer;

class Listr {

	constructor(tasks, opts) {
		if (tasks && !Array.isArray(tasks) && typeof tasks === 'object') {
			opts = tasks;
			tasks = [];
		}

		if (tasks && !Array.isArray(tasks)) {
			throw new TypeError('Expected an array of tasks');
		}

		this._RendererClass = CLIRenderer;
		this._tasks = [];
		this._options = Object.assign({
			showSubtasks: true,
			concurrent: false
		}, opts);

		this.level = 0;

		this.add(tasks || []);
	}

	setRenderer(renderer) {
		this._RendererClass = renderer;
	}

	add(task) {
		const tasks = Array.isArray(task) ? task : [task];

		for (const task of tasks) {
			this._tasks.push(new Task(this, task, this._options));
		}

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

		let tasks;
		if (this._options.concurrent === true) {
			tasks = Promise.all(this._tasks.map(task => task.run()));
		} else {
			tasks = this._tasks.reduce((promise, task) => promise.then(() => task.run()), Promise.resolve());
		}

		return tasks
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
