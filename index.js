'use strict';
const Task = require('./lib/task');
const renderers = require('./lib/renderer');

const getRenderer = renderer => {
	if (typeof renderer === 'string') {
		return renderers[renderer] || renderers.default;
	}

	return renderer || renderers.default;
};

class Listr {

	constructor(tasks, opts) {
		if (tasks && !Array.isArray(tasks) && typeof tasks === 'object') {
			opts = tasks;
			tasks = [];
		}

		if (tasks && !Array.isArray(tasks)) {
			throw new TypeError('Expected an array of tasks');
		}

		this._options = Object.assign({
			showSubtasks: true,
			concurrent: false,
			renderer: 'default'
		}, opts);
		this._tasks = [];
		this._RendererClass = getRenderer(this._options.renderer);

		this.add(tasks || []);
	}

	get tasks() {
		return this._tasks;
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
			this._renderer = new this._RendererClass(this._tasks, this._options);
		}

		return this._renderer.render();
	}

	run(context) {
		this.render();

		context = context || Object.create(null);

		let tasks;
		if (this._options.concurrent === true) {
			tasks = Promise.all(this._tasks.map(task => task.run(context)));
		} else {
			tasks = this._tasks.reduce((promise, task) => promise.then(() => task.run(context)), Promise.resolve());
		}

		return tasks
			.then(() => {
				this._renderer.end();
			})
			.catch(err => {
				this._renderer.end(err);
				throw err;
			});
	}
}

module.exports = Listr;
