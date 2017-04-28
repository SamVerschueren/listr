import {serial as test} from 'ava';
import delay from 'delay';
import Listr from '../';
import SimpleRenderer from './fixtures/simple-renderer';
import {testOutput} from './fixtures/utils';

const tasks = [
	{
		title: 'P1',
		task: () => delay(100)
	},
	{
		title: 'P2',
		task: () => delay(200)
	},
	{
		title: 'P3',
		task: () => delay(300)
	},
	{
		title: 'P4',
		task: () => delay(400)
	}
];

test('run tasks sequentially if concurrency is undefined', async t => {
	const list = new Listr(tasks, {
		renderer: SimpleRenderer
	});

	testOutput(t, [
		'P1 [started]',
		'P1 [completed]',
		'P2 [started]',
		'P2 [completed]',
		'P3 [started]',
		'P3 [completed]',
		'P4 [started]',
		'P4 [completed]',
		'done'
	]);

	await list.run();
});

test('run tasks in parallel if concurrency is true', async t => {
	const list = new Listr(tasks, {
		renderer: SimpleRenderer,
		concurrent: true
	});

	testOutput(t, [
		'P1 [started]',
		'P2 [started]',
		'P3 [started]',
		'P4 [started]',
		'P1 [completed]',
		'P2 [completed]',
		'P3 [completed]',
		'P4 [completed]',
		'done'
	]);

	await list.run();
});

test('run tasks in sequential parallel chunks, if concurrency is a number', async t => {
	const list = new Listr(tasks, {
		renderer: SimpleRenderer,
		concurrent: 2
	});

	testOutput(t, [
		'P1 [started]',
		'P2 [started]',
		'P1 [completed]',
		'P3 [started]',
		'P2 [completed]',
		'P4 [started]',
		'P3 [completed]',
		'P4 [completed]',
		'done'
	]);

	await list.run();
});
