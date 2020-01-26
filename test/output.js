const test = require('ava');
const {Observable} = require('rxjs');
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
