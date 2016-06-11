import test from 'ava';
import Listr from './';

test('create', t => {
	t.notThrows(() => new Listr());
	t.throws(() => new Listr('foo'), 'Expected an array of tasks');

	const list = new Listr([{message: 'foo', task: () => {}}]);
	t.is(list._tasks.length, 1);
});

test('throw error if task properties are wrong', t => {
	t.throws(() => new Listr([{}]), 'Expected property `message` of type `string` but got `undefined`');
	t.throws(() => new Listr([{message: 5}]), 'Expected property `message` of type `string` but got `number`');
	t.throws(() => new Listr([{message: 'foo'}]), 'Expected property `task` of type `function` but got `undefined`');
	t.throws(() => new Listr([{message: 'foo', task: 'bar'}]), 'Expected property `task` of type `function` but got `string`');
});

test('`.addTask()` throws if task properties are wrong', t => {
	const list = new Listr();
	t.throws(list.addTask.bind(list), 'Expected a task');
	t.throws(list.addTask.bind(list, {}), 'Expected property `message` of type `string` but got `undefined`');
	t.throws(list.addTask.bind(list, {message: 5}), 'Expected property `message` of type `string` but got `number`');
	t.throws(list.addTask.bind(list, {message: 'foo'}), 'Expected property `task` of type `function` but got `undefined`');
	t.throws(list.addTask.bind(list, {message: 'foo', task: 'bar'}), 'Expected property `task` of type `function` but got `string`');
});

test('throw error if task rejects', t => {
	const list = new Listr([
		{
			message: 'foo',
			task: () => Promise.reject(new Error('foo bar'))
		}
	]);

	t.throws(list.run(), 'foo bar');
});

test('throw error if task throws', t => {
	const list = new Listr([
		{
			message: 'foo',
			task: () => {
				throw new Error('foo bar');
			}
		}
	]);

	t.throws(list.run(), 'foo bar');
});

test('execute tasks', t => {
	const list = new Listr([
		{
			message: 'foo',
			task: () => Promise.resolve('bar')
		}
	]);

	t.notThrows(list.run());
});

test('add tasks', t => {
	const list = new Listr()
		.addTask({message: 'foo', task: () => {}})
		.addTask({message: 'bar', task: () => {}});

	t.is(list._tasks.length, 2);
});
