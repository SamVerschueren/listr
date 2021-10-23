import test from 'ava';
import Listr from '../index.js';
import SimpleRenderer from './fixtures/simple-renderer.js';
import {testOutput} from './fixtures/utils.js';

test('renderer class', async t => {
	const list = new Listr([
		{
			title: 'foo',
			task: () => Promise.resolve('bar'),
		},
	], {renderer: SimpleRenderer});

	testOutput(t, [
		'foo [started]',
		'foo [completed]',
		'done',
	]);

	await list.run();
});
