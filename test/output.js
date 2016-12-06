import test from 'ava';
import {Observable} from 'rxjs/Observable';
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
