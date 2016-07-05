'use strict';
const Ora = require('ora');
const logSymbols = require('log-symbols');
const figures = require('figures');
const chalk = require('chalk');
const indentString = require('indent-string');
const isStream = require('is-stream');
const streamToObservable = require('stream-to-observable');
const stripAnsi = require('strip-ansi');
const LocalRenderer = require('./renderer').LocalRenderer;
const state = require('./state');

const color = 'yellow';
const pointer = chalk[color](figures.pointer);

const isListr = obj => obj.setRenderer && obj.add && obj.run;

const getSymbol = task => {
	switch (task.state) {
		case state.PENDING:
			return task._result ? `${pointer} ` : task._spinner.frame();
		case state.COMPLETED:
			return `${logSymbols.success} `;
		case state.FAILED:
			return task._result ? `${pointer} ` : `${logSymbols.error} `;
		default:
			return '  ';
	}
};

class Task {

	constructor(listr, task) {
		if (!task) {
			throw new TypeError('Expected a task');
		}

		if (typeof task.title !== 'string') {
			throw new TypeError(`Expected property \`title\` of type \`string\` but got \`${typeof task.title}\``);
		}

		if (typeof task.task !== 'function') {
			throw new TypeError(`Expected property \`task\` of type \`function\` but got \`${typeof task.task}\``);
		}

		this._listr = listr;
		this._spinner = new Ora({color});

		this.title = task.title;
		this.task = task.task;
	}

	render() {
		let out = indentString(` ${getSymbol(this)}${this.title}`, '  ', this._listr.level);

		if (this._result) {
			const output = this._result.render();
			if (output !== null) {
				out += `\n${output}`;
			}
		}

		if (this.state === state.PENDING && this._lastLine) {
			out += `\n   ${indentString(chalk.gray(`${figures.arrowRight} ${this._lastLine}`), '  ', this._listr.level)}`;
		}

		return out;
	}

	run() {
		return Promise.resolve()
			.then(() => {
				this.state = state.PENDING;
				let result = this.task();

				// Detect the subtask
				if (isListr(result)) {
					result.level = this._listr.level + 1;
					result.setRenderer(LocalRenderer);
					this._result = result;
					return result.run();
				}

				// Detect stream
				if (isStream(result)) {
					result = streamToObservable(result);
				}

				// https://github.com/sindresorhus/is-observable/issues/1
				// Detect Observable
				if (result.subscribe && result.forEach) {
					return new Promise((resolve, reject) => {
						result.subscribe(
							data => {
								this._lastLine = stripAnsi(data.trim().split('\n').pop().trim());
							},
							reject,
							resolve
						);
					});
				}

				return result;
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
