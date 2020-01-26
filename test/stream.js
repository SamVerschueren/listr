const fs = require('fs');
const path = require('path');
const test = require('ava');
const split = require('split');
const SimpleRenderer = require('./fixtures/simple-renderer');
const {testOutput} = require('./fixtures/utils');
const Listr = require('..');

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
