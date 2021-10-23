import process from 'node:process';
import test from 'ava';
import {Observable} from 'rxjs';
import Listr from '../index.js';
import SimpleRenderer from './fixtures/simple-renderer.js';
import TTYRenderer from './fixtures/tty-renderer.js';
import {testOutput} from './fixtures/utils.js';

const ttyOutput = [
	'foo [started]',
	'bar [started]',
	'> foo',
	'> bar',
	'bar [completed]',
	'foo [completed]',
	'tty done',
];

const nonTTYOutput = [
	'foo [started]',
	'bar [started]',
	'> foo',
	'> bar',
	'bar [completed]',
	'foo [completed]',
	'done',
];

test('output', async t => {
	const list = new Listr([
		{
			title: 'foo',
			task: () => new Listr([
				{
					title: 'bar',
					task: () => new Observable(observer => {
						observer.next('foo');
						observer.next('bar');
						observer.complete();
					}),
				},
			]),
		},
	], {
		renderer: TTYRenderer,
		nonTTYRenderer: SimpleRenderer,
	});

	testOutput(t, process.stdout.isTTY ? ttyOutput : nonTTYOutput);

	await list.run();
});
