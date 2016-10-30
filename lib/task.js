'use strict';
const isStream = require('is-stream');
const isPromise = require('is-promise');
const streamToObservable = require('stream-to-observable');
const Subject = require('rxjs/Subject').Subject;
const renderers = require('./renderer');
const state = require('./state');
const utils = require('./utils');

const defaultSkipFn = () => false;

class Task extends Subject {

	constructor(listr, task, options) {
		super();

		if (!task) {
			throw new TypeError('Expected a task');
		}

		if (typeof task.title !== 'string') {
			throw new TypeError(`Expected property \`title\` of type \`string\` but got \`${typeof task.title}\``);
		}

		if (typeof task.task !== 'function') {
			throw new TypeError(`Expected property \`task\` of type \`function\` but got \`${typeof task.task}\``);
		}

		if (task.skip && typeof task.skip !== 'function') {
			throw new TypeError(`Expected property \`skip\` of type \`function\` but got \`${typeof task.skip}\``);
		}

		this._listr = listr;
		this._options = options || {};
		this._subtasks = [];
		this._output = undefined;

		this.title = task.title;
		this.skip = task.skip || defaultSkipFn;
		this.task = task.task;
	}

	get output() {
		return this._output;
	}

	get subtasks() {
		return this._subtasks;
	}

	set state(state) {
		this._state = state;

		this.next({
			type: 'STATE'
		});
	}

	get state() {
		return state.toString(this._state);
	}

	hasSubtasks() {
		return this._subtasks.length > 0;
	}

	isPending() {
		return this._state === state.PENDING;
	}

	isSkipped() {
		return this._state === state.SKIPPED;
	}

	isCompleted() {
		return this._state === state.COMPLETED;
	}

	hasFailed() {
		return this._state === state.FAILED;
	}

	run(context) {
		const handleResult = result => {
			// Detect the subtask
			if (utils.isListr(result)) {
				result.setRenderer(renderers.silent);
				this._subtasks = result.tasks;

				this.next({
					type: 'SUBTASKS'
				});

				return result.run(context);
			}

			// Detect stream
			if (isStream(result)) {
				result = streamToObservable(result);
			}

			// Detect Observable
			if (utils.isObservable(result)) {
				result = new Promise((resolve, reject) => {
					result.subscribe({
						next: data => {
							this._output = data;

							this.next({
								type: 'DATA',
								data
							});
						},
						error: reject,
						complete: resolve
					});
				});
			}

			// Detect promise
			if (isPromise(result)) {
				return result.then(handleResult);
			}

			return result;
		};

		return Promise.resolve()
			.then(() => {
				this.state = state.PENDING;
				return this.skip(context);
			})
			.then(skipped => {
				if (skipped) {
					if (typeof skipped === 'string') {
						this._output = skipped;
					}
					this.state = state.SKIPPED;
					return;
				}

				return handleResult(this.task(context));
			})
			.then(() => {
				if (this.isPending()) {
					this.state = state.COMPLETED;
				}
			})
			.catch(err => {
				this.state = state.FAILED;
				throw err;
			})
			.then(() => {
				// Mark the Observable as completed
				this.complete();
			});
	}
}

module.exports = Task;
