const test = require('ava');
const SimpleRenderer = require('./fixtures/simple-renderer');
const {testOutput} = require('./fixtures/utils');
const Listr = require('..');

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
