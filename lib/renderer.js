'use strict';
const Ora = require('ora');
const logUpdate = require('log-update');
const logSymbols = require('log-symbols');
const state = require('./state');

const spinner = new Ora();

const getSymbol = task => {
	switch (task.state) {
		case state.PENDING:
			return spinner.frame();
		case state.COMPLETED:
			return `${logSymbols.success} `;
		case state.FAILED:
			return `${logSymbols.error} `;
		default:
			return '  ';
	}
};

const render = tasks => {
	const output = tasks.map(task => ` ${getSymbol(task)}${task.message}`);
	logUpdate(output.join('\n'));
};

class Renderer {

	constructor(tasks) {
		this._tasks = tasks;
	}

	render() {
		this._id = setInterval(() => {
			render(this._tasks);
		}, 100);
	}

	end() {
		if (this._id) {
			clearInterval(this._id);
		}

		render(this._tasks);
	}
}

module.exports = Renderer;
