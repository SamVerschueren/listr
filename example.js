import process from 'node:process';
import {Observable} from 'rxjs';
import logSymbols from 'log-symbols';
import delay from 'delay';
import Listr from '.';

const renderer = process.argv[2];

const tasks = new Listr([
	{
		title: 'Git',
		task: () => new Listr([
			{
				title: 'Checking git status',
				task: () => new Observable(observer => {
					observer.next('foo');

					delay(2000)
						.then(() => {
							observer.next('bar');
							return delay(2000);
						})
						.then(() => {
							observer.complete();
						});
				}),
			},
			{
				title: 'Checking remote history',
				task: () => delay(2000),
			},
		], {concurrent: true}),
	},
	{
		title: 'Install dependencies with Yarn',
		task: (ctx, task) => delay(2000)
			.then(() => {
				ctx.yarn = false;

				task.title = `${task.title} (or not)`;
				task.skip('Yarn not available');
			}),
	},
	{
		title: 'Install dependencies with npm',
		enabled: ctx => ctx.yarn === false,
		task: () => delay(3000),
	},
	{
		title: 'Run tests',
		task: () => delay(2000).then(() => new Observable(observer => {
			observer.next('clinton && xo && ava');

			delay(2000)
				.then(() => {
					observer.next(`${logSymbols.success} 7 passed`);
					return delay(2000);
				})
				.then(() => {
					observer.complete();
				});
		})),
	},
	{
		title: 'Publish package',
		task: () => delay(1000).then(() => {
			throw new Error('Package name already exists');
		}),
	},
], {
	renderer,
});

tasks.run().catch(error => {
	console.error(error.message);
});
