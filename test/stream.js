import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'ava';
import split from 'split';
import Listr from '../index.js';
import SimpleRenderer from './fixtures/simple-renderer.js';
import {testOutput} from './fixtures/utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('output', async t => {
	const list = new Listr([
		{
			title: 'foo',
			task: () => new Listr([
				{
					title: 'bar',
					task: () => fs.createReadStream(path.join(__dirname, 'fixtures/data.txt'), 'utf8').pipe(split(/\r?\n/, null, {trailing: false})),
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
