import test from 'ava';
import Listr from '../';

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
	t.throws(() => new Listr([{}]), 'Expected property `title` to be of type `string`, got `undefined`');
	t.throws(() => new Listr([{title: 5}]), 'Expected property `title` to be of type `string`, got `number`');
	t.throws(() => new Listr([{title: 'foo'}]), 'Expected property `task` to be of type `function`, got `undefined`');
	t.throws(() => new Listr([{title: 'foo', task: 'bar'}]), 'Expected property `task` to be of type `function`, got `string`');
	t.throws(() => new Listr([{title: 'foo', task: () => {}, skip: 5}]), 'Expected property `skip` to be of type `function`, got `number`');
	t.throws(() => new Listr([{title: 'foo', task: () => {}, enabled: 5}]), 'Expected property `enabled` to be of type `function`, got `number`');
});

test('throw error if a task object is provided', t => {
	t.throws(() => new Listr({title: 'foo', task: () => {}}), 'Expected an array of tasks or an options object, got a task object');
});

test('`.addTask()` throws if task properties are wrong', t => {
	const list = new Listr();
	t.throws(list.add.bind(list), 'Expected a task');
	t.throws(list.add.bind(list, {}), 'Expected property `title` to be of type `string`, got `undefined`');
	t.throws(list.add.bind(list, {title: 5}), 'Expected property `title` to be of type `string`, got `number`');
	t.throws(list.add.bind(list, {title: 'foo'}), 'Expected property `task` to be of type `function`, got `undefined`');
	t.throws(list.add.bind(list, {title: 'foo', task: 'bar'}), 'Expected property `task` to be of type `function`, got `string`');
	t.throws(list.add.bind(list, {title: 'foo', task: () => {}, skip: 5}), 'Expected property `skip` to be of type `function`, got `number`');
	t.throws(list.add.bind(list, {title: 'foo', task: () => {}, enabled: 5}), 'Expected property `enabled` to be of type `function`, got `number`');
});

test('throw error if task rejects', async t => {
	const list = new Listr([
		{
			title: 'foo',
			task: () => Promise.reject(new Error('foo bar'))
		}
	], {renderer: 'silent'});

	await t.throws(list.run(), 'foo bar');
});

test('throw error if task throws', async t => {
	const list = new Listr([
		{
			title: 'foo',
			task: () => {
				throw new Error('foo bar');
			}
		}
	], {renderer: 'silent'});

	await t.throws(list.run(), 'foo bar');
});

test('throw error if task skip rejects', async t => {
	const list = new Listr([
		{
			title: 'foo',
			skip: () => Promise.reject(new Error('skip foo')),
			task: () => {}
		}
	], {renderer: 'silent'}, {renderer: 'silent'});

	await t.throws(list.run(), 'skip foo');
});

test('throw error if task skip throws', async t => {
	const list = new Listr([
		{
			title: 'foo',
			skip: () => {
				throw new Error('skip foo');
			},
			task: () => {}
		}
	], {renderer: 'silent'});

	await t.throws(list.run(), 'skip foo');
});

test('execute tasks', async t => {
	const list = new Listr([
		{
			title: 'foo',
			task: () => Promise.resolve('bar')
		}
	], {renderer: 'silent'});

	await t.notThrows(list.run());
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

test('context', async t => {
	const list = new Listr([
		{
			title: 'foo',
			task: context => {
				context.foo = 'bar';
			}
		},
		{
			title: 'unicorn',
			task: context => {
				t.is(context.foo, 'bar');
			}
		}
	]);

	const result = await list.run();

	t.deepEqual(result, {
		foo: 'bar'
	});
});

test('subtask context', async t => {
	const list = new Listr([
		{
			title: 'foo',
			task: () => {
				return new Listr([
					{
						title: 'subfoo',
						task: context => {
							t.is(context.foo, 'bar');
							context.fiz = 'biz';
						}
					}
				]);
			}
		},
		{
			title: 'bar',
			task: context => {
				t.is(context.fiz, 'biz');
			}
		}
	]);

	const result = await list.run({foo: 'bar'});

	t.deepEqual(result, {
		foo: 'bar',
		fiz: 'biz'
	});
});

test('context is attached to error object', async t => {
	const list = new Listr([
		{
			title: 'foo',
			task: context => {
				context.foo = 'bar';
			}
		},
		{
			title: 'unicorn',
			task: () => Promise.reject(new Error('foo bar'))
		}
	]);

	try {
		await list.run();
		t.fail('Should throw error');
	} catch (err) {
		t.is(err.message, 'foo bar');
		t.deepEqual(err.context, {
			foo: 'bar'
		});
	}
});
