import test from 'ava';
import Listr from './';

test('create', t => {
	t.notThrows(() => new Listr());
	t.throws(() => new Listr('foo'), 'Expected an array of tasks');

	let list;

	list = new Listr([{title: 'foo', task: () => {}}]);
	t.is(list._tasks.length, 1);
	t.true(list._options.showSubtasks);

	list = new Listr({showSubtasks: false});
	t.is(list._tasks.length, 0);
	t.false(list._options.showSubtasks);

	list = new Listr([{title: 'foo', task: () => {}}], {showSubtasks: false});
	t.is(list._tasks.length, 1);
	t.false(list._options.showSubtasks);
});

test('throw error if task properties are wrong', t => {
	t.throws(() => new Listr([{}]), 'Expected property `title` of type `string` but got `undefined`');
	t.throws(() => new Listr([{title: 5}]), 'Expected property `title` of type `string` but got `number`');
	t.throws(() => new Listr([{title: 'foo'}]), 'Expected property `task` of type `function` but got `undefined`');
	t.throws(() => new Listr([{title: 'foo', task: 'bar'}]), 'Expected property `task` of type `function` but got `string`');
});

test('`.addTask()` throws if task properties are wrong', t => {
	const list = new Listr();
	t.throws(list.add.bind(list), 'Expected a task');
	t.throws(list.add.bind(list, {}), 'Expected property `title` of type `string` but got `undefined`');
	t.throws(list.add.bind(list, {title: 5}), 'Expected property `title` of type `string` but got `number`');
	t.throws(list.add.bind(list, {title: 'foo'}), 'Expected property `task` of type `function` but got `undefined`');
	t.throws(list.add.bind(list, {title: 'foo', task: 'bar'}), 'Expected property `task` of type `function` but got `string`');
});

test('throw error if task rejects', t => {
	const list = new Listr([
		{
			title: 'foo',
			task: () => Promise.reject(new Error('foo bar'))
		}
	]);

	t.throws(list.run(), 'foo bar');
});

test('throw error if task throws', t => {
	const list = new Listr([
		{
			title: 'foo',
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
			title: 'foo',
			task: () => Promise.resolve('bar')
		}
	]);

	t.notThrows(list.run());
});

test('add tasks', t => {
	const list = new Listr()
		.add({title: 'foo', task: () => {}})
		.add([
			{title: 'hello', task: () => {}},
			{title: 'world', task: () => {}}
		])
		.add({title: 'bar', task: () => {}});

	t.is(list._tasks.length, 4);
});

test('skip tasks', t => {
	t.plan(5);

	const list = new Listr([
		{
			title: 'Task 1',
			task: () => new Listr([
				{title: 'Task 1.1', task: () => t.pass() || '1.1'},
				{title: 'Task 1.2', task: () => t.pass() || '1.2'}
			])
		},
		{
			title: 'Task 2',
			task: () => new Listr([
				{title: 'Task 2.1', task: () => t.pass() || '2.1'},
				{
					title: 'Task 2.2',
					task: task => {
						task.skip('Skipping sub task');
						t.fail('Skipping should abort execution of the task');
					}
				},
				{title: 'Task 2.3', task: () => t.pass() || '2.2'}
			])
		},
		{
			title: 'Task 3',
			task: task => {
				task.skip('Skipping task');
				t.fail('Skipping should abort execution of the task');
			}
		},
		{title: 'Task 4', task: () => t.pass() || '4'}
	]);

	return list.run();
});
