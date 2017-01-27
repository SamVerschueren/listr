'use strict';
const Observable = require('rxjs/Observable').Observable;
const logSymbols = require('log-symbols');
const delay = require('delay');
const Listr = require('./');

const renderer = process.argv[2];

const tasks = new Listr([
	{
		title: 'Git',
		task: () => {
			return new Listr([
				{
					title: 'Checking git status',
					task: () => {
						return new Observable(observer => {
							observer.next('foo');

							delay(2000)
								.then(() => {
									observer.next(`bar`);
									return delay(2000);
								})
								.then(() => {
									observer.complete();
								});
						});
					}
				},
				{
					title: 'Checking remote history',
					task: () => delay(2000)
				}
			], {concurrent: true});
		}
	},
	{
		title: 'Install dependencies with Yarn',
		task: (ctx, task) => {
			return delay(2000)
				.then(() => {
					ctx.yarn = false;

					task.title = `${task.title} (or not)`;
					task.skip('Yarn not available');
				});
		}
	},
	{
		title: 'Install dependencies with npm',
		enabled: ctx => ctx.yarn === false,
		task: () => delay(3000)
	},
	{
		title: 'Run tests',
		task: () => delay(2000).then(() => {
			return new Observable(observer => {
				observer.next('clinton && xo && ava');

				delay(2000)
					.then(() => {
						observer.next(`${logSymbols.success} 7 passed`);
						return delay(2000);
					})
					.then(() => {
						observer.complete();
					});
			});
		})
	},
	{
		title: 'Publish package',
		task: () => delay(1000).then(() => {
			throw new Error('Package name already exists');
		})
	}
], {
	renderer
});

tasks.run().catch(err => {
	console.error(err.message);
});
