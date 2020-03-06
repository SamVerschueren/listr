import test from 'ava';
import mockery from 'mockery';
import elegantSpinner from 'elegant-spinner';

function getTasks() {
	const Listr = require('..');
	const tasks = new Listr([
		{
			title: 'first',
			task: () => {
				return new Promise(resolve => {
					setTimeout(() => {
						resolve('predefined output');
					}, 150);
				});
			}
		},
		{
			title: 'second',
			task: () => {
				return new Promise(resolve => {
					setTimeout(() => {
						resolve('predefined output');
					}, 300);
				});
			},
			options: {suspendUpdateRenderer: true}
		},
		{
			title: 'last',
			task: () => {
				return new Promise(resolve => {
					setTimeout(() => {
						resolve('predefined output');
					}, 100);
				});
			}
		}
	]);

	return tasks;
}

test('should not erase output from suspended task, as long as this task is running', async t => {
	const countOutputIsErasedWhenTaskRunning = {first: 0, second: 0, last: 0};

	const logUpdate = output => {
		const taskPendingPattern = new RegExp(elegantSpinner.frames.join('|'));
		const tasks = output.split('\n');
		for (const task of tasks) {
			if (task.search(taskPendingPattern) > 0) {
				const title = task.match(/first|second|last/);
				countOutputIsErasedWhenTaskRunning[title]++;
			}
		}
	};

	logUpdate.done = () => {};

	mockery.registerAllowable('..');
	mockery.registerMock('log-update', logUpdate);
	mockery.enable({useCleanCache: true, warnOnUnregistered: false});

	await getTasks().run();

	mockery.deregisterAll();
	mockery.disable();

	t.deepEqual(countOutputIsErasedWhenTaskRunning, {first: 1, second: 0, last: 1});
});
