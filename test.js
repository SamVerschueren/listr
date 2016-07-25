import test from 'ava';
import Listr from './';

test('create', t => {
	t.notThrows(() => new Listr());
	t.throws(() => new Listr('foo'), 'Expected an array of tasks');

	let list;

	list = new Listr([{title: 'foo', task: () => {}}]);
	t.is(list._tasks.length, 1);
	t.true(list._options.showSubtasks);
	t.false(list._options.concurrent);

	list = new Listr({showSubtasks: false, concurrent: true});
	t.is(list._tasks.length, 0);
	t.false(list._options.showSubtasks);
	t.true(list._options.concurrent);

	list = new Listr([{title: 'foo', task: () => {}}], {showSubtasks: false, concurrent: true});
	t.is(list._tasks.length, 1);
	t.false(list._options.showSubtasks);
	t.true(list._options.concurrent);
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

test('throw error if task skip rejects', t => {
	const list = new Listr([
		{
			title: 'foo',
			skip: () => Promise.reject(new Error('skip foo')),
			task: () => {}
		}
	]);

	t.throws(list.run(), 'skip foo');
});

test('throw error if task skip throws', t => {
	const list = new Listr([
		{
			title: 'foo',
			skip: () => {
				throw new Error('skip foo');
			},
			task: () => {}
		}
	]);

	t.throws(list.run(), 'skip foo');
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

test('continue execution if skip() returns false or Promise for false', async t => {
	t.plan(5); // Verify the correct number of tasks were executed

	const list = new Listr([
		{
			title: 'Task 1',
			task: () => new Listr([
				{
					title: 'Task 1.1',
					task: () => t.pass()
				},
				{
					title: 'Task 1.2',
					skip: () => false,
					task: () => t.pass()
				},
				{
					title: 'Task 1.3',
					task: () => t.pass()
				}
			])
		},
		{
			title: 'Task 2',
			skip: () => Promise.resolve(false),
			task: () => t.pass()
		},
		{
			title: 'Task 3',
			task: () => t.pass()
		}
	]);

	await list.run();
});

test('skip task if skip() returns true or Promise for true', async t => {
	t.plan(3); // Verify the correct number of tasks were executed

	const list = new Listr([
		{
			title: 'Task 1',
			task: () => new Listr([
				{
					title: 'Task 1.1',
					task: () => t.pass()
				},
				{
					title: 'Task 1.2',
					skip: () => true,
					task: () => t.fail('Skipped task should not be executed')
				},
				{
					title: 'Task 1.3',
					task: () => t.pass()
				}
			])
		},
		{
			title: 'Task 2',
			skip: () => Promise.resolve(true),
			task: () => t.fail('Skipped task should not be executed')
		},
		{
			title: 'Task 3',
			task: () => t.pass()
		}
	]);

	await list.run();
});

test('skip task with custom reason if skip() returns string or Promise for string', async t => {
	t.plan(3); // Verify the correct number of tasks were executed

	const list = new Listr([
		{
			title: 'Task 1',
			task: () => new Listr([
				{
					title: 'Task 1.1',
					task: () => t.pass()
				},
				{
					title: 'Task 1.2',
					skip: () => 'skip',
					task: () => t.fail('Skipped task should not be executed')
				},
				{
					title: 'Task 1.3',
					task: () => t.pass()
				}
			])
		},
		{
			title: 'Task 2',
			skip: () => Promise.resolve('skip'),
			task: () => t.fail('Skipped task should not be executed')
		},
		{
			title: 'Task 3',
			task: () => t.pass()
		}
	]);

	await list.run();
});
