'use strict';
const state = require('./state');
const ListrError = require('./listr-error');

class TaskWrapper {
	constructor(task, errors) {
		this._task = task;
		this._errors = errors;
	}

	get title() {
		return this._task.title;
	}

	set title(title) {
		this._task.title = title;

		this._task.next({
			type: 'TITLE',
			data: title
		});
	}

	get output() {
		return this._task.output;
	}

	set output(data) {
		this._task.output = data;

		this._task.next({
			type: 'DATA',
			data
		});
	}

	report(error) {
		if (error instanceof ListrError) {
			for (const err of error.errors) {
				this._errors.push(err);
			}
		} else {
			this._errors.push(error);
		}
	}

	skip(message) {
		if (message && typeof message !== 'string') {
			throw new TypeError(`Expected \`message\` to be of type \`string\`, got \`${typeof message}\``);
		}

		if (message) {
			this._task.output = message;
		}

		this._task.state = state.SKIPPED;
	}

	run(ctx) {
		return this._task.run(ctx, this);
	}
}

module.exports = TaskWrapper;
