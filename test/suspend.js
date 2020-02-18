import test from 'ava';
import sinon from 'sinon';
import Listr from '..';

const logUpdateApi = {
	main: require('log-update')
};

const render = tasks => {
	const taskStatus = [];
	for (const task of tasks) {
		taskStatus.push({title: task.title, shouldSuspend: task.shouldSuspendUpdateRenderer(), completed: task.isCompleted()});
	}

	logUpdateApi.main(taskStatus);
};

class TaskRenderer {
	constructor(tasks) {
		this._tasks = tasks;
	}

	static get nonTTY() {
		return true;
	}

	render() {
		this._id = setInterval(() => {
			render(this._tasks);
		}, 100);
	}

	end() {
		clearInterval(this._id);
	}
}

function getTasks() {
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
					}, 300);
				});
			},
			options: {suspendUpdateRenderer: true}
		},
		{
			title: 'last task',
			task: () => {
				return new Promise(resolve => {
					setTimeout(() => {
						resolve('predefined output');
					}, 100);
				});
			}
		}
	], {renderer: TaskRenderer});

	return tasks;
}

test('should suspend second task', async t => {
	const mock = sinon.mock(logUpdateApi);
	mock.expects('main').withExactArgs([{title: 'not suspending task', shouldSuspend: false, completed: false},
		{title: 'suspending task', shouldSuspend: false, completed: false},
		{title: 'last task', shouldSuspend: false, completed: false}]).once();
	mock.expects('main').withExactArgs([{title: 'not suspending task', shouldSuspend: false, completed: true},
		{title: 'suspending task', shouldSuspend: true, completed: false},
		{title: 'last task', shouldSuspend: false, completed: false}]).atLeast(1);
	mock.expects('main').withExactArgs([{title: 'not suspending task', shouldSuspend: false, completed: true},
		{title: 'suspending task', shouldSuspend: false, completed: true},
		{title: 'last task', shouldSuspend: false, completed: false}]).once();
	await getTasks().run();
	t.true(mock.verify());
});
