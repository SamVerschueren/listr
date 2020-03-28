'use strict';
const {spawn} = require('child_process');
const path = require('path');
const test = require('ava');

const executeTask = async (t, suspendUpdateRenderer) => {
	const promise = new Promise((resolve, reject) => {
		const childProcess = spawn('./task-with-input.js', [suspendUpdateRenderer], {cwd: path.resolve('test', 'fixtures')});
		childProcess.stdout.pipe(process.stdout);
		childProcess.on('close', code => {
			if (code !== 0) {
				reject(new Error(`exit code ${code}`));
			}

			resolve();
		});
		setTimeout(() => {
			childProcess.stdin.write('yes');
		}, 50);
	});
	await promise;
	t.pass();
};

test('should receive user input from task with running renderer', executeTask);
test('should receive user input from task with suspended renderer', executeTask, 'true');
