'use strict';
const Renderer = require('./lib/renderer');
const state = require('./lib/state');

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
		if (!task) {
			throw new TypeError('Expected a task');
		}

		if (typeof task.message !== 'string') {
			throw new TypeError(`Expected property \`message\` of type \`string\` but got \`${typeof task.message}\``);
		}

		if (typeof task.task !== 'function') {
			throw new TypeError(`Expected property \`task\` of type \`function\` but got \`${typeof task.task}\``);
		}

		this._tasks.push(task);
	}

	run() {
		this._renderer = new Renderer(this._tasks);
		this._renderer.render();

		function wrap(task) {
			return Promise.resolve()
				.then(() => {
					task.state = state.PENDING;
					return task.task();
				})
				.then(() => {
					task.state = state.COMPLETED;
				})
				.catch(err => {
					task.state = state.FAILED;
					throw err;
				});
		}

		return this._tasks.reduce((promise, task) => promise.then(() => wrap(task)), Promise.resolve())
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
