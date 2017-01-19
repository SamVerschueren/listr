import {serial as test} from 'ava';
import Listr from '../';
import SimpleRenderer from './fixtures/simple-renderer';
import {testOutput} from './fixtures/utils';

test('changing the title during task execution', async t => {
	const list = new Listr([
		{
			title: 'foo',
			task: (ctx, task) => {
				task.title = 'foo bar';
			}
		}
	], {renderer: SimpleRenderer});

	testOutput(t, [
		'foo [started]',
		'foo bar [title changed]',
		'foo bar [completed]',
		'done'
	]);

	await list.run();
});

test('skip task during task execution with no message', async t => {
	const list = new Listr([
		{
			title: 'foo',
			task: (ctx, task) => {
				task.skip();
			}
		}
	], {renderer: SimpleRenderer});

	testOutput(t, [
		'foo [started]',
		'foo [skipped]',
		'done'
	]);

	await list.run();
});

test('skip task during task execution with message', async t => {
	const list = new Listr([
		{
			title: 'foo',
			task: (ctx, task) => {
				task.skip('foo bar');
			}
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
