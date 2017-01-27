import {serial as test} from 'ava';
import Listr from '../';
import SimpleRenderer from './fixtures/simple-renderer';
import {testOutput} from './fixtures/utils';

test('do not run disabled tasks', async t => {
	const list = new Listr([
		{
			title: 'foo',
			task: () => Promise.resolve()
		},
		{
			title: 'bar',
			enabled: ctx => ctx.run === true,
			task: () => Promise.resolve()
		}
	], {
		renderer: SimpleRenderer
	});

	testOutput(t, [
		'foo [started]',
		'foo [completed]',
		'done'
	]);

	await list.run();
});

test('run enabled task', async t => {
	const list = new Listr([
		{
			title: 'foo',
			task: (ctx, task) => Promise.reject(new Error('Something went wrong'))
				.catch(() => {
					task.skip('It failed');

					ctx.failed = true;
				})
		},
		{
			title: 'bar',
			enabled: ctx => ctx.failed === true,
			task: () => Promise.resolve()
		}
	], {
		renderer: SimpleRenderer
	});

	testOutput(t, [
		'foo [started]',
		'foo [skipped]',
		'> It failed',
		'bar [started]',
		'bar [completed]',
		'done'
	]);

	await list.run();
});
