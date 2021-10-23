import state from './state.js';
import ListrError from './listr-error.js';

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
			data: title,
		});
	}

	get output() {
		return this._task.output;
	}

	set output(data) {
		this._task.output = data;

		this._task.next({
			type: 'DATA',
			data,
		});
	}

	report(error) {
		if (error instanceof ListrError) {
			for (const error_ of error.errors) {
				this._errors.push(error_);
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

export default TaskWrapper;
