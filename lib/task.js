'use strict';
const isPromise = require('is-promise');
const ow = require('ow');
const streamToObservable = require('@samverschueren/stream-to-observable');
const Subject = require('rxjs').Subject;
const renderer = require('./renderer');
const state = require('./state');
const utils = require('./utils');
const ListrError = require('./listr-error');

const defaultSkipFn = () => false;

class Task extends Subject {
	constructor(listr, task, options) {
		super();

		ow(task, ow.object);
		ow(task.title, ow.string);
		ow(task.task, ow.function);
		if (task.skip) {
			ow(task.skip, ow.function);
		}
		if (task.enabled) {
			ow(task.enabled, ow.function);
		}

		this._listr = listr;
		this._options = options || {};
		this._subtasks = [];
		this._enabledFn = task.enabled;
		this._isEnabled = true;

		this.output = undefined;
		this.title = task.title;
		this.skip = task.skip || defaultSkipFn;
		this.task = task.task;
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

	check(ctx) {
		// Check if a task is enabled or disabled
		if (this._state === undefined && this._enabledFn) {
			const isEnabled = this._enabledFn(ctx);

			if (this._isEnabled !== isEnabled) {
				this._isEnabled = isEnabled;

				this.next({
					type: 'ENABLED',
					data: isEnabled
				});
			}
		}
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

	isEnabled() {
		return this._isEnabled;
	}

	hasFailed() {
		return this._state === state.FAILED;
	}

	run(context, wrapper) {
		const handleResult = result => {
			// Detect the subtask
			if (utils.isListr(result)) {
				result._options = Object.assign(this._options, result._options);

				result.exitOnError = result._options.exitOnError;

				result.setRenderer(renderer.getRenderer('silent'));
				this._subtasks = result.tasks;

				this.next({
					type: 'SUBTASKS'
				});

				return result.run(context);
			}

			// Detect stream
			if (utils.isStream(result)) {
				result = streamToObservable(result);
			}

			// Detect Observable
			if (utils.isObservable(result)) {
				result = new Promise((resolve, reject) => {
					result.subscribe({
						next: data => {
							this.output = data;

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
						this.output = skipped;
					}
					this.state = state.SKIPPED;
					return;
				}

				return handleResult(this.task(context, wrapper));
			})
			.then(() => {
				if (this.isPending()) {
					this.state = state.COMPLETED;
				}
			})
			.catch(err => {
				this.state = state.FAILED;

				if (err instanceof ListrError) {
					wrapper.report(err);
					return;
				}

				if (!this.hasSubtasks()) {
					// Do not show the message if we have subtasks as the error is already shown in the subtask
					this.output = err.message;
				}

				this.next({
					type: 'DATA',
					data: err.message
				});

				wrapper.report(err);

				if (this._listr.exitOnError !== false) {
					// Do not exit when explicitely set to `false`
					throw err;
				}
			})
			.then(() => {
				// Mark the Observable as completed
				this.complete();
			});
	}
}

module.exports = Task;
