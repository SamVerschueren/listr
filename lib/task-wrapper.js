'use strict';
class TaskWrapper {

	constructor(task) {
		this._task = task;
	}

	set title(title) {
		this._task.title = title;

		this._task.next({
			type: 'TITLE',
			data: title
		});
	}

	run(ctx) {
		return this._task.run(ctx, this);
	}
}

module.exports = TaskWrapper;
