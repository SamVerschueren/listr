import test from 'ava';
import Listr from '../index.js';
import SimpleRenderer from './fixtures/simple-renderer.js';
import {testOutput} from './fixtures/utils.js';

test('renderer class', async t => {
	const list = new Listr([
		{
			title: 'foo',
			task: () => new Listr([
				{
					title: 'bar',
					task: () => {},
				},
			]),
		},
	], {renderer: SimpleRenderer});

	testOutput(t, [
		'foo [started]',
		'bar [started]',
		'bar [completed]',
		'foo [completed]',
		'done',
	]);

	await list.run();
});
