import test from 'ava';
import SimpleRenderer from './fixtures/simple-renderer';
import {testOutput} from './fixtures/utils';
import Listr from '..';

test('renderer class', async t => {
	const list = new Listr([
		{
			title: 'foo',
			task: () => {
				return new Listr([
					{
						title: 'bar',
						task: () => { }
					}
				]);
			}
		}
	], {renderer: SimpleRenderer});

	testOutput(t, [
		'foo [started]',
		'bar [started]',
		'bar [completed]',
		'foo [completed]',
		'done'
	]);

	await list.run();
});
