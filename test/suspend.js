import {serial as test} from 'ava';
import sinon from 'sinon';

const mockery = require('mockery');

const logUpdateApi = {
	main: require('log-update')
};

const mock = sinon.mock(logUpdateApi);

function getTasks() {
	// Require is necessary at this position, otherwise mockery is not working correctly
	const Listr = require('..');
	const tasks = new Listr([
		{
			title: 'not suspending task',
			task: () => {
				return new Promise(resolve => {
					setTimeout(() => {
						resolve('predefined output');
					}, 150);
				});
			}
		},
		{
			title: 'suspending task',
			task: () => {
				return new Promise(resolve => {
					setTimeout(() => {
						resolve('predefined output');
					}, 4000);
				});
			},
			options: {suspendUpdateRenderer: true}
		}
	]);

	return tasks;
}

test.before(() => {
	/* One time for the first task,
	   one time when both tasks are finished
	*/
	mock.expects('main').twice();
	mockery.registerAllowable('..');
	mockery.registerMock('log-update', logUpdateApi.main);
	mockery.enable({useCleanCache: true, warnOnUnregistered: false});
});

test.after(() => {
	mockery.disable();
	mockery.deregisterAll();
});

test('should suspend second task', async t => {
	await getTasks().run();

	t.true(mock.verify());
});
