'use strict';
const Ora = require('ora');
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

class Task {

	constructor(task) {
		if (!task) {
			throw new TypeError('Expected a task');
		}

		if (typeof task.message !== 'string') {
			throw new TypeError(`Expected property \`message\` of type \`string\` but got \`${typeof task.message}\``);
		}

		if (typeof task.task !== 'function') {
			throw new TypeError(`Expected property \`task\` of type \`function\` but got \`${typeof task.task}\``);
		}

		this.message = task.message;
		this.task = task.task;
	}

	render() {
		return ` ${getSymbol(this)}${this.message}`;
	}

	run() {
		return Promise.resolve()
			.then(() => {
				this.state = state.PENDING;
				return this.task();
			})
			.then(() => {
				this.state = state.COMPLETED;
			})
			.catch(err => {
				this.state = state.FAILED;
				throw err;
			});
	}
}

module.exports = Task;
