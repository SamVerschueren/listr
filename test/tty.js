const test = require('ava');
const {Observable} = require('rxjs');
const SimpleRenderer = require('./fixtures/simple-renderer');
const TTYRenderer = require('./fixtures/tty-renderer');
const {testOutput} = require('./fixtures/utils');
const Listr = require('..');

const ttyOutput = [
	'foo [started]',
	'bar [started]',
	'> foo',
	'> bar',
	'bar [completed]',
	'foo [completed]',
	'tty done'
];

const nonTTYOutput = [
	'foo [started]',
	'bar [started]',
	'> foo',
	'> bar',
	'bar [completed]',
	'foo [completed]',
	'done'
];

test('output', async t => {
	const list = new Listr([
		{
			title: 'foo',
			task: () => {
				return new Listr([
					{
						title: 'bar',
						task: () => {
							return new Observable(observer => {
								observer.next('foo');
								observer.next('bar');
								observer.complete();
							});
						}
					}
				]);
			}
		}
	], {
		renderer: TTYRenderer,
		nonTTYRenderer: SimpleRenderer
	});

	testOutput(t, process.stdout.isTTY ? ttyOutput : nonTTYOutput);

	await list.run();
});
