import {serial as test} from 'ava';
import Listr from '..';
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
	const list = new Listr(tasks, {
		renderer: SimpleRenderer
	});

	testOutput(t, [
		'foo [started]',
		'foo [failed]',
		'> Something went wrong',
		'done'
	], 5);

	try {
		await list.run();
	} catch (error) {
		t.is(error.message, 'Something went wrong');
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
	], 8);

	try {
		await list.run();
	} catch (error) {
		t.is(error.message, 'Something went wrong');
		t.is(error.errors.length, 1);
	}
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
						task: () => Promise.reject(new Error('Unicorn failed'))
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
		'> Unicorn failed',
		'rainbow [started]',
		'rainbow [completed]',
		'bar [failed]',
		'baz [started]',
		'baz [completed]',
		'done'
	], 15);

	try {
		await list.run();
	} catch (error) {
		t.is(error.message, 'Something went wrong');
		t.is(error.errors.length, 1);
		t.is(error.errors[0].message, 'Unicorn failed');
	}
});

test('set `exitOnError` to false in root', async t => {
	const list = new Listr([
		{
			title: 'foo',
			task: () => Promise.reject(new Error('Foo failed'))
		},
		{
			title: 'bar',
			task: () => {
				return new Listr([
					{
						title: 'unicorn',
						task: () => Promise.reject(new Error('Unicorn failed'))
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
		'> Foo failed',
		'bar [started]',
		'unicorn [started]',
		'unicorn [failed]',
		'> Unicorn failed',
		'rainbow [started]',
		'rainbow [completed]',
		'bar [failed]',
		'baz [started]',
		'baz [completed]',
		'done'
	], 17);

	try {
		await list.run();
	} catch (error) {
		t.is(error.name, 'ListrError');
		t.is(error.errors.length, 2);
		t.is(error.errors[0].message, 'Foo failed');
		t.is(error.errors[1].message, 'Unicorn failed');
	}
});

test('set `exitOnError` to false in root and true in child', async t => {
	const list = new Listr([
		{
			title: 'foo',
			task: () => Promise.reject(new Error('Foo failed'))
		},
		{
			title: 'bar',
			task: () => {
				return new Listr([
					{
						title: 'unicorn',
						task: () => Promise.reject(new Error('Unicorn failed'))
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
		'> Foo failed',
		'bar [started]',
		'unicorn [started]',
		'unicorn [failed]',
		'> Unicorn failed',
		'bar [failed]',
		'> Unicorn failed',
		'baz [started]',
		'baz [completed]',
		'done'
	], 16);

	try {
		await list.run();
	} catch (error) {
		t.is(error.name, 'ListrError');
		t.is(error.errors.length, 2);
		t.is(error.errors[0].message, 'Foo failed');
		t.is(error.errors[1].message, 'Unicorn failed');
	}
});

test('exit on error throws error object with context', async t => {
	const list = new Listr([
		{
			title: 'foo',
			task: () => Promise.reject(new Error('Foo failed'))
		},
		{
			title: 'bar',
			task: ctx => {
				ctx.foo = 'bar';
			}
		}
	], {
		exitOnError: false,
		renderer: SimpleRenderer
	});

	testOutput(t, [
		'foo [started]',
		'foo [failed]',
		'> Foo failed',
		'bar [started]',
		'bar [completed]',
		'done'
	], 10);

	try {
		await list.run();
	} catch (error) {
		t.is(error.name, 'ListrError');
		t.is(error.errors.length, 1);
		t.is(error.errors[0].message, 'Foo failed');
		t.deepEqual(error.context, {foo: 'bar'});
	}
});
