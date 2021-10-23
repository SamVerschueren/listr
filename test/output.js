import test from 'ava';
import {Observable} from 'rxjs';
import Listr from '../index.js';
import SimpleRenderer from './fixtures/simple-renderer.js';
import {testOutput} from './fixtures/utils.js';

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
	], {renderer: SimpleRenderer});

	testOutput(t, [
		'foo [started]',
		'bar [started]',
		'> foo',
		'> bar',
		'bar [completed]',
		'foo [completed]',
		'done',
	]);

	await list.run();
});
