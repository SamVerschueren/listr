'use strict';
const Ora = require('ora');
const logSymbols = require('log-symbols');
const figures = require('figures');
const chalk = require('chalk');
const indentString = require('indent-string');
const isStream = require('is-stream');
const isPromise = require('is-promise');
const streamToObservable = require('stream-to-observable');
const stripAnsi = require('strip-ansi');
const cliTruncate = require('cli-truncate');
const StringRenderer = require('./renderer').StringRenderer;
const state = require('./state');

const color = 'yellow';
const pointer = chalk[color](figures.pointer);
const skipped = chalk[color](figures.arrowDown);

const isListr = obj => obj && obj.setRenderer && obj.add && obj.run;
// https://github.com/sindresorhus/is-observable/issues/1
const isObservable = obj => obj && obj.subscribe && obj.forEach;

const getSymbol = task => {
	switch (task.state) {
		case state.PENDING:
			return task.showSubtasks() ? `${pointer} ` : task._spinner.frame();
		case state.COMPLETED:
			return `${logSymbols.success} `;
		case state.FAILED:
			return task._result ? `${pointer} ` : `${logSymbols.error} `;
		case state.SKIPPED:
			return `${skipped} `;
		default:
			return '  ';
	}
};

const defaultSkipFn = () => false;

class Task {

	constructor(listr, task, options) {
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
		this._spinner = new Ora({color});

		this.title = task.title;
		this.skip = task.skip || defaultSkipFn;
		this.task = task.task;
	}

	showSubtasks() {
		return this._result && (this._options.showSubtasks !== false || this.state === state.FAILED);
	}

	render() {
		const skipped = this.state === state.SKIPPED ? ` ${chalk.dim('[skipped]')}` : '';
		let out = indentString(` ${getSymbol(this)}${this.title}${skipped}`, '  ', this._listr.level);

		if (this.showSubtasks()) {
			const output = this._result.render();
			if (output !== null) {
				out += `\n${output}`;
			}
		}

		if ((this.state === state.PENDING || this.state === state.SKIPPED) && this._output) {
			const lastLine = stripAnsi(this._output.trim().split('\n').pop().trim());
			if (lastLine) {
				const output = indentString(`${figures.arrowRight} ${lastLine}`, '  ', this._listr.level);
				out += `\n   ${chalk.gray(cliTruncate(output, process.stdout.columns - 3))}`;
			}
		}

		return out;
	}

	run() {
		const handleResult = result => {
			// Detect the subtask
			if (isListr(result)) {
				result.level = this._listr.level + 1;
				result.setRenderer(StringRenderer);
				this._result = result;
				return result.run();
			}

			// Detect stream
			if (isStream(result)) {
				result = streamToObservable(result);
			}

			// Detect Observable
			if (isObservable(result)) {
				result = new Promise((resolve, reject) => {
					result.subscribe({
						next: data => {
							this._output = data;
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
				return this.skip();
			})
			.then(skipped => {
				if (skipped) {
					this.state = state.SKIPPED;
					if (typeof skipped === 'string') {
						this._output = skipped;
					}
					return;
				}

				return handleResult(this.task());
			})
			.then(() => {
				if (this.state === state.PENDING) {
					this.state = state.COMPLETED;
				}
			})
			.catch(err => {
				this.state = state.FAILED;
				throw err;
			});
	}
}

module.exports = Task;
