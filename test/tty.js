import test from 'ava';
import {Observable} from 'rxjs/Observable';
import Listr from '../';
import SimpleRenderer from './fixtures/simple-renderer';
import TTYRenderer from './fixtures/tty-renderer';
import {testOutput} from './fixtures/utils';

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
