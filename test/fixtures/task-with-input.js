#!/usr/bin/env node
'use strict';
const Listr = require('../..');

function getTasks(suspendUpdateRenderer) {
	const task = () => {
		return new Promise((resolve, reject) => {
			console.log('Continue?');
			process.stdin.on('data', chunk => {
				const received = chunk.toString().replace('\n', '');
				if (received === 'yes') {
					resolve(received);
				} else {
					reject(new Error(`invalid input ${received}`));
				}
			});
		});
	};

	return new Listr([
		{
			title: `receive user input from task with renderer is ${suspendUpdateRenderer ? 'suspended' : 'running'}`,
			task,
			options: {suspendUpdateRenderer}
		}
	]);
}

(async () => {
	let suspendUpdateRenderer = false;
	if (process.argv[2] === 'true') {
		suspendUpdateRenderer = true;
	}

	await getTasks(suspendUpdateRenderer).run();
	process.exit(0);
})();
