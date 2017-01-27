import {serial as test} from 'ava';
import Listr from '../';
import SimpleRenderer from './fixtures/simple-renderer';
import {testOutput} from './fixtures/utils';

const tasks = [
	{
		title: 'foo',
		task: () => Promise.reject(new Error('Something went wrong'))
	},
	{
		title: 'bar',
		task: () => Promise.resolve()
	}
];

test('exit on error', async t => {
	t.plan(5);

	const list = new Listr(tasks, {
		renderer: SimpleRenderer
	});

	testOutput(t, [
		'foo [started]',
		'foo [failed]',
		'> Something went wrong',
		'done'
	]);

	try {
		await list.run();
	} catch (err) {
		t.is(err.message, 'Something went wrong');
	}
});

test('set `exitOnError` to false', async t => {
	const list = new Listr(tasks, {
		exitOnError: false,
		renderer: SimpleRenderer
	});

	testOutput(t, [
		'foo [started]',
		'foo [failed]',
		'> Something went wrong',
		'bar [started]',
		'bar [completed]',
		'done'
	]);

	await list.run();
});

test('set `exitOnError` to false in nested list', async t => {
	const list = new Listr([
		{
			title: 'foo',
			task: () => Promise.resolve()
		},
		{
			title: 'bar',
			task: () => {
				return new Listr([
					{
						title: 'unicorn',
						task: () => Promise.reject(new Error('Something went wrong'))
					},
					{
						title: 'rainbow',
						task: () => Promise.resolve()
					}
				], {
					exitOnError: false
				});
			}
		},
		{
			title: 'baz',
			task: () => Promise.resolve()
		}
	], {
		renderer: SimpleRenderer
	});

	testOutput(t, [
		'foo [started]',
		'foo [completed]',
		'bar [started]',
		'unicorn [started]',
		'unicorn [failed]',
		'> Something went wrong',
		'rainbow [started]',
		'rainbow [completed]',
		'bar [completed]',
		'baz [started]',
		'baz [completed]',
		'done'
	]);

	await list.run();
});

test('set `exitOnError` to false in root', async t => {
	const list = new Listr([
		{
			title: 'foo',
			task: () => Promise.reject(new Error('Something went wrong in foo'))
		},
		{
			title: 'bar',
			task: () => {
				return new Listr([
					{
						title: 'unicorn',
						task: () => Promise.reject(new Error('Something went wrong in unicorn'))
					},
					{
						title: 'rainbow',
						task: () => Promise.resolve()
					}
				]);
			}
		},
		{
			title: 'baz',
			task: () => Promise.resolve()
		}
	], {
		exitOnError: false,
		renderer: SimpleRenderer
	});

	testOutput(t, [
		'foo [started]',
		'foo [failed]',
		'> Something went wrong in foo',
		'bar [started]',
		'unicorn [started]',
		'unicorn [failed]',
		'> Something went wrong in unicorn',
		'rainbow [started]',
		'rainbow [completed]',
		'bar [completed]',
		'baz [started]',
		'baz [completed]',
		'done'
	]);

	await list.run();
});

test('set `exitOnError` to false in root and true in child', async t => {
	const list = new Listr([
		{
			title: 'foo',
			task: () => Promise.reject(new Error('Something went wrong in foo'))
		},
		{
			title: 'bar',
			task: () => {
				return new Listr([
					{
						title: 'unicorn',
						task: () => Promise.reject(new Error('Something went wrong in unicorn'))
					},
					{
						title: 'rainbow',
						task: () => Promise.resolve()
					}
				], {
					exitOnError: true
				});
			}
		},
		{
			title: 'baz',
			task: () => Promise.resolve()
		}
	], {
		exitOnError: false,
		renderer: SimpleRenderer
	});

	testOutput(t, [
		'foo [started]',
		'foo [failed]',
		'> Something went wrong in foo',
		'bar [started]',
		'unicorn [started]',
		'unicorn [failed]',
		'> Something went wrong in unicorn',
		'bar [failed]',
		'> Something went wrong in unicorn',
		'baz [started]',
		'baz [completed]',
		'done'
	]);

	await list.run();
});
