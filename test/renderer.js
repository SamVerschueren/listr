import test from 'ava';
import Listr from '../';
import SimpleRenderer from './fixtures/simple-renderer';
import {testOutput} from './fixtures/utils';

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
