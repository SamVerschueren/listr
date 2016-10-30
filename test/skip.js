import test from 'ava';
import Listr from '../';
import SimpleRenderer from './fixtures/simple-renderer';
import {testOutput} from './fixtures/utils';

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
	], {renderer: 'silent'});

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
	], {renderer: 'silent'});

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
	], {renderer: 'silent'});

	await list.run();
});

test.serial('skip rendering', async t => {
	const list = new Listr([
		{
			title: 'foo',
			skip: () => 'foo bar',
			task: () => Promise.resolve('bar')
		}
	], {renderer: SimpleRenderer});

	testOutput(t, [
		'foo [started]',
		'foo [skipped]',
		'> foo bar',
		'done'
	]);

	await list.run();
});

test('skip context object', async t => {
	const list = new Listr([
		{
			title: 'foo',
			task: ctx => {
				ctx.foo = 'bar';
			}
		},
		{
			title: 'bar',
			skip: ctx => {
				t.is(ctx.foo, 'bar');
			},
			task: ctx => {
				t.is(ctx.foo, 'bar');
			}
		}
	]);

	await list.run();
});
