import * as fs from 'fs';
import * as path from 'path';
import test from 'ava';
import split from 'split';
import Listr from '../';
import SimpleRenderer from './fixtures/simple-renderer';
import {testOutput} from './fixtures/utils';

test('output', async t => {
	const list = new Listr([
		{
			title: 'foo',
			task: () => {
				return new Listr([
					{
						title: 'bar',
						task: () => fs.createReadStream(path.join(__dirname, 'fixtures/data.txt'), 'utf8').pipe(split(/\r?\n/, null, {trailing: false}))
					}
				]);
			}
		}
	], {renderer: SimpleRenderer});

	testOutput(t, [
		'foo [started]',
		'bar [started]',
		'> foo',
		'> bar',
		'bar [completed]',
		'foo [completed]',
		'done'
	]);

	await list.run();
});
