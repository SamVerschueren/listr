import test from 'ava';
import SimpleRenderer from './fixtures/simple-renderer';
import {testOutput} from './fixtures/utils';
import Listr from '..';

test('renderer class', async t => {
	const list = new Listr([
		{
			title: 'foo',
			task: () => Promise.resolve('bar')
		}
	], {renderer: SimpleRenderer});

	testOutput(t, [
		'foo [started]',
		'foo [completed]',
		'done'
	]);

	await list.run();
});
